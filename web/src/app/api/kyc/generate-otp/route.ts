import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/utils/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { aadharNumber } = body;

    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber.replace(/\s+/g, ''))) {
      return NextResponse.json({ error: 'Invalid Aadhar Number. Must be 12 digits.' }, { status: 400 });
    }

    const cleanAadhar = aadharNumber.replace(/\s+/g, '');
    const POWERAPI_KEY = process.env.POWERAPI_KEY;

    // SIMULATION MODE (Mock Fallback)
    if (!POWERAPI_KEY) {
      console.log('[KYC MOCK] No PowerAPI key found. Running mock generation for Aadhar:', cleanAadhar);
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        reference_id: 'mock_ref_' + Date.now(),
        message: 'Mock OTP sent successfully. (Use 123456 to verify)',
        _mockAadhar: cleanAadhar // pass this back so the next step can securely mask it if needed
      });
    }

    // REAL POWERAPI INTEGRATION
    // Once you get your PowerAPI key, the real HTTP request logic goes here:
    /*
    const response = await fetch('https://api.powerapi.com/v1/aadhar/generate-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POWERAPI_KEY}`
      },
      body: JSON.stringify({ aadhar_number: cleanAadhar })
    });
    const data = await response.json();
    
    if (!response.ok || !data.success) {
       return NextResponse.json({ error: data.message || 'Failed to generate OTP' }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      reference_id: data.reference_id,
      message: 'OTP sent successfully.'
    });
    */
    
    return NextResponse.json({ error: 'Real PowerAPI integration is pending implementation.' }, { status: 501 });

  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
