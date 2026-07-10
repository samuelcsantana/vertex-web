"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Trash2 } from "lucide-react";

import { useRouter } from "@/i18n/routing";
import { updateProfileAction } from "@/features/users/actions/user-actions";
import { uploadAvatarImage } from "@/features/users/api/upload-avatar";

interface ProfileFormProps {
  initialName: string;
  initialDisplayName: string;
  initialAvatarUrl: string;
  email: string;
}

const inputClasses =
  "rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none";

export function ProfileForm({
  initialName,
  initialDisplayName,
  initialAvatarUrl,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const t = useTranslations("Profile");
  const [name, setName] = useState(initialName);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const displayNameId = useId();
  const errorId = useId();

  const initial = (
    displayName.trim()[0] ??
    name.trim()[0] ??
    email[0] ??
    "?"
  ).toUpperCase();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setSaved(false);
    setIsUploading(true);

    try {
      setAvatarUrl(await uploadAvatarImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("avatarUploadError"));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSaving(true);

    const result = await updateProfileAction({ name, displayName, avatarUrl });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? t("genericProfileError"));
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- bucket/OAuth-provider avatar URL, not a next/image remote-pattern candidate
          <img
            src={avatarUrl}
            alt={t("avatarAlt")}
            referrerPolicy="no-referrer"
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-semibold text-emerald-400"
          >
            {initial}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400 disabled:opacity-50"
          >
            <Camera className="size-3.5" />
            {isUploading ? t("uploadingAvatar") : t("uploadAvatar")}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => {
                setAvatarUrl("");
                setSaved(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
            >
              <Trash2 className="size-3.5" />
              {t("removeAvatar")}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={nameId} className="text-sm font-medium text-slate-300">
          {t("nameLabel")}
        </label>
        <input
          id={nameId}
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={displayNameId}
          className="text-sm font-medium text-slate-300"
        >
          {t("displayNameLabel")}
        </label>
        <input
          id={displayNameId}
          value={displayName}
          maxLength={50}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder={t("displayNamePlaceholder")}
          aria-describedby={error ? errorId : undefined}
          className={inputClasses}
        />
        <p className="text-xs text-slate-400">{t("displayNameHint")}</p>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="text-sm text-emerald-400">
          {t("profileSaved")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving || isUploading}
        className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50 sm:w-fit"
      >
        {isSaving ? t("saving") : t("saveProfile")}
      </button>
    </form>
  );
}
