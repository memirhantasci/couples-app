"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { createMeetingAction, deactivateMeetingAction } from "@/actions/meetings";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Heart } from "lucide-react";
import { EditMeetingModal } from "./EditMeetingModal";

interface Meeting {
  id: number;
  meeting_datetime: string;
  title: string | null;
  is_active: boolean;
  user_id?: number | null;
}

interface MeetingManagerProps {
  meetings: Meeting[];
  currentUserId: number;
}

export function MeetingManager({ meetings, currentUserId }: MeetingManagerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: { error?: string; success?: boolean } = {};
  
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await createMeetingAction(prev, formData);
      if (result.success) {
        toast.success("Buluşma başarıyla planlandı! 📍");
        formRef.current?.reset();
        setShowAddModal(false);
      } else if (result.error) {
        toast.error(result.error);
      }
      return result;
    },
    initialState
  );

  async function handleDeactivate(id: number) {
    if (!confirm("Buluşmayı iptal etmek istediğine emin misin?")) return;
    
    const result = await deactivateMeetingAction(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Buluşma iptal edildi.");
  }

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-white text-lg">Aktif Buluşmalar</h3>

        {meetings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {meetings.map((meeting) => {
              const isCreator = meeting.user_id === currentUserId;
              const isPast = new Date(meeting.meeting_datetime) < new Date();
              
              return (
                <div
                  key={meeting.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4"
                  style={{
                    background: meeting.is_active && !isPast ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    opacity: meeting.is_active ? 1 : 0.5,
                  }}
                >
                  <div>
                    <p className="font-bold text-white text-lg flex items-center gap-2">
                      {meeting.title || "Buluşma"}
                      {isPast && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50 uppercase tracking-wider">Geçmiş</span>}
                      {!meeting.is_active && <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded text-red-400 uppercase tracking-wider">İptal Edildi</span>}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 4 }}>
                      {new Date(meeting.meeting_datetime).toLocaleString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  
                  {isCreator && meeting.is_active && !isPast && (
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => setEditingMeeting(meeting)}
                        className="p-3 rounded-xl transition-colors bg-white/5 hover:bg-white/10 text-white/70"
                        title="Düzenle"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(meeting.id)}
                        className="p-3 rounded-xl transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        title="İptal Et"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div 
            className="p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center" 
            style={{ 
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,215,0,0.3)",
              boxShadow: "0 0 15px rgba(255,215,0,0.05)"
            }}
          >
            <div className="relative">
               <Heart size={32} className="text-yellow-500 absolute -top-3 -right-3" fill="currentColor" />
               <div className="w-12 h-12 border-2 border-yellow-500 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                 <div className="bg-yellow-500 w-full h-3 absolute top-0"></div>
                 <span className="font-bold text-yellow-500 mt-2 text-xl">...</span>
               </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 8 }}>
              Henüz aktif bir buluşma planlanmadı.
            </p>
          </div>
        )}

        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 flex items-center justify-center gap-2 py-4 rounded-xl text-[15px] font-bold tracking-wide transition-all active:scale-95"
          style={{ 
            background: "linear-gradient(90deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
            color: "#1a1114",
            boxShadow: "0 4px 15px rgba(255,215,0,0.3)"
          }}
        >
          <Plus size={20} />
          Buluşma Ekle
        </button>
      </div>

      {editingMeeting && (
        <EditMeetingModal
          meeting={editingMeeting}
          onClose={() => setEditingMeeting(null)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-sm p-6 rounded-2xl" 
            style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Yeni Buluşma Planla</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-white/60">
                  Başlık
                </label>
                <input 
                  name="title" 
                  type="text" 
                  placeholder="Akşam Yemeği 🍕" 
                  className="w-full bg-[#2c2c2e] text-white text-[15px] py-3.5 px-4 rounded-xl outline-none" 
                  style={{ border: "1px solid #ef4444", boxShadow: "0 0 10px rgba(239,68,68,0.2)" }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-white/60">
                  Tarih & Saat
                </label>
                <div className="relative">
                  <input 
                    name="meeting_datetime" 
                    type="datetime-local" 
                    min={minDateTime} 
                    required 
                    className="w-full bg-[#2c2c2e] text-white text-[15px] py-3.5 pl-4 pr-10 rounded-xl outline-none" 
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffd700] pointer-events-none">
                    📅
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={isPending} className="w-full py-3.5 mt-4 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: "linear-gradient(90deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
                  color: "#1a1114",
                  boxShadow: "0 4px 15px rgba(255,215,0,0.3)"
                }}
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
                ) : (
                  <><Plus size={20} /> Planla</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
