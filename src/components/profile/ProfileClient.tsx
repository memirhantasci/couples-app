"use client";

import { useActionState, useState } from "react";
import { User, CalendarHeart, LogOut, Trash2, ShieldAlert, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  updateProfileAction,
  updateCoupleDatesProfileAction,
  logoutAction,
  scheduleAccountDeletionAction,
} from "@/actions/profile";

interface Props {
  initialDisplayName: string;
  initialGender: "male" | "female";
  initialMeetDate: string;
  initialRelationshipStartDate: string;
  deletionScheduledAt: string | null;
  isPaired: boolean;
}

function SectionCard({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(232,0,45,0.12)", color: "#E8002D" }}
          >
            {icon}
          </div>
          <span className="font-bold text-white text-base">{title}</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div
          className="px-5 pb-5 flex flex-col gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 mt-4">
      <label
        htmlFor={name}
        style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontSize: 15,
        }}
      />
    </div>
  );
}

function SuccessError({
  state,
}: {
  state: { success?: string; error?: string } | null;
}) {
  if (!state) return null;
  if (state.success)
    return (
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mt-2"
        style={{
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.25)",
          color: "#4ade80",
        }}
      >
        <CheckCircle size={15} />
        {state.success}
      </div>
    );
  if (state.error)
    return (
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mt-2"
        style={{
          background: "rgba(232,0,45,0.12)",
          border: "1px solid rgba(232,0,45,0.25)",
          color: "#FF4D6A",
        }}
      >
        <ShieldAlert size={15} />
        {state.error}
      </div>
    );
  return null;
}

export function ProfileClient({
  initialDisplayName,
  initialGender,
  initialMeetDate,
  initialRelationshipStartDate,
  deletionScheduledAt,
  isPaired,
}: Props) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    null
  );
  const [datesState, datesAction, datesPending] = useActionState(
    updateCoupleDatesProfileAction,
    null
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    scheduleAccountDeletionAction,
    null
  );
  const [gender, setGender] = useState<"male" | "female">(initialGender);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deletionDate = deletionScheduledAt
    ? new Date(deletionScheduledAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="px-4 pt-10 pb-28 flex flex-col gap-5 max-w-lg mx-auto"
      style={{ minHeight: "100%" }}
    >
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 4 }}>
          Profil ve hesap bilgilerini yönet
        </p>
      </div>

      {/* Silme Uyarısı */}
      {deletionDate && (
        <div
          className="px-4 py-4 rounded-2xl"
          style={{
            background: "rgba(232,0,45,0.1)",
            border: "1px solid rgba(232,0,45,0.3)",
          }}
        >
          <p className="font-bold text-[#FF4D6A] text-sm mb-1">⚠️ Hesabın Silinmek Üzere</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Hesabın ve partnerinin tüm verileri <strong className="text-white">{deletionDate}</strong> tarihinde
            kalıcı olarak silinecek. Giriş yaparak bu işlemi iptal edebilirsin.
          </p>
        </div>
      )}

      {/* Kişisel Bilgiler */}
      <SectionCard title="Kişisel Bilgiler" icon={<User size={18} />}>
        <form action={profileAction} className="flex flex-col gap-0">
          <InputField
            label="Görünen İsim"
            name="displayName"
            defaultValue={initialDisplayName}
          />

          <div className="flex flex-col gap-1.5 mt-4">
            <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              Cinsiyet
            </label>
            <input type="hidden" name="gender" value={gender} />
            <div className="flex gap-3">
              {(["female", "male"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: gender === g ? "#E8002D" : "rgba(255,255,255,0.12)",
                    background: gender === g ? "rgba(232,0,45,0.15)" : "rgba(255,255,255,0.05)",
                    color: gender === g ? "#E8002D" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {g === "female" ? "Kadın" : "Erkek"}
                </button>
              ))}
            </div>
          </div>

          <SuccessError state={profileState} />

          <button
            type="submit"
            disabled={profilePending}
            className="mt-5 py-3 rounded-xl font-bold text-white text-sm transition-all"
            style={{
              background: profilePending ? "rgba(232,0,45,0.5)" : "#E8002D",
              boxShadow: "0 4px 15px rgba(232,0,45,0.25)",
            }}
          >
            {profilePending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </SectionCard>

      {/* İlişki Tarihleri */}
      {isPaired && (
        <SectionCard title="İlişki Tarihleri" icon={<CalendarHeart size={18} />} defaultOpen={false}>
          <form action={datesAction} className="flex flex-col gap-0">
            <InputField
              label="Tanışma Tarihi"
              name="meetDate"
              type="date"
              defaultValue={initialMeetDate}
            />
            <InputField
              label="Sevgili Olma Tarihi"
              name="relationshipStartDate"
              type="date"
              defaultValue={initialRelationshipStartDate}
            />

            <SuccessError state={datesState} />

            <button
              type="submit"
              disabled={datesPending}
              className="mt-5 py-3 rounded-xl font-bold text-white text-sm transition-all"
              style={{
                background: datesPending ? "rgba(232,0,45,0.5)" : "#E8002D",
                boxShadow: "0 4px 15px rgba(232,0,45,0.25)",
              }}
            >
              {datesPending ? "Kaydediliyor..." : "Tarihleri Güncelle"}
            </button>
          </form>
        </SectionCard>
      )}

      {/* Çıkış Yap */}
      <SectionCard title="Oturum" icon={<LogOut size={18} />} defaultOpen={false}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 12 }}>
          Hesabından güvenli bir şekilde çıkış yapar. Tekrar giriş yapana kadar uygulamaya erişemezsin.
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Çıkış Yap
          </button>
        </form>
      </SectionCard>

      {/* Hesabı Sil — Tehlike Bölgesi */}
      <SectionCard title="Tehlike Bölgesi" icon={<Trash2 size={18} />} defaultOpen={false}>
        <div className="mt-3 flex flex-col gap-4">
          <div
            className="p-4 rounded-xl"
            style={{ background: "rgba(232,0,45,0.06)", border: "1px solid rgba(232,0,45,0.2)" }}
          >
            <p className="font-bold text-[#FF4D6A] text-sm mb-2">⚠️ Dikkat: Geri Alınamaz</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: "1.6" }}>
              Hesabını silersen, <strong className="text-white">sana ve partnerine ait tüm fotoğraflar,
              mektuplar, günlük notlar ve takvim veriler</strong> kalıcı olarak silinir.{" "}
              Verileriniz <strong className="text-white">1 hafta boyunca dondurulur</strong> —
              bu süre içinde ikinizden biri giriş yaparsa işlem iptal edilir.
              1 hafta sonunda her şey kalıcı olarak yok olur.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{
                background: "rgba(232,0,45,0.08)",
                border: "1px solid rgba(232,0,45,0.3)",
                color: "#FF4D6A",
              }}
            >
              Hesabımı Sil
            </button>
          ) : (
            <form action={deleteAction} className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmed"
                  value="yes"
                  required
                  className="mt-1 w-4 h-4 accent-red-500"
                />
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: "1.6" }}>
                  Okudum, anlıyorum. Tüm verilerin 1 hafta sonra kalıcı olarak silineceğini kabul ediyorum.
                </span>
              </label>

              <SuccessError state={deleteState} />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={deletePending}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: deletePending ? "rgba(232,0,45,0.4)" : "#E8002D",
                    color: "#fff",
                  }}
                >
                  {deletePending ? "İşleniyor..." : "Evet, Hesabımı Sil"}
                </button>
              </div>
            </form>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
