import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb, getAdminAuth } from '@/utils/firebase/admin';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = await getAdminAuth();
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      useWallet = false
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    // LIVE MODE: Cryptographic Verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      return NextResponse.json({ success: false, error: 'Razorpay secret is not configured.' }, { status: 500 });
    }

    // The signature is essentially an HMAC SHA256 of "order_id|payment_id"
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const paymentsRef = adminDb.collection('payments');
    const q = paymentsRef.where('razorpayOrderId', '==', razorpay_order_id).limit(1);
    const snap = await q.get();

    if (generated_signature !== razorpay_signature) {
      // Log failed attempt
      if (!snap.empty) {
        await snap.docs[0].ref.update({ status: 'failed', updatedAt: new Date() });
      }
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    if (snap.empty) {
      return NextResponse.json({ error: 'Order ID not found in secure ledger.' }, { status: 404 });
    }

    const paymentDoc = snap.docs[0];
    const paymentData = paymentDoc.data();

    // Prevent Replay Attacks: If already processed and marked paid, return success immediately
    if (paymentData.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    // Secure ownership: Ensure the user verifying the payment owns the ledger record
    if (paymentData.userId && paymentData.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized: Payment does not belong to this user' }, { status: 403 });
    }

    // SECURE: Strictly derive application ID, role, and removal flag from ledger record
    const verifiedApplicationId = paymentData.applicationDocId;
    if (!verifiedApplicationId) {
      return NextResponse.json({ error: 'No application associated with this payment order.' }, { status: 400 });
    }

    const verifiedRole = paymentData.type === 'demo' ? 'teacher' : 'student';
    const verifiedIsRemoval = Boolean(paymentData.isRemoval);
    const appRef = adminDb.collection('applications').doc(verifiedApplicationId);

    // Payment is 100% authentic. Perform secure backend database update.
    await processDatabaseUpdate(adminDb, appRef, verifiedApplicationId, verifiedRole, verifiedIsRemoval, razorpay_order_id, razorpay_payment_id, useWallet);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}

// Reusable function to handle the complex DB logic that the frontend used to do
async function processDatabaseUpdate(adminDb: any, appRef: any, applicationId: string, role: string, isRemoval: boolean, orderId: string, paymentId: string, useWallet: boolean) {
    const batch = adminDb.batch();
    
    // 1. Update the ledger
    const paymentsRef = adminDb.collection('payments');
    const q = paymentsRef.where('razorpayOrderId', '==', orderId).limit(1);
    const snap = await q.get();
    
    if (!snap.empty) {
        batch.update(snap.docs[0].ref, {
            status: 'paid',
            razorpayPaymentId: paymentId,
            updatedAt: new Date()
        });
    } else {
        // SECURITY PATCH: Do not blindly accept unknown order IDs
        throw new Error("Order ID not found in secure ledger. Payment rejected.");
    }

    // Fetch app data to execute logic
    const appSnap = await appRef.get();
    const appData = appSnap.data();
    if (!appData) throw new Error("Application data missing");

    // 2. Handle Wallet Deductions Securely
    const paymentData = snap.docs[0].data();
    if (paymentData.walletDiscountApplied > 0) {
        const userId = role === 'student' ? appData?.parentDocId : appData?.tutorDocId;
        
        if (userId) {
            batch.update(adminDb.collection('users').doc(userId), {
                walletBalance: FieldValue.increment(-paymentData.walletDiscountApplied)
            });
        }
    }

    // 3. Update the Application Document securely (bypassing the rules)
    if (role === 'student') {
        if (isRemoval) {
            batch.update(appRef, {
                status: 'declined',
                feePaid: true,
                updatedAt: Date.now()
            });
        } else {
            batch.update(appRef, {
                status: 'tuition_started',
                feePaid: true,
                updatedAt: Date.now()
            });

            // Mark tracker as paid
            const pendingFeeRef = adminDb.collection('pending_tuition_fees').doc(applicationId);
            batch.update(pendingFeeRef, {
                status: 'paid',
                paidAt: FieldValue.serverTimestamp()
            });

            // Process Referrals on full payment
            try {
                const rewardBase = appData.finalPrice || appData.currentOffer || appData.budget || 4000;
                const rewardAmount = Math.round(rewardBase * 0.25);
                const studentUid = appData.parentDocId;
                const teacherUid = appData.tutorDocId;

                const processReferral = async (referredUid: string) => {
                    if (!referredUid) return;
                    const refSnap = await adminDb.collection('referrals')
                        .where('referredUserId', '==', referredUid)
                        .where('status', '==', 'pending')
                        .get();
                    
                    if (!refSnap.empty) {
                        const refDoc = refSnap.docs[0];
                        const refData = refDoc.data();
                        const referrerId = refData.referrerId;
                        
                        if (refData.referralType === 'teacher') {
                            batch.update(adminDb.collection('referrals').doc(refDoc.id), {
                                status: 'qualified',
                                reward: 0,
                                rewardType: 'banked_token',
                                qualifiedAt: FieldValue.serverTimestamp()
                            });
                            batch.update(adminDb.collection('tutors').doc(referrerId), {
                                bankedTokens: FieldValue.increment(1)
                            });
                        } else {
                            batch.update(adminDb.collection('referrals').doc(refDoc.id), {
                                status: 'qualified',
                                reward: rewardAmount,
                                qualifiedAt: FieldValue.serverTimestamp()
                            });
                            batch.update(adminDb.collection('users').doc(referrerId), {
                                walletBalance: FieldValue.increment(rewardAmount)
                            });
                        }
                    }
                };

                await Promise.all([
                    processReferral(studentUid),
                    processReferral(teacherUid)
                ]);
            } catch (rewardErr) {
                console.error('Failed to process referral rewards in payment verification:', rewardErr);
            }
            
            // Auto-decline competing apps logic for this specific group/student
            const qGroupId = appData.groupDocId || appData.studentDocId;
            if (qGroupId) {
                const query1 = adminDb.collection('applications').where('groupDocId', '==', qGroupId);
                const query2 = adminDb.collection('applications').where('studentDocId', '==', qGroupId);
                
                const [snap1, snap2] = await Promise.all([query1.get(), query2.get()]);
                const docsToProcess = new Map();
                snap1.docs.forEach((d: any) => docsToProcess.set(d.id, d));
                snap2.docs.forEach((d: any) => docsToProcess.set(d.id, d));
                
                for (const [docId, docSnap] of Array.from(docsToProcess.entries())) {
                     if (docId !== applicationId && docSnap.data().status !== 'declined' && docSnap.data().status !== 'tuition_started') {
                        batch.update(adminDb.collection('applications').doc(docId), {
                            status: 'declined',
                            updatedAt: FieldValue.serverTimestamp()
                        });
                        
                        const d = docSnap.data();
                        if (d.tutorDocId) {
                            batch.update(adminDb.collection('tutors').doc(d.tutorDocId), { 
                                pendingRequests: FieldValue.arrayRemove(docId) 
                            });
                        }
                     }
                }
            }
        }
    } else if (role === 'teacher') {
        batch.update(appRef, {
            status: 'demo_booking_phase',
            demoPaymentPaid: true,
            updatedAt: Date.now()
        });
    }

    await batch.commit();
}
