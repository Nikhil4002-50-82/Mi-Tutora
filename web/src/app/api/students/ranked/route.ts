import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/utils/firebase/admin';
import { rankAndPaginateStudents } from '@/utils/matching';

/**
 * Server API Route: POST /api/students/ranked
 * Mirrors getRankedStudents Cloud Function in Next.js App Router for SSR / local fallback.
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
    const body = await req.json().catch(() => ({}));
    const {
      tab = 'recommended',
      page = 1,
      limit = 20,
      category,
    } = body;

    // 1. Fetch Teacher profile
    let teacherData: any = null;
    let tutorId = uid;

    const tutorDocSnap = await adminDb.collection('tutors').doc(uid).get();
    if (tutorDocSnap.exists) {
      teacherData = tutorDocSnap.data();
      tutorId = tutorDocSnap.id;
    } else {
      const tutorQuerySnap = await adminDb
        .collection('tutors')
        .where('authUid', '==', uid)
        .limit(1)
        .get();
      if (!tutorQuerySnap.empty) {
        teacherData = tutorQuerySnap.docs[0].data();
        tutorId = tutorQuerySnap.docs[0].id;
      }
    }

    if (!teacherData) {
      return NextResponse.json({ success: false, error: 'Teacher profile not found' }, { status: 404 });
    }

    // 2. Fetch available students, groups, and teacher applications in parallel
    const [studentsSnap, groupsSnap, applicationsSnap] = await Promise.all([
      adminDb.collection('students').where('isAvailable', '==', true).limit(300).get(),
      adminDb.collection('groups').limit(150).get(),
      adminDb.collection('applications').where('tutorDocId', '==', tutorId).get(),
    ]);

    const groupsMap = new Map<string, any>();
    groupsSnap.docs.forEach((doc: any) => {
      groupsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // 3. Stitch group preferences into student records
    const stitchedStudents = studentsSnap.docs.map((doc: any) => {
      const sData = doc.data() as any;
      const groupDocId = sData.groupDocId || sData.id;
      const matchingGroup = groupsMap.get(groupDocId);

      return {
        id: doc.id,
        ...sData,
        requestDoc: matchingGroup || null,
        teacherGenderPreference:
          matchingGroup?.teacherGenderPreference ||
          sData.teacherGenderPreference ||
          'No Preference',
      };
    });

    const applications = applicationsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 4. Score, sort globally, and slice 20 cards per page
    const result = rankAndPaginateStudents(teacherData, stitchedStudents, applications, {
      tab: tab === 'all' ? 'all' : 'recommended',
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      category,
      teacherUserId: uid,
    });

    return NextResponse.json({
      success: true,
      students: result.students,
      totalMatches: result.totalMatches,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error: any) {
    console.error('Error fetching ranked students:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
