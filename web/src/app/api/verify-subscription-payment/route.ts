import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb, getAdminAuth } from '@/utils/firebase/admin';
import * as admin from 'firebase-admin';

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
      razorpay_signature
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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

    // Prevent Replay Attacks
    if (paymentData.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Subscription already verified' });
    }

    // Secure ownership: Ensure the user verifying the payment is the intended subscriber
    const verifiedUserId = paymentData.userId;
    if (verifiedUserId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized: Subscription does not belong to this user' }, { status: 403 });
    }

    // Payment is 100% authentic. Perform secure backend database update.
    await processSubscriptionUpdate(adminDb, verifiedUserId, razorpay_order_id, razorpay_payment_id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error verifying subscription payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify subscription payment' }, { status: 500 });
  }
}

async function processSubscriptionUpdate(adminDb: any, userId: string, orderId: string, paymentId: string) {
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
        throw new Error("Order ID not found in secure ledger. Payment rejected.");
    }

    // 2. Update the Tutor Document
    const tutorRef = adminDb.collection('tutors').doc(userId);
    const tutorSnap = await tutorRef.get();
    
    if (!tutorSnap.exists) {
        throw new Error("Tutor profile not found.");
    }

    const { Timestamp, FieldValue } = await import('firebase-admin/firestore');
    
    const oneMonthMillis = 30 * 24 * 60 * 60 * 1000; 
    const expiryDate = Timestamp.now().toMillis() + oneMonthMillis;

    batch.update(tutorRef, {
        subscriptionPlan: 'pro',
        isSubscribed: true,
        subscriptionExpiry: expiryDate,
        subscriptionUpdatedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();
}
