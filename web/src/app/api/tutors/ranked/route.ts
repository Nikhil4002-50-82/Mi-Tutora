import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/utils/firebase/admin';
import { rankAndPaginateTutors } from '@/utils/matching';

/**
 * Server API Route: POST /api/tutors/ranked
 * Mirrors getRankedTutors Cloud Function in Next.js App Router for SSR / local fallback.
 * Guarantees that Rank #1 is always Card #1 on Page 1.
 */
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
    const userEmail = decodedToken.email || '';

    const body = await req.json().catch(() => ({}));
    let {
      scoringContext,
      activeGroupId,
      tab = 'recommended',
      page = 1,
      limit = 20,
      category,
    } = body;

    // 1. Resolve scoring context from database if not supplied by client
    if (!scoringContext || Object.keys(scoringContext).length === 0) {
      let groupData: any = null;
      if (activeGroupId) {
        const groupSnap = await adminDb.collection('groups').doc(activeGroupId).get();
        if (groupSnap.exists) {
          groupData = groupSnap.data();
        }
      }

      if (!groupData) {
        const studentSnap = await adminDb
          .collection('students')
          .where('parentDocId', '==', uid)
          .limit(1)
          .get();
        if (!studentSnap.empty) {
          groupData = studentSnap.docs[0].data();
        }
      }

      scoringContext = groupData || {};
    }

    // 2. Query candidate tutors and user's applications in parallel
    const [tutorsSnap, applicationsSnap] = await Promise.all([
      adminDb.collection('tutors').where('hasProfile', '==', true).limit(300).get(),
      adminDb.collection('applications').where('parentDocId', '==', uid).get(),
    ]);

    const rawTutors = tutorsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const applications = applicationsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Score, sort, and slice top 20 cards
    const result = rankAndPaginateTutors(scoringContext, rawTutors, applications, {
      tab: tab === 'all' ? 'all' : 'recommended',
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      category,
      studentUserId: uid,
      studentUserEmail: userEmail,
      activeGroupId,
    });

    return NextResponse.json({
      success: true,
      tutors: result.tutors,
      totalMatches: result.totalMatches,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error: any) {
    console.error('Error fetching ranked tutors:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
