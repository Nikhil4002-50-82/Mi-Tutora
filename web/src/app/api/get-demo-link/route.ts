import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, parentDocId } = body;

    if (!applicationId || !parentDocId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Verify application and student identity
    const appRef = adminDb.collection('applications').doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appData = appSnap.data();
    if (appData?.parentDocId !== parentDocId) {
      return NextResponse.json({ error: 'Unauthorized: You are not the student/parent for this application' }, { status: 403 });
    }

    if (appData?.status !== 'demo_scheduled' && appData?.status !== 'tuition_started') {
      return NextResponse.json({ error: 'Cannot retrieve link: Demo is not scheduled yet' }, { status: 400 });
    }

    // Verify Time Lock
    if (!appData?.demoDate || !appData?.demoTime) {
      return NextResponse.json({ error: 'Demo date and time are not fully set' }, { status: 400 });
    }

    // Parse the demo datetime (e.g. "2024-05-10" and "16:30")
    // Assuming IST timezone since it's an Indian platform. Or just use local Date if the server is in the same zone.
    // For safety, assuming the inputs are standard local time.
    const demoDateTimeStr = `${appData.demoDate}T${appData.demoTime}:00`;
    const demoDateObj = new Date(demoDateTimeStr);
    
    // Allow entry 5 minutes before
    const allowedEntryTime = new Date(demoDateObj.getTime() - 5 * 60 * 1000);
    const now = new Date();

    if (now < allowedEntryTime) {
      return NextResponse.json({ 
        error: 'Too early to join. The link will unlock 5 minutes before the scheduled time.',
        serverTime: now.toISOString(),
        unlockTime: allowedEntryTime.toISOString()
      }, { status: 403 });
    }

    // Fetch the link from the vault
    const meetingSnap = await appRef.collection('privateData').doc('meeting').get();
    if (!meetingSnap.exists) {
      return NextResponse.json({ error: 'The tutor has not added a Google Meet link yet. Please check back shortly.' }, { status: 404 });
    }

    const meetingData = meetingSnap.data();
    const finalLink = meetingData?.meetingLink || meetingData?.gmeetLink;
    if (!finalLink) {
      return NextResponse.json({ error: 'Meeting link is empty.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, link: finalLink });
  } catch (error: any) {
    console.error('Error retrieving GMeet link:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve link' }, { status: 500 });
  }
}
