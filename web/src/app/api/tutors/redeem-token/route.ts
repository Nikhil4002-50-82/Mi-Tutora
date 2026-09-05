import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/utils/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = await getAdminAuth();
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const tutorRef = adminDb.collection('tutors').doc(uid);

    const result = await adminDb.runTransaction(async (transaction) => {
      const tutorSnap = await transaction.get(tutorRef);
      if (!tutorSnap.exists) {
        throw new Error('TUTOR_NOT_FOUND');
      }

      const data = tutorSnap.data() || {};
      const bankedTokens = data.bankedTokens || 0;
      if (bankedTokens <= 0) {
        throw new Error('NO_BANKED_TOKENS');
      }

      const weeklyQuota = data.weeklyQuota || {};
      const tokensUsed = weeklyQuota.tokensUsed || 0;
      if (tokensUsed <= 0) {
        throw new Error('QUOTA_ALREADY_FULL');
      }

      transaction.update(tutorRef, {
        bankedTokens: FieldValue.increment(-1),
        'weeklyQuota.tokensUsed': FieldValue.increment(-1),
        'weeklyQuota.lastUpdated': FieldValue.serverTimestamp(),
      });

      return {
        remainingBankedTokens: bankedTokens - 1,
        newTokensUsed: tokensUsed - 1,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error redeeming token:', error);
    const msg = error.message;
    if (msg === 'TUTOR_NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Tutor profile not found' }, { status: 404 });
    }
    if (msg === 'NO_BANKED_TOKENS') {
      return NextResponse.json({ success: false, error: 'You do not have any banked tokens to redeem.' }, { status: 400 });
    }
    if (msg === 'QUOTA_ALREADY_FULL') {
      return NextResponse.json({ success: false, error: 'Your weekly token quota is already full. No redemption needed.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
