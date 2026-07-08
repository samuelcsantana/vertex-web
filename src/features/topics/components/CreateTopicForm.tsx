"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { createTopicAction } from "@/features/topics/actions/topic-actions";

export function CreateTopicForm() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createTopicAction(name.trim());

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? tCommon("genericFormError"));
      return;
    }

    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("topicNamePlaceholder")}
          aria-label={t("topicNamePlaceholder")}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="shrink-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {isSubmitting ? t("adding") : t("addTopic")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
