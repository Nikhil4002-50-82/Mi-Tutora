import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, tutorDocId, gmeetLink } = body;

    if (!applicationId || !tutorDocId || !gmeetLink) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Strict regex validation for Google Meet link
    const gmeetRegex = /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/;
    if (!gmeetRegex.test(gmeetLink)) {
      return NextResponse.json({ error: 'Invalid Google Meet link format' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Verify application and tutor identity
    const appRef = adminDb.collection('applications').doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appData = appSnap.data();
    if (appData?.tutorDocId !== tutorDocId) {
      return NextResponse.json({ error: 'Unauthorized: You are not the tutor for this application' }, { status: 403 });
    }

    if (appData?.status !== 'demo_scheduled' && appData?.status !== 'tuition_started') {
      return NextResponse.json({ error: 'Cannot save link: Demo is not scheduled yet' }, { status: 400 });
    }

    if (appData?.mode !== 'Online') {
      return NextResponse.json({ error: 'Cannot save link: Class mode is not Online' }, { status: 400 });
    }

    // Save to the privateData vault (using a subcollection so the student cannot read it directly)
    await appRef.collection('privateData').doc('meeting').set({
      gmeetLink,
      updatedAt: new Date()
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Google Meet link securely saved.' });
  } catch (error: any) {
    console.error('Error saving GMeet link:', error);
    return NextResponse.json({ error: error.message || 'Failed to save link' }, { status: 500 });
  }
}
