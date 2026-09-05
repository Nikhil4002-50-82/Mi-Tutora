import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/**
 * Scheduled Cloud Function running every hour.
 * Scans applications in 'waiting_for_parent_decision' that have exceeded
 * the strict 48-hour hiring window, auto-expires them, and unlocks teacher/student slots.
 */
export const expireDemosAndDecisions = onSchedule(
  {
    schedule: "0 * * * *", // Every hour
    timeZone: "Asia/Kolkata",
    retryCount: 2,
  },
  async () => {
    const db = admin.firestore();
    const now = Date.now();

    const pendingSnap = await db
      .collection("applications")
      .where("status", "==", "waiting_for_parent_decision")
      .get();

    if (pendingSnap.empty) {
      return;
    }

    console.log(`[expireDemosAndDecisions] Found ${pendingSnap.size} decisions to inspect.`);

    const batch = db.batch();
    let expiredCount = 0;

    for (const docSnap of pendingSnap.docs) {
      const app = docSnap.data();
      const completedTime =
        app.demoCompletedAt?.toMillis?.() ||
        app.updatedAt?.toMillis?.() ||
        app.demoCompletedAt ||
        app.updatedAt ||
        0;

      // Check if 48 hours have elapsed
      if (completedTime > 0 && now - completedTime > FORTY_EIGHT_HOURS_MS) {
        expiredCount++;

        // 1. Mark application as expired
        batch.update(docSnap.ref, {
          status: "expired",
          expiredReason: "parent_48h_decision_window_elapsed",
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 2. Free up teacher pending slot
        if (app.tutorDocId) {
          batch.update(db.collection("tutors").doc(app.tutorDocId), {
            pendingRequests: admin.firestore.FieldValue.arrayRemove(docSnap.id),
          });
        }

        // 3. Free up student pending slots
        const studentIds = app.studentDocIds || (app.studentDocId ? [app.studentDocId] : []);
        for (const sid of studentIds) {
          batch.update(db.collection("students").doc(sid), {
            pendingRequests: admin.firestore.FieldValue.arrayRemove(docSnap.id),
          });
        }
      }
    }

    if (expiredCount > 0) {
      await batch.commit();
      console.log(`[expireDemosAndDecisions] Successfully auto-expired ${expiredCount} stale demo decisions.`);
    }
  }
);
