import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAdminDb } from '@/utils/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, role, useWallet = false } = body;

    if (!applicationId || !role) {
      return NextResponse.json({ error: 'Missing applicationId or role' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Securely fetch the true cost from the database
    const appRef = adminDb.collection('applications').doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appData = appSnap.data();
    
    // Determine the base price based on role and what exists in the document
    let coursePrice = 4000; // Fallback
    
    if (role === 'teacher') {
        // Teacher is paying the platform demo fee, we MUST calculate it from marketplace pricing securely
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
        // Student is paying the full tuition fee
        if (appData) {
            coursePrice = appData.finalPrice || appData.currentOffer || appData.budget || 4000;
        }
    }

    // Calculate total including 18% GST
    let totalToPay = coursePrice + Math.round(coursePrice * 0.18);
    
    // If the user requested to use their wallet balance, deduct it securely
    if (useWallet) {
        let parentDocId = appData?.parentDocId;
        let tutorDocId = appData?.tutorDocId;
        
        let userId = role === 'student' ? parentDocId : tutorDocId;
        
        if (userId) {
            const userSnap = await adminDb.collection('users').doc(userId).get();
            if (userSnap.exists) {
                const walletBalance = userSnap.data()?.walletBalance || 0;
                if (walletBalance > 0) {
                    const discount = Math.min(totalToPay, walletBalance);
                    totalToPay -= discount;
                }
            }
        }
    }

    // Razorpay operates in paise (multiply by 100)
    const amountInPaise = totalToPay * 100;

    // SIMULATION MODE: If credentials are missing, instantly return a mock order
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('RAZORPAY credentials not found. Returning MOCK order.');
      const mockOrderId = `mock_order_${Date.now()}`;
      
      await adminDb.collection('payments').add({
        razorpayOrderId: mockOrderId,
        applicationId,
        userId: role === 'student' ? appData?.parentDocId : appData?.tutorDocId,
        amount: totalToPay,
        currency: 'INR',
        status: 'created',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        id: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        mockMode: true,
      });
    }

    // LIVE MODE: Create an actual Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${applicationId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Create an initial entry in the payments collection
    await adminDb.collection('payments').add({
      razorpayOrderId: order.id,
      applicationId,
      userId: role === 'student' ? appData?.parentDocId : appData?.tutorDocId,
      amount: totalToPay,
      currency: 'INR',
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
