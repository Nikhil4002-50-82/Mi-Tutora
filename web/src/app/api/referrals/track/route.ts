import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }

    const body = await req.json();
    const { action = 'track', referralCode, refereeUid, refereeName, role } = body;

    if (action === 'sync_name') {
      if (!refereeUid || !refereeName) {
        return NextResponse.json({ success: false, error: 'Missing referee details' }, { status: 400 });
      }

      const refSnap = await adminDb.collection('referrals').where('referredUserId', '==', refereeUid).get();
      const batch = adminDb.batch();
      refSnap.docs.forEach((d) => {
        batch.update(d.ref, { referredUserName: refereeName });
      });
      await batch.commit();

      return NextResponse.json({ success: true });
    }

    // Default action: 'track'
    if (!referralCode || !refereeUid) {
      return NextResponse.json({ success: false, error: 'Missing required referral fields' }, { status: 400 });
    }

    const cleanCode = referralCode.trim().toUpperCase();

    // Check referrer in users collection
    const userQuery = await adminDb.collection('users').where('referralCode', '==', cleanCode).limit(1).get();
    if (userQuery.empty) {
      return NextResponse.json({ success: false, error: 'Invalid referral code' }, { status: 404 });
    }

    const referrerDoc = userQuery.docs[0];
    const referrerData = referrerDoc.data();

    // Prevent self-referral
    if (referrerDoc.id === refereeUid || referrerData.id === refereeUid) {
      return NextResponse.json({ success: false, error: 'Self-referral is not allowed' }, { status: 400 });
    }

    // Check if referee already has a referral ticket (prevent duplicates)
    const existingRef = await adminDb.collection('referrals').where('referredUserId', '==', refereeUid).limit(1).get();
    if (!existingRef.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'Referral already recorded',
        referrerName: referrerData.name || '' 
      });
    }

    // Create the referral record via Admin SDK
    const newRef = await adminDb.collection('referrals').add({
      referrerId: referrerDoc.id,
      referrerName: referrerData.name || 'Referrer',
      referredUserId: refereeUid,
      referredUserName: refereeName || '',
      referralCode: cleanCode,
      referralType: role || 'student',
      status: 'pending',
      estimatedReward: 0,
      createdAt: Date.now()
    });

    return NextResponse.json({
      success: true,
      referralId: newRef.id,
      referrerName: referrerData.name || ''
    });

  } catch (error: any) {
    console.error('Error in /api/referrals/track:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
