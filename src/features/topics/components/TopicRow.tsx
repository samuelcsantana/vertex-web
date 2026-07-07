"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Pencil, Trash2, X } from "lucide-react";

import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import {
  deleteTopicAction,
  updateTopicAction,
} from "@/features/topics/actions/topic-actions";
import type { Topic } from "@/features/topics/types";

interface TopicRowProps {
  topic: Topic;
}

export function TopicRow({ topic }: TopicRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(topic.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");

  async function handleSave() {
    if (!name.trim() || name.trim() === topic.name) {
      setName(topic.name);
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await updateTopicAction(topic.id, name.trim());

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? tCommon("genericFormError"));
      return;
    }

    setIsEditing(false);
  }

  function handleCancel() {
    setName(topic.name);
    setError(null);
    setIsEditing(false);
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {isEditing ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            aria-label={t("topicNamePlaceholder")}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
        ) : (
          <span className="text-sm text-slate-100">{topic.name}</span>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <Check className="size-3.5" />
                {t("save")}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                aria-label={t("cancelEdit")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label={t("editTopic")}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400"
              >
                <Pencil className="size-3.5" />
                {t("edit")}
              </button>
              <ConfirmDialog
                title={t("confirmDeleteTopicTitle")}
                description={t("confirmDeleteTopicDescription", { name: topic.name })}
                confirmLabel={t("removeTopic")}
                action={deleteTopicAction.bind(null, topic.id)}
                trigger={
                  <button
                    type="button"
                    aria-label={t("deleteTopic")}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                    {t("removeTopic")}
                  </button>
                }
              />
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
