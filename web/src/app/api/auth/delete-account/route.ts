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
    const body = await req.json().catch(() => ({}));
    const targetRole = body?.role as string | undefined;

    // 1. Contract Integrity Check: Verify NO active tuition agreements ('tuition_started') exist
    const [activeParentApps, activeTutorApps] = await Promise.all([
      adminDb.collection('applications')
        .where('parentDocId', '==', uid)
        .where('status', '==', 'tuition_started')
        .get(),
      adminDb.collection('applications')
        .where('tutorDocId', '==', uid)
        .where('status', '==', 'tuition_started')
        .get(),
    ]);

    if (!activeParentApps.empty || !activeTutorApps.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete account while you have an active tuition agreement. Please complete or resolve ongoing tuitions first.',
        },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};
    const currentRoles: string[] = userData.roles || [];

    const isPartialRoleDeletion = Boolean(
      targetRole &&
      currentRoles.length > 1 &&
      currentRoles.includes(targetRole)
    );

    const batch = adminDb.batch();

    if (isPartialRoleDeletion && targetRole === 'teacher') {
      batch.delete(adminDb.collection('tutors').doc(uid));

      const tutorApps = await adminDb.collection('applications').where('tutorDocId', '==', uid).get();
      tutorApps.docs.forEach((doc) => batch.delete(doc.ref));

      const updatedRoles = currentRoles.filter((r) => r !== 'teacher');
      batch.update(userRef, {
        roles: updatedRoles,
        role: updatedRoles[0] || 'student',
        updatedAt: FieldValue.serverTimestamp(),
      });

      await batch.commit();
      return NextResponse.json({ success: true, isFullyDeleted: false, remainingRoles: updatedRoles });
    } else if (isPartialRoleDeletion && targetRole === 'student') {
      batch.delete(adminDb.collection('parents').doc(uid));

      const [studentsSnap, groupsSnap, reqSnap] = await Promise.all([
        adminDb.collection('students').where('parentDocId', '==', uid).get(),
        adminDb.collection('groups').where('parentDocId', '==', uid).get(),
        adminDb.collection('tuition_requests').where('parentDocId', '==', uid).get(),
      ]);

      studentsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      groupsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      reqSnap.docs.forEach((doc) => batch.delete(doc.ref));

      const updatedRoles = currentRoles.filter((r) => r !== 'student');
      batch.update(userRef, {
        roles: updatedRoles,
        role: updatedRoles[0] || 'teacher',
        updatedAt: FieldValue.serverTimestamp(),
      });

      await batch.commit();
      return NextResponse.json({ success: true, isFullyDeleted: false, remainingRoles: updatedRoles });
    }

    // Complete Account Deletion
    const [
      studentsSnap,
      groupsSnap,
      parentAppsSnap,
      tutorAppsSnap,
      tuitionReqSnap,
      referralsSnap1,
      referralsSnap2,
    ] = await Promise.all([
      adminDb.collection('students').where('parentDocId', '==', uid).get(),
      adminDb.collection('groups').where('parentDocId', '==', uid).get(),
      adminDb.collection('applications').where('parentDocId', '==', uid).get(),
      adminDb.collection('applications').where('tutorDocId', '==', uid).get(),
      adminDb.collection('tuition_requests').where('parentDocId', '==', uid).get(),
      adminDb.collection('referrals').where('referrerId', '==', uid).get(),
      adminDb.collection('referrals').where('referredUserId', '==', uid).get(),
    ]);

    studentsSnap.docs.forEach((d) => batch.delete(d.ref));
    groupsSnap.docs.forEach((d) => batch.delete(d.ref));
    parentAppsSnap.docs.forEach((d) => batch.delete(d.ref));
    tutorAppsSnap.docs.forEach((d) => batch.delete(d.ref));
    tuitionReqSnap.docs.forEach((d) => batch.delete(d.ref));
    referralsSnap1.docs.forEach((d) => batch.delete(d.ref));
    referralsSnap2.docs.forEach((d) => batch.delete(d.ref));

    batch.delete(adminDb.collection('parents').doc(uid));
    batch.delete(adminDb.collection('tutors').doc(uid));
    batch.delete(userRef);

    await batch.commit();

    try {
      await adminAuth.deleteUser(uid);
    } catch (err) {
      console.error('Error deleting auth user from Firebase Auth:', err);
    }

    return NextResponse.json({ success: true, isFullyDeleted: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
