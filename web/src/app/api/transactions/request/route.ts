import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generateCustomId } from '@/utils/idGenerator';
export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await req.json();
    const { 
        role, 
        userId, 
        tutor, 
        groupToUse, 
        tutorPrice, 
        preferredTimeRange,
        offerPrice,
        teacherName,
        studentData,
        actionType
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Verify 7-day Lock
    let qGroupId = '';
    let tutorId = '';

    if (role === 'student') {
        qGroupId = groupToUse.id;
        tutorId = tutor.id;
    } else {
        qGroupId = studentData.id;
        tutorId = userId;
    }

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    const query1 = await adminDb.collection('applications')
        .where('tutorDocId', '==', tutorId)
        .where('groupDocId', '==', qGroupId)
        .where('status', '==', 'declined')
        .get();

    const query2 = await adminDb.collection('applications')
        .where('tutorDocId', '==', tutorId)
        .where('studentDocId', '==', qGroupId)
        .where('status', '==', 'declined')
        .get();

    const checkDocs = [...query1.docs, ...query2.docs];
    for (const doc of checkDocs) {
        const data = doc.data();
        const declinedAt = data.declinedAt?.toMillis ? data.declinedAt.toMillis() : data.declinedAt;
        if (declinedAt && declinedAt > sevenDaysAgo) {
            return NextResponse.json({ success: false, error: 'This user is currently locked. You cannot send a request.' }, { status: 403 });
        }
    }

    // 2. Perform Request Creation
    const batch = adminDb.batch();
    const appRef = adminDb.collection('applications').doc();

    if (role === 'student') {
        const parentRef = adminDb.collection('parents').doc(userId);
        const parentSnap = await parentRef.get();
        const parentData = parentSnap.data() || {};
        
        const today = new Date().toISOString().split('T')[0];
        const currentDailyCount = parentData.dailyUsage?.date === today ? parentData.dailyUsage.count : 0;
        
        if (currentDailyCount >= 5) {
            return NextResponse.json({ success: false, error: 'DAILY_LIMIT_EXCEEDED' }, { status: 403 });
        }

        batch.set(appRef, {
            applicationId: generateCustomId('MTA'),
            tutorDocId: tutor.id,
            tutorName: tutor.name,
            parentDocId: userId,
            groupDocId: groupToUse.id,
            studentDocIds: groupToUse.students ? groupToUse.students.map((s: any) => s.id) : [groupToUse.id],
            studentName: groupToUse.name,
            currentOffer: actionType === 'make_offer' ? offerPrice : tutorPrice,
            finalPrice: actionType === 'make_offer' ? offerPrice : tutorPrice,
            initialBudget: tutorPrice > 0 ? tutorPrice : (offerPrice || 500),
            absoluteMin: tutorPrice > 0 ? Math.ceil(tutorPrice * 0.6) : Math.ceil((offerPrice || 500) * 0.6),
            absoluteMax: tutorPrice > 0 ? tutorPrice : (offerPrice || 500),
            initiator: 'student',
            lastUpdatedBy: 'student',
            status: actionType === 'make_offer' ? 'negotiating' : 'demo_requested_by_student',
            source: 'direct',
            category: tutor.category || groupToUse.category || '',
            mode: tutor.mode,
            demoHours: preferredTimeRange || 'Flexible',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        batch.update(parentRef, {
            dailyUsage: { date: today, count: currentDailyCount + 1, lastUpdated: FieldValue.serverTimestamp() }
        });

    } else if (role === 'teacher') {
        const tutorRef = adminDb.collection('tutors').doc(userId);
        const tutorSnap = await tutorRef.get();
        const tutorData = tutorSnap.data() || {};
        
        const isSubscribedFlags = tutorData.subscriptionPlan === 'pro' || tutorData.isSubscribed;
        const hasValidExpiry = tutorData.subscriptionExpiry ? tutorData.subscriptionExpiry > Date.now() : false;
        const isPro = isSubscribedFlags && hasValidExpiry;
        const teacherLimit = isPro ? 15 : 5;
        
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        const currentWeekStart = d.toISOString().split('T')[0];
        
        let currentTokens = 0;
        if (tutorData.weeklyQuota?.weekStartDate === currentWeekStart) {
            currentTokens = tutorData.weeklyQuota.tokensUsed || 0;
        }
        
        if (currentTokens >= teacherLimit) {
            return NextResponse.json({ success: false, error: 'WEEKLY_QUOTA_EXCEEDED' }, { status: 403 });
        }

        const studentDocIds = studentData.students ? studentData.students.map((s:any)=>s.id) : [studentData.id];

        batch.set(appRef, {
            applicationDocId: appRef.id,
            applicationId: generateCustomId('MTA'),
            tutorDocId: userId,
            tutorName: teacherName,
            requestDocId: '',
            parentDocId: studentData.parentDocId || studentData.parentId,
            studentDocId: studentData.students?.[0]?.id || studentData.id,
            groupDocId: studentData.id,
            studentDocIds: studentDocIds,
            studentName: studentData.name,
            currentOffer: offerPrice,
            finalPrice: offerPrice,
            initialBudget: studentData.budget || offerPrice,
            absoluteMin: studentData.budget || offerPrice,
            absoluteMax: studentData.budget ? Math.floor(studentData.budget * 1.4) : Math.floor(offerPrice * 1.4),
            initiator: 'teacher',
            lastUpdatedBy: actionType === 'make_offer' ? 'teacher' : 'tutor',
            status: actionType === 'make_offer' ? 'negotiating' : 'demo_requested_by_teacher',
            source: 'direct',
            category: studentData.category || 'general',
            mode: studentData.mode || tutorData.mode || 'Online',
            demoHours: (studentData.students ? studentData.students[0]?.hoursPerDay : (studentData.hoursPerDay || studentData.preferredTimeRange)) || 'Flexible',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        batch.update(tutorRef, {
            weeklyQuota: {
                weekStartDate: currentWeekStart,
                tokensUsed: currentTokens + 1,
                lastUpdated: FieldValue.serverTimestamp()
            }
        });
    }

    await batch.commit();
    return NextResponse.json({ success: true, appId: appRef.id });

  } catch (error: any) {
    console.error('Error in request transaction:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
