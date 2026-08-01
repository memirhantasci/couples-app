"use client";

import { useTransition, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Trash2, Edit2, X, Save } from "lucide-react";
import { deleteDailyNoteAction, editDailyNoteAdminAction } from "@/actions/notes";
import { deleteLetterAction, editLetterAdminAction } from "@/actions/letters";
import { deleteCalendarNoteAdminAction, editCalendarNoteAdminAction } from "@/actions/meetings";

export function DeleteDailyNoteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bu günlük notu silmek istediğine emin misin?")) return;
    
    startTransition(async () => {
      const result = await deleteDailyNoteAction(id);
      if (result.error) toast.error(result.error);
      else toast.success("Günlük not başarıyla silindi.");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
      style={{
        background: "rgba(232,0,45,0.15)",
        color: "#ff4d4d",
        border: "1px solid rgba(232,0,45,0.2)",
      }}
    >
      <Trash2 size={18} />
      {isPending ? "Siliniyor..." : "Sil"}
    </button>
  );
}

export function DeleteLetterButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bu mektubu silmek istediğine emin misin?")) return;
    
    startTransition(async () => {
      const result = await deleteLetterAction(id);
      if (result.error) toast.error(result.error);
      else toast.success("Mektup başarıyla silindi.");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
      style={{
        background: "rgba(232,0,45,0.1)",
        color: "#d32f2f",
        border: "1px solid rgba(232,0,45,0.2)",
      }}
    >
      <Trash2 size={18} />
      {isPending ? "Siliniyor..." : "Mektubu Sil"}
    </button>
  );
}

export function DeleteCalendarEventButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bu takvim etkinliğini silmek istediğine emin misin?")) return;
    
    startTransition(async () => {
      const result = await deleteCalendarNoteAdminAction(id);
      if (result.error) toast.error(result.error);
      else toast.success("Etkinlik başarıyla silindi.");
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
      style={{
        background: "rgba(232,0,45,0.15)",
        color: "#ff4d4d",
        border: "1px solid rgba(232,0,45,0.2)",
      }}
    >
      <Trash2 size={18} />
      {isPending ? "Siliniyor..." : "Etkinliği Sil"}
    </button>
  );
}

export function EditDailyNoteModal({ id, currentContent }: { id: number, currentContent: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Not boş olamaz.");
    startTransition(async () => {
      const result = await editDailyNoteAdminAction(id, content);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Not güncellendi.");
        setIsOpen(false);
      }
    });
  };

  const inputStyle = { width: "100%", padding: "14px", borderRadius: "14px", background: "var(--surface-1)", border: "1.5px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "rgba(255,255,255,0.7)", marginBottom: "6px", display: "block" };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
        style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <Edit2 size={18} /> Düzenle
      </button>

      {mounted && isOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.70)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setIsOpen(false)}>
          <div style={{ width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "var(--surface-2)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 48px rgba(0,0,0,0.5)", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIsOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px" }}>
              <X size={16} />
            </button>
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Edit2 size={20} style={{ color: "var(--gs-red)" }} /> Notu Düzenle
            </h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>İçerik</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required style={{ ...inputStyle, height: "160px", resize: "none" }} />
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <button type="submit" disabled={isPending} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: isPending ? "rgba(255,255,255,0.1)" : "var(--gs-red)", color: isPending ? "rgba(255,255,255,0.3)" : "white", border: "none", fontWeight: 700, fontSize: "14px", cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Save size={18} /> {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function EditLetterModal({ id, currentContent }: { id: number, currentContent: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Mektup içeriği boş olamaz.");
    startTransition(async () => {
      const result = await editLetterAdminAction(id, content);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Mektup güncellendi.");
        setIsOpen(false);
      }
    });
  };

  const inputStyle = { width: "100%", padding: "14px", borderRadius: "14px", background: "var(--surface-1)", border: "1.5px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "rgba(255,255,255,0.7)", marginBottom: "6px", display: "block" };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
        style={{ background: "rgba(0,0,0,0.05)", color: "#000000", border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <Edit2 size={18} /> Düzenle
      </button>

      {mounted && isOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.70)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setIsOpen(false)}>
          <div style={{ width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "var(--surface-2)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 48px rgba(0,0,0,0.5)", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIsOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px" }}>
              <X size={16} />
            </button>
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Edit2 size={20} style={{ color: "var(--gs-red)" }} /> Mektubu Düzenle
            </h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>İçerik</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required style={{ ...inputStyle, height: "160px", resize: "none" }} />
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <button type="submit" disabled={isPending} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: isPending ? "rgba(255,255,255,0.1)" : "var(--gs-red)", color: isPending ? "rgba(255,255,255,0.3)" : "white", border: "none", fontWeight: 700, fontSize: "14px", cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Save size={18} /> {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function EditCalendarEventModal({ id, currentContent }: { id: number, currentContent: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Not boş olamaz.");
    startTransition(async () => {
      const result = await editCalendarNoteAdminAction(id, content);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Etkinlik güncellendi.");
        setIsOpen(false);
      }
    });
  };

  const inputStyle = { width: "100%", padding: "14px", borderRadius: "14px", background: "var(--surface-1)", border: "1.5px solid var(--border-default)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "rgba(255,255,255,0.7)", marginBottom: "6px", display: "block" };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
        style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <Edit2 size={18} /> Düzenle
      </button>

      {mounted && isOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.70)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setIsOpen(false)}>
          <div style={{ width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "var(--surface-2)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 48px rgba(0,0,0,0.5)", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIsOpen(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px" }}>
              <X size={16} />
            </button>
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Edit2 size={20} style={{ color: "var(--gs-red)" }} /> Etkinliği Düzenle
            </h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>İçerik</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required style={{ ...inputStyle, height: "160px", resize: "none" }} />
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <button type="submit" disabled={isPending} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: isPending ? "rgba(255,255,255,0.1)" : "var(--gs-red)", color: isPending ? "rgba(255,255,255,0.3)" : "white", border: "none", fontWeight: 700, fontSize: "14px", cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <Save size={18} /> {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
