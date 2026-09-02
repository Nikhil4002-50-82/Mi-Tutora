import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference_id, otp, tutorDocId, _mockAadhar } = body;

    if (!reference_id || !otp || !tutorDocId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const POWERAPI_KEY = process.env.POWERAPI_KEY;

    let verificationSuccessful = false;
    let maskedAadhar = '';

    // SIMULATION MODE (Mock Fallback)
    if (!POWERAPI_KEY) {
      console.log('[KYC MOCK] Verifying OTP:', otp);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate latency
      
      if (otp === '123456') {
        verificationSuccessful = true;
        // Generate a secure mask of the aadhar passed from step 1
        const aadharStr = _mockAadhar || '000000000000';
        const last4 = aadharStr.slice(-4);
        maskedAadhar = `XXXX-XXXX-${last4}`;
      } else {
        return NextResponse.json({ error: 'Invalid OTP. For mock testing, use 123456.' }, { status: 400 });
      }
    } else {
      // REAL POWERAPI INTEGRATION
      /*
      const response = await fetch('https://api.powerapi.com/v1/aadhar/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POWERAPI_KEY}`
        },
        body: JSON.stringify({ reference_id, otp })
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
         return NextResponse.json({ error: data.message || 'Invalid OTP' }, { status: 400 });
      }
      
      verificationSuccessful = true;
      // In real API, data.aadhaar_data.aadhaar_number might be returned or already masked
      const rawAadhar = data.aadhaar_data?.aadhaar_number || '0000';
      maskedAadhar = `XXXX-XXXX-${rawAadhar.slice(-4)}`;
      */
      return NextResponse.json({ error: 'Real PowerAPI integration is pending implementation.' }, { status: 501 });
    }

    if (verificationSuccessful) {
      // Save the success to the tutor's main document for ranking and badging
      const tutorRef = adminDb.collection('tutors').doc(tutorDocId);
      await tutorRef.set({
        aadharVerified: true,
        maskedAadhar: maskedAadhar,
        kycUpdatedAt: new Date()
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Aadhar Verified successfully',
        maskedAadhar
      });
    }

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
