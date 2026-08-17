import { db } from '@/utils/firebase/client';
import { doc, runTransaction, arrayRemove, collection, getDocs, query, where, writeBatch, increment } from 'firebase/firestore';
import { syncStudentAvailability } from '@/utils/studentAvailability';

export const executeDeclineOffer = async (appId: string, role: 'student' | 'teacher', data?: any) => {
  await runTransaction(db, async (transaction) => {
    const appRef = doc(db, 'applications', appId);
    const appSnap = await transaction.get(appRef);
    
    if (!appSnap.exists()) {
      throw new Error("Application not found.");
    }
    
    const appData = appSnap.data();
    
    if (appData.status === 'declined') {
      throw new Error("This request has already been declined or canceled by the other party.");
    }
    
    transaction.update(appRef, {
      status: 'declined',
      declinedAt: Date.now(),
      updatedAt: Date.now(),
      lastUpdatedBy: role
    });
    
    if (appData.tutorDocId) {
      transaction.update(doc(db, 'tutors', appData.tutorDocId), { pendingRequests: arrayRemove(appId) });
    }
    if (appData.studentDocIds) {
      for (const sid of appData.studentDocIds) {
        transaction.update(doc(db, 'students', sid), { pendingRequests: arrayRemove(appId) });
      }
    }
  });

  if (data?.applications) {
    const appDataSync = data.applications.find((a: any) => a.id === appId);
    if (appDataSync) {
      await syncStudentAvailability(db, appDataSync.studentDocIds || [appDataSync.studentDocId]).catch(console.error);
    }
  }
};

export const executeAppointTutor = async (appId: string, data?: any) => {
  const batch = writeBatch(db);
  
  batch.update(doc(db, 'applications', appId), { 
    status: 'tuition_started', 
    startDate: Date.now(),
    feePaid: false
  });
  
  const app = data?.applications?.find((a: any) => a.id === appId);
  if (app) {
    if (app.tutorDocId) batch.update(doc(db, 'tutors', app.tutorDocId), { pendingRequests: arrayRemove(appId) });
    if (app.studentDocIds) {
      for (const sid of app.studentDocIds) {
        batch.update(doc(db, 'students', sid), { pendingRequests: arrayRemove(appId) });
      }
    }
    
    const qGroupId = app.groupDocId || app.studentDocId;
    if (qGroupId) {
      const otherAppsSnap1 = await getDocs(query(collection(db, 'applications'), where('groupDocId', '==', qGroupId)));
      const otherAppsSnap2 = await getDocs(query(collection(db, 'applications'), where('studentDocId', '==', qGroupId)));
      
      const docsToProcess = new Map();
      otherAppsSnap1.docs.forEach(d => docsToProcess.set(d.id, d));
      otherAppsSnap2.docs.forEach(d => docsToProcess.set(d.id, d));
      
      for (const [docId, docSnap] of Array.from(docsToProcess.entries())) {
         if (docId !== appId && docSnap.data().status !== 'declined' && docSnap.data().status !== 'tuition_started') {
            batch.update(doc(db, 'applications', docId), {
               status: 'declined',
               reason: 'student_hired_another_tutor',
               declinedAt: Date.now(),
               updatedAt: Date.now()
            });
            const d = docSnap.data();
            if (d.tutorDocId) {
               batch.update(doc(db, 'tutors', d.tutorDocId), { pendingRequests: arrayRemove(docId) });
            }
         }
      }
    }
  }
  
  await batch.commit();
  
  if (app) {
    try {
      const rewardBase = app.finalPrice || app.currentOffer || app.budget || 4000;
      const rewardAmount = Math.round(rewardBase * 0.25);
      
      const studentUid = data?.user?.uid;
      const teacherUid = app.tutorDocId;
      
      const processReferral = async (referredUid: string) => {
        if (!referredUid) return;
        const q = query(collection(db, 'referrals'), where('referredUserId', '==', referredUid), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const refDoc = snap.docs[0];
          const referrerId = refDoc.data().referrerId;
          const refBatch = writeBatch(db);
          refBatch.update(doc(db, 'referrals', refDoc.id), { status: 'qualified', reward: rewardAmount, qualifiedAt: Date.now() });
          refBatch.update(doc(db, 'users', referrerId), { walletBalance: increment(rewardAmount) });
          await refBatch.commit();
        }
      };
      
      await Promise.all([
        processReferral(studentUid),
        processReferral(teacherUid)
      ]);
    } catch (rewardErr) {
      console.error('Failed to process referral rewards:', rewardErr);
    }
    
    await syncStudentAvailability(db, app.studentDocIds || [app.studentDocId]).catch(console.error);
  }
};
