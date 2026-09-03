import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/utils/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Authorization: Verify Secret or Admin Token
    const authHeader = req.headers.get('authorization');
    const cronSecretHeader = req.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'mitutora_payout_secret';

    let isAuthorized = false;
    if (cronSecretHeader && cronSecretHeader === expectedSecret) {
      isAuthorized = true;
    } else if (authHeader?.startsWith('Bearer ')) {
      const adminAuth = await getAdminAuth();
      if (adminAuth) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
          if (decodedToken) isAuthorized = true;
        } catch (e) {
          // Token invalid
        }
      }
    }

    if (!isAuthorized && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    // -------------------------------------------------------------------------
    // 1. PROCESS TUTOR PAYOUTS (60% First-Month Tuition Share)
    // -------------------------------------------------------------------------
    const tutorSnapshot = await adminDb.collection('tutor_payouts')
      .where('status', 'in', ['escrow_held', 'action_required_missing_upi'])
      .get();

    const results: any[] = [];
    const batch = adminDb.batch();
    let batchCount = 0;

    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const razorpayAccount = process.env.RAZORPAYX_ACCOUNT_NUMBER;
    const hasRazorpayX = !!(razorpayKey && razorpaySecret && razorpayAccount);
    const authString = hasRazorpayX ? Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString('base64') : '';

    for (const docSnap of tutorSnapshot.docs) {
      const payout = docSnap.data();
      const releaseEligibleAt = payout.releaseEligibleAt || 0;

      // Only process if Day 30 has arrived
      if (now < releaseEligibleAt) {
        continue;
      }

      let targetVpa = payout.payoutVpa || '';

      // If missing in payout doc, check if tutor updated their profile upiId
      if (!targetVpa && payout.tutorDocId) {
        const tutorSnap = await adminDb.collection('tutors').doc(payout.tutorDocId).get();
        if (tutorSnap.exists) {
          targetVpa = tutorSnap.data()?.upiId || '';
        }
      }

      if (!targetVpa) {
        batch.update(docSnap.ref, {
          status: 'action_required_missing_upi',
          updatedAt: FieldValue.serverTimestamp()
        });
        batchCount++;
        results.push({ id: docSnap.id, type: 'tutor', status: 'action_required_missing_upi' });
        continue;
      }

      if (hasRazorpayX) {
        try {
          const payoutPayload = {
            account_number: razorpayAccount,
            amount: Math.round(payout.tutorShareAmount * 100), // paise
            currency: 'INR',
            mode: 'UPI',
            purpose: 'payout',
            fund_account: {
              account_type: 'vpa',
              vpa: { address: targetVpa },
              contact: {
                name: payout.tutorName || 'Tutor',
                type: 'vendor'
              }
            },
            queue_if_low_balance: true,
            reference_id: `PAYOUT_TUTOR_${docSnap.id}`
          };

          const rpRes = await fetch('https://api.razorpay.com/v1/payouts', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payoutPayload)
          });

          const rpData = await rpRes.json();
          if (rpRes.ok) {
            batch.update(docSnap.ref, {
              status: rpData.status === 'processed' ? 'paid' : 'processing',
              payoutVpa: targetVpa,
              razorpayPayoutId: rpData.id || '',
              utrNumber: rpData.utr || '',
              paidAt: rpData.status === 'processed' ? FieldValue.serverTimestamp() : null,
              updatedAt: FieldValue.serverTimestamp()
            });
            batchCount++;
            results.push({ id: docSnap.id, type: 'tutor', status: 'disbursed_via_api', payoutId: rpData.id });
          } else {
            console.error('RazorpayX Tutor Payout Error:', rpData);
            batch.update(docSnap.ref, {
              status: 'ready_for_payout',
              payoutVpa: targetVpa,
              updatedAt: FieldValue.serverTimestamp()
            });
            batchCount++;
            results.push({ id: docSnap.id, type: 'tutor', status: 'ready_for_payout_queued' });
          }
        } catch (apiErr) {
          console.error('Failed to call RazorpayX API for tutor:', apiErr);
          batch.update(docSnap.ref, {
            status: 'ready_for_payout',
            payoutVpa: targetVpa,
            updatedAt: FieldValue.serverTimestamp()
          });
          batchCount++;
          results.push({ id: docSnap.id, type: 'tutor', status: 'ready_for_payout_api_fallback' });
        }
      } else {
        batch.update(docSnap.ref, {
          status: 'ready_for_payout',
          payoutVpa: targetVpa,
          updatedAt: FieldValue.serverTimestamp()
        });
        batchCount++;
        results.push({ id: docSnap.id, type: 'tutor', status: 'ready_for_payout' });
      }
    }

    // -------------------------------------------------------------------------
    // 2. PROCESS REFERRAL REWARD PAYOUTS (25% Platform Cut for Student Referrers)
    // -------------------------------------------------------------------------
    const referralSnapshot = await adminDb.collection('referrals')
      .where('status', '==', 'qualified')
      .where('rewardType', '==', 'wallet_cash')
      .where('payoutStatus', 'in', ['escrow_held', 'action_required_missing_upi'])
      .get();

    for (const refSnap of referralSnapshot.docs) {
      const refData = refSnap.data();
      const releaseEligibleAt = refData.releaseEligibleAt || 0;
      const rewardAmount = refData.reward || 0;

      if (rewardAmount <= 0) continue;

      // Only process if Day 30 has arrived
      if (now < releaseEligibleAt) {
        continue;
      }

      let targetVpa = refData.payoutVpa || '';

      // If missing in referral doc, check if referrer updated their profile upiId (check users and tutors)
      if (!targetVpa && refData.referrerId) {
        const userSnap = await adminDb.collection('users').doc(refData.referrerId).get();
        if (userSnap.exists) {
          targetVpa = userSnap.data()?.upiId || '';
        }
        if (!targetVpa) {
          const tutorSnap = await adminDb.collection('tutors').doc(refData.referrerId).get();
          if (tutorSnap.exists) {
            targetVpa = tutorSnap.data()?.upiId || '';
          }
        }
      }

      if (!targetVpa) {
        batch.update(refSnap.ref, {
          payoutStatus: 'action_required_missing_upi'
        });
        batchCount++;
        results.push({ id: refSnap.id, type: 'referrer', status: 'action_required_missing_upi' });
        continue;
      }

      if (hasRazorpayX) {
        try {
          const payoutPayload = {
            account_number: razorpayAccount,
            amount: Math.round(rewardAmount * 100), // paise
            currency: 'INR',
            mode: 'UPI',
            purpose: 'payout',
            fund_account: {
              account_type: 'vpa',
              vpa: { address: targetVpa },
              contact: {
                name: refData.referrerName || 'Student Referrer',
                type: 'customer'
              }
            },
            queue_if_low_balance: true,
            reference_id: `PAYOUT_REF_${refSnap.id}`
          };

          const rpRes = await fetch('https://api.razorpay.com/v1/payouts', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payoutPayload)
          });

          const rpData = await rpRes.json();
          if (rpRes.ok) {
            batch.update(refSnap.ref, {
              payoutStatus: rpData.status === 'processed' ? 'paid' : 'processing',
              payoutVpa: targetVpa,
              razorpayPayoutId: rpData.id || '',
              utrNumber: rpData.utr || '',
              paidAt: rpData.status === 'processed' ? FieldValue.serverTimestamp() : null
            });
            batchCount++;
            results.push({ id: refSnap.id, type: 'referrer', status: 'disbursed_via_api', payoutId: rpData.id });
          } else {
            console.error('RazorpayX Referrer Payout Error:', rpData);
            batch.update(refSnap.ref, {
              payoutStatus: 'ready_for_payout',
              payoutVpa: targetVpa
            });
            batchCount++;
            results.push({ id: refSnap.id, type: 'referrer', status: 'ready_for_payout_queued' });
          }
        } catch (apiErr) {
          console.error('Failed to call RazorpayX API for referrer:', apiErr);
          batch.update(refSnap.ref, {
            payoutStatus: 'ready_for_payout',
            payoutVpa: targetVpa
          });
          batchCount++;
          results.push({ id: refSnap.id, type: 'referrer', status: 'ready_for_payout_api_fallback' });
        }
      } else {
        batch.update(refSnap.ref, {
          payoutStatus: 'ready_for_payout',
          payoutVpa: targetVpa
        });
        batchCount++;
        results.push({ id: refSnap.id, type: 'referrer', status: 'ready_for_payout' });
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      processed: batchCount,
      results
    });

  } catch (error: any) {
    console.error('Error in /api/payouts/process:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
