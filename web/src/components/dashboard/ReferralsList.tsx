import React from 'react';
import { Users, GraduationCap, BookOpen, CheckCircle2, Clock } from 'lucide-react';

interface Referral {
  id: string;
  referredUserName?: string;
  referralType?: string;
  status?: string;
  estimatedReward?: number;
}

interface ReferralsListProps {
  referrals: Referral[];
}

export function ReferralsList({ referrals }: ReferralsListProps) {
  return (
    <div>
      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-600" /> Your Referrals
      </h3>
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {(referrals?.length ?? 0) > 0 ? (
          <ul className="divide-y divide-slate-100">
            {referrals?.map((ref) => (
              <li key={ref.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-lg shadow-inner">
                    {(ref.referredUserName?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">{ref.referredUserName || 'Unknown User'}</p>
                    <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 capitalize">
                      {ref.referralType === 'teacher' ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      {ref.referralType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                    ref.status === 'rewarded' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {ref.status === 'rewarded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {ref.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {ref.status}
                  </span>
                  {(ref.estimatedReward ?? 0) > 0 && <p className="text-base font-black text-gray-900">&#8377;{ref.estimatedReward} <span className="text-xs font-bold text-slate-400">Reward</span></p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">No referrals yet</h4>
            <p className="text-slate-500 font-medium max-w-sm">Share your code above with friends to start earning rewards when they join.</p>
          </div>
        )}
      </div>
    </div>
  );
}
