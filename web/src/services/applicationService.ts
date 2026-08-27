import { db, auth } from '@/utils/firebase/client';
import { collection, doc, arrayUnion, arrayRemove, runTransaction, serverTimestamp } from 'firebase/firestore';
import { generateCustomId } from '@/utils/idGenerator';
import { APP_STATUS_ACTIVE } from '@/utils/constants';
import { syncStudentAvailability } from '@/utils/studentAvailability';
import { Student, Tutor, Group, Application } from '@/types/models';

export class ApplicationService {
  /**
   * Teachers use this to send an offer to a student/group.
   */
  static async sendOffer(teacherUid: string, teacherName: string, student: Student, offerPrice: number): Promise<void> {
    const appId = generateCustomId('MTA');
    const appRef = doc(collection(db, 'applications'));
    
    await runTransaction(db, async (transaction) => {
       const tutorRef = doc(db, 'tutors', teacherUid);
       const tutorSnap = await transaction.get(tutorRef);
       const tutorData = tutorSnap.data() || {};
       const today = new Date().toISOString().split('T')[0];
       const currentDailyCount = tutorData.dailyUsage?.date === today ? tutorData.dailyUsage.count : 0;
       
       if (currentDailyCount >= 5) throw new Error("DAILY_LIMIT_EXCEEDED");

       const teacherLimit = tutorData.isSubscribed ? 15 : 5;
       let verifiedCount = 0;
       const orphanedIds: string[] = [];
       const reqIds = (tutorData.pendingRequests || []).slice(0, 30);
       
       if (reqIds.length > 0) {
           const appSnaps = await Promise.all(reqIds.map((id: string) => transaction.get(doc(db, 'applications', id))));
           appSnaps.forEach((appSnap, index) => {
               if (appSnap.exists() && APP_STATUS_ACTIVE.includes(appSnap.data().status)) {
                   verifiedCount++;
               } else {
                   orphanedIds.push(reqIds[index]);
               }
           });
       }
       
       if (verifiedCount >= teacherLimit) throw new Error("TEACHER_QUEUE_FULL");
       
       transaction.set(appRef, {
          applicationId: appId,
          tutorDocId: teacherUid,
          tutorName: teacherName,
          requestDocId: '',
          parentDocId: student.parentDocId || student.parentId,
          studentDocId: student.students?.[0]?.id || student.id,
          groupDocId: student.id,
          studentDocIds: student.students ? student.students.map((s:any)=>s.id) : [student.id],
          studentName: student.name,
          currentOffer: offerPrice,
          initialBudget: student.budget || offerPrice,
          absoluteMin: student.budget || offerPrice,
          absoluteMax: student.budget ? Math.floor(student.budget * 1.4) : Math.floor(offerPrice * 1.4),
          initiator: 'teacher',
          lastUpdatedBy: 'teacher',
          status: 'negotiating',
          source: 'direct',
          category: student.category || 'general',
          demoHours: (student.students ? student.students[0]?.hoursPerDay : (student.hoursPerDay || student.preferredTimeRange)) || 'Flexible',
          createdAt: serverTimestamp()
       });

       transaction.update(tutorRef, {
          dailyUsage: { date: today, count: currentDailyCount + 1, lastUpdated: serverTimestamp() }
       });
       
       if (orphanedIds.length > 0) {
          transaction.update(tutorRef, { pendingRequests: arrayRemove(...orphanedIds) });
       }
       transaction.update(tutorRef, { pendingRequests: arrayUnion(appRef.id) });
       
       const studentIdsToUpdate = student.students ? student.students.map((s:any)=>s.id) : [student.id];
       for (const sid of studentIdsToUpdate) {
          transaction.update(doc(db, 'students', sid), { pendingRequests: arrayUnion(appRef.id) });
       }
    });

    const syncIds = student.students ? student.students.map((s:any)=>s.id) : [student.id];
    await syncStudentAvailability(db, syncIds).catch(console.error);
  }

  /**
   * Students use this to request a tutor (send an initial offer).
   */
  static async requestTutor(studentUid: string, group: Group, tutor: Tutor, offerPrice: number, tutorPrice: number, demoHours: string): Promise<void> {
    const appId = generateCustomId('MTA');
    const appRef = doc(collection(db, 'applications'));
    
    await runTransaction(db, async (transaction) => {
       const parentRef = doc(db, 'parents', studentUid);
       const parentSnap = await transaction.get(parentRef);
       const parentData = parentSnap.data() || {};
       const today = new Date().toISOString().split('T')[0];
       const currentDailyCount = parentData.dailyUsage?.date === today ? parentData.dailyUsage.count : 0;
       
       if (currentDailyCount >= 5) throw new Error("DAILY_LIMIT_EXCEEDED");

       const tutorRef = doc(db, 'tutors', tutor.id!);
       const tutorSnap = await transaction.get(tutorRef);
       const tutorData = tutorSnap.data() || {};
       const teacherLimit = tutorData.isSubscribed ? 15 : 5;
       
       let verifiedCount = 0;
       const orphanedIds: string[] = [];
       const reqIds = (tutorData.pendingRequests || []).slice(0, 30);
       
       if (reqIds.length > 0) {
           const appSnaps = await Promise.all(reqIds.map((id: string) => transaction.get(doc(db, 'applications', id))));
           appSnaps.forEach((appSnap, index) => {
               if (appSnap.exists() && APP_STATUS_ACTIVE.includes(appSnap.data().status)) {
                   verifiedCount++;
               } else {
                   orphanedIds.push(reqIds[index]);
               }
           });
       }
       
       if (verifiedCount >= teacherLimit) throw new Error("TEACHER_QUEUE_FULL");
       
       transaction.set(appRef, {
          applicationId: appId,
          tutorDocId: tutor.id,
          tutorName: tutor.name,
          parentDocId: studentUid,
          groupDocId: group.id,
          studentDocIds: group.students ? group.students.map((s: any) => s.id) : [group.id],
          studentName: group.name,
          currentOffer: offerPrice,
          initialBudget: tutorPrice > 0 ? tutorPrice : offerPrice,
          absoluteMin: tutorPrice > 0 ? Math.ceil(tutorPrice * 0.6) : Math.ceil(offerPrice * 0.6),
          absoluteMax: tutorPrice > 0 ? tutorPrice : offerPrice,
          initiator: 'student',
          lastUpdatedBy: 'student',
          status: 'negotiating',
          source: 'direct',
          category: tutor.category || group.category || '',
          mode: tutor.mode,
          demoHours: demoHours,
          createdAt: serverTimestamp()
       });

       transaction.update(parentRef, {
          dailyUsage: { date: today, count: currentDailyCount + 1, lastUpdated: serverTimestamp() }
       });
       
       if (orphanedIds.length > 0) {
          transaction.update(tutorRef, { pendingRequests: arrayRemove(...orphanedIds) });
       }
       transaction.update(tutorRef, { pendingRequests: arrayUnion(appRef.id) });
       if (group.students) {
         for (const s of group.students) {
            transaction.update(doc(db, 'students', s.id), { pendingRequests: arrayUnion(appRef.id) });
         }
       }
    });
  }
}
