import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/utils/firebase/admin';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      applicationId, 
      role, 
      isRemoval,
      useWallet = false
    } = body;

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const appRef = adminDb.collection('applications').doc(applicationId);
    
    // SIMULATION MODE
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('RAZORPAY credentials not found. MOCKING verification.');
      
      if (razorpay_order_id && String(razorpay_order_id).startsWith('mock_order_')) {
         // Proceed with secure DB updates in mock mode
         await processDatabaseUpdate(adminDb, appRef, applicationId, role, isRemoval, razorpay_order_id, 'mock_payment_id', useWallet);
         return NextResponse.json({ success: true, mockMode: true });
      }
      return NextResponse.json({ error: 'Invalid Mock Order' }, { status: 400 });
    }

    // LIVE MODE: Cryptographic Verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    // The signature is essentially an HMAC SHA256 of "order_id|payment_id"
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      // Log failed attempt
      const paymentsRef = adminDb.collection('payments');
      const q = paymentsRef.where('razorpayOrderId', '==', razorpay_order_id).limit(1);
      const snap = await q.get();
      if (!snap.empty) {
        await snap.docs[0].ref.update({ status: 'failed', updatedAt: new Date() });
      }
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Payment is 100% authentic. Perform secure backend database update.
    await processDatabaseUpdate(adminDb, appRef, applicationId, role, isRemoval, razorpay_order_id, razorpay_payment_id, useWallet);

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

    // 2. Handle Wallet Deductions
    if (useWallet) {
        let coursePrice = 4000;
        if (role === 'teacher') {
            const pricingSnap = await adminDb.collection('marketplace_pricing').get();
            const pricingData = pricingSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            let studentsList: any[] = [];
            const studentDocIds = appData?.studentDocIds || [appData?.studentDocId];
            if (studentDocIds.length > 0) {
                for (const sId of studentDocIds) {
                    if (sId) {
                        const studentSnap = await adminDb.collection('students').doc(sId).get();
                        if (studentSnap.exists) studentsList.push({ id: studentSnap.id, ...studentSnap.data() });
                    }
                }
            }
            const { calculateTotalDemoFee } = await import('@/utils/pricing');
            coursePrice = calculateTotalDemoFee(studentsList, pricingData);
        } else {
            coursePrice = appData.finalPrice || appData.currentOffer || appData.budget || 4000;
        }
        
        const totalToPay = coursePrice + Math.round(coursePrice * 0.18);
        const userId = role === 'student' ? appData?.parentDocId : appData?.tutorDocId;
        
        if (userId) {
            const userRef = adminDb.collection('users').doc(userId);
            const userSnap = await userRef.get();
            if (userSnap.exists) {
                const walletBalance = userSnap.data()?.walletBalance || 0;
                if (walletBalance > 0) {
                    const discount = Math.min(totalToPay, walletBalance);
                    batch.update(userRef, {
                        walletBalance: FieldValue.increment(-discount)
                    });
                }
            }
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
                        const referrerId = refDoc.data().referrerId;
                        batch.update(adminDb.collection('referrals').doc(refDoc.id), {
                            status: 'qualified',
                            reward: rewardAmount,
                            qualifiedAt: FieldValue.serverTimestamp()
                        });
                        batch.update(adminDb.collection('users').doc(referrerId), {
                            walletBalance: FieldValue.increment(rewardAmount)
                        });
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
                            updatedAt: Date.now()
                        });
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
