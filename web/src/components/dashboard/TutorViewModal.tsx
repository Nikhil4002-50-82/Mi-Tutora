import React from 'react';
import { User, X, CheckCircle2, TrendingUp, CalendarDays } from 'lucide-react';

interface TutorViewModalProps {
  selectedViewUser: any;
  selectedViewApp: any;
  setSelectedViewUser: (user: any) => void;
  setSelectedViewApp: (app: any) => void;
  data: any;
  activeGroup: any;
  negotiationOffer: Record<string, string>;
  setNegotiationOffer: (offer: Record<string, string>) => void;
  handleRequestTutor: (tutor: any) => Promise<any>;
  handleDirectRequestDemo: (tutor: any) => Promise<any>;
  dailyRequestsCount: number;
  setActionConfirmModal: (modal: any) => void;
  offerLoading?: boolean;
}

export function TutorViewModal({
  selectedViewUser,
  selectedViewApp,
  setSelectedViewUser,
  setSelectedViewApp,
  data,
  activeGroup,
  negotiationOffer,
  setNegotiationOffer,
  handleRequestTutor,
  handleDirectRequestDemo,
  dailyRequestsCount,
  setActionConfirmModal,
  offerLoading
}: TutorViewModalProps) {
  if (!selectedViewUser) return null;

  const getTutorBasePrice = (tutor: any) => {
    if (activeGroup?.students?.length > 1 && tutor.groupFeeRange) return tutor.groupFeeRange;
    return tutor.feeRange || 0;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden">
        <button 
          onClick={() => { setSelectedViewUser(null); setSelectedViewApp(null); }}
          className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="bg-[#00a992] p-8 sm:p-10 text-white flex-shrink-0 relative overflow-hidden">
          <div className="relative z-10 flex items-start gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black backdrop-blur-md shadow-inner border border-white/30">
              {selectedViewUser.name?.charAt(0) || 'T'}
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">{selectedViewUser.name}</h3>
              {selectedViewUser.tutorId && (
                <p className="text-emerald-100 font-mono font-bold mt-1.5 uppercase tracking-wider text-sm bg-black/10 inline-block px-2 py-1 rounded-md border border-white/20 shadow-sm">
                  ID: {selectedViewUser.tutorId}
                </p>
              )}
              <p className="text-emerald-100 font-bold capitalize mt-1 text-lg flex items-center gap-2">
                <User className="w-4 h-4" /> {selectedViewUser.category || 'Tutor'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 overflow-y-auto">
          <div className="space-y-8">
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact & Professional Details
              </h4>
              {(!selectedViewApp || !['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status)) ? (
                <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center">
                  <p className="text-sm font-bold text-orange-600 text-center">Contact details will be revealed once the demo is scheduled.</p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedViewApp && ['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status) && (selectedViewUser.phone || selectedViewUser.whatsapp || selectedViewUser.phoneNumber) && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="font-bold text-gray-800">{selectedViewUser.phone || selectedViewUser.whatsapp || selectedViewUser.phoneNumber}</p>
                  </div>
                )}
                {selectedViewApp && ['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status) && selectedViewUser.email && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-bold text-gray-800 break-all">{selectedViewUser.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p>
                  <p className="font-bold text-gray-800">{selectedViewUser.experience || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Highest Qualification</p>
                  <p className="font-bold text-gray-800">{selectedViewUser.qualification || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Teaching Expertise
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {selectedViewUser.category === 'programming' && (selectedViewUser.technologies?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Technologies</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedViewUser.technologies.map((t: string) => (
                        <span key={t} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedViewUser.category === 'languages' && (selectedViewUser.languagesTaught?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedViewUser.languagesTaught.map((l: string) => (
                        <span key={l} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!selectedViewUser.category || selectedViewUser.category === 'school') && (selectedViewUser.subjects?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subjects</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedViewUser.subjects.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Teaching Approach</p>
                  <p className="font-bold text-gray-800">{selectedViewUser.teachingApproach || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  {selectedViewApp ? (selectedViewApp.status === 'tuition_started' ? 'Agreed Monthly Fee' : 'Amount to be Paid') : 'Total Budget'}
                </p>
                <p className="text-3xl font-black text-emerald-700">₹{selectedViewApp?.finalPrice || selectedViewApp?.currentOffer || selectedViewUser.feeRange || 'Negotiable'}<span className="text-base font-bold text-emerald-600/70">/mo</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Mode & Location</p>
                <p className="font-bold text-emerald-800 capitalize">{selectedViewUser.mode || 'Online'}</p>
                {selectedViewUser.mode?.toLowerCase() !== 'online' && selectedViewUser.locations && (
                  <p className="text-sm font-medium text-emerald-700 mt-1 max-w-[200px] truncate" title={selectedViewUser.locations}>
                    {selectedViewUser.locations || 'Location hidden'}
                  </p>
                )}
              </div>
            </div>

            {selectedViewApp && selectedViewApp.status === 'tuition_started' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex justify-between items-center">
                  Payment Details
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                    {selectedViewApp.paymentHistory?.length || 0} Payments Made
                  </span>
                </h4>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Next Payment Due</p>
                    <p className="font-black text-gray-900 text-lg">
                      {selectedViewApp.nextPaymentDate 
                        ? new Date(selectedViewApp.nextPaymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : new Date(selectedViewApp.updatedAt + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">Payment History</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {selectedViewApp.paymentHistory && selectedViewApp.paymentHistory.length > 0 ? (
                      selectedViewApp.paymentHistory.map((payment: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg hover:border-emerald-200 transition-colors shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">₹{payment.amount?.toLocaleString()}</p>
                              <p className="text-xs font-medium text-slate-500">{new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Paid</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center text-sm font-medium text-gray-500">
                        No past payments found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {selectedViewUser.mode?.toLowerCase() !== 'online' && selectedViewUser.address && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Residential Address
                </h4>
                <p className="font-bold text-gray-800">{selectedViewUser.address}</p>
              </div>
            )}
          </div>

        {/* Actions */}
        {(() => {
          if (selectedViewApp?.status === 'waiting_for_parent_decision') {
            return (
              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => {
                    setActionConfirmModal({ isOpen: true, type: 'hire', appId: selectedViewApp.id, teacherName: selectedViewApp.tutorName || 'the teacher' });
                    setSelectedViewUser(null);
                    setSelectedViewApp(null);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg transform hover:scale-105 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Hire Teacher
                </button>
                <button 
                  onClick={() => {
                    setActionConfirmModal({ isOpen: true, type: 'reject', appId: selectedViewApp.id, teacherName: selectedViewApp.tutorName || 'the teacher' });
                    setSelectedViewUser(null);
                    setSelectedViewApp(null);
                  }}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center"
                >
                  Reject
                </button>
              </div>
            );
          }

          const matchGroup = (app: any) => {
            if (app.groupDocId) return app.groupDocId === activeGroup?.id;
            return activeGroup?.students?.some((s:any) => s.id === app.studentDocId) || false;
          };
          const activeAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
          const hiredAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && app.status === 'tuition_started');
          const hasNegotiation = data?.applications?.some((app: any) => app.tutorDocId === selectedViewUser.id && ['negotiating'].includes(app.status));
          const isPending = data?.applications?.some((app: any) => app.tutorDocId === selectedViewUser.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
          const isHired = data?.applications?.some((app: any) => app.tutorDocId === selectedViewUser.id && ['tuition_started'].includes(app.status));
          const cooldownApp = data?.applications?.find((app: any) => app.tutorDocId === selectedViewUser.id && app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000));
          
          if (isHired || isPending || hasNegotiation || cooldownApp || selectedViewApp || activeAppForGroup || hiredAppForGroup) {
            return (
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                {hiredAppForGroup ? 'A teacher has already been hired for this group.' : (activeAppForGroup && activeAppForGroup.tutorDocId !== selectedViewUser.id ? 'You have an active demo with another tutor for this group.' : 'Currently unavailable for new requests.')}
              </div>
            );
          }
          
          return (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[10px] text-gray-500 leading-tight mb-2">Type a value below to negotiate, or leave empty to request a demo at the original price.</p>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/mo)</label>
                  <input 
                    type="number"
                    min={getTutorBasePrice(selectedViewUser) ? Math.ceil(getTutorBasePrice(selectedViewUser) * 0.6) : 0}
                    max={getTutorBasePrice(selectedViewUser) || undefined}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                    placeholder={getTutorBasePrice(selectedViewUser) ? `e.g. ${getTutorBasePrice(selectedViewUser)}` : "e.g. 500"}
                    value={negotiationOffer[selectedViewUser.id] || ''}
                    onChange={(e) => setNegotiationOffer({...negotiationOffer, [selectedViewUser.id]: e.target.value})}
                  />
                  {getTutorBasePrice(selectedViewUser) > 0 && negotiationOffer[selectedViewUser.id] && parseInt(negotiationOffer[selectedViewUser.id]) >= getTutorBasePrice(selectedViewUser) * 0.6 && parseInt(negotiationOffer[selectedViewUser.id]) <= getTutorBasePrice(selectedViewUser) * 0.7 && (
                    <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite low. The teacher is highly likely to reject it.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {negotiationOffer[selectedViewUser.id] ? (
                    <button 
                      onClick={async () => { 
                        const success = await handleRequestTutor(selectedViewUser); 
                        if (success) setSelectedViewUser(null); 
                      }}
                      className={`flex-1 py-3 px-6 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 shadow-none' : 'bg-[#00a992] hover:bg-[#008f7b] text-white shadow-[#00a992]/20'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Negotiate
                    </button>
                  ) : (
                    <button 
                      onClick={async () => { 
                        const success = await handleDirectRequestDemo(selectedViewUser); 
                        if (success) setSelectedViewUser(null); 
                      }}
                      className={`flex-1 py-3 px-6 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 shadow-none' : 'bg-[#00a992] hover:bg-[#008f7b] text-white shadow-[#00a992]/20'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Request Demo
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        </div>
      </div>
    </div>
  );
}
