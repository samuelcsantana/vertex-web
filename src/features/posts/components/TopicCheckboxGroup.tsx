import { Controller, type Control } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { Topic } from "@/features/topics/types";
import type { CreatePostFormValues } from "@/features/posts/schemas/post-schema";

interface TopicCheckboxGroupProps {
  control: Control<CreatePostFormValues>;
  availableTopics: Topic[];
}

export function TopicCheckboxGroup({
  control,
  availableTopics,
}: TopicCheckboxGroupProps) {
  const t = useTranslations("Home");
  const tDashboard = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-300">{t("topics")}</span>
      <Controller
        control={control}
        name="topicIds"
        render={({ field }) => (
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
            {availableTopics.length === 0 ? (
              <p className="text-sm text-slate-400">
                {tDashboard("noTopicsRegistered")}
              </p>
            ) : (
              availableTopics.map((topic) => {
                const checked = field.value.includes(topic.id);

                return (
                  <label
                    key={topic.id}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      checked
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={(event) => {
                        field.onChange(
                          event.target.checked
                            ? [...field.value, topic.id]
                            : field.value.filter((id) => id !== topic.id)
                        );
                      }}
                    />
                    {topic.name}
                  </label>
                );
              })
            )}
          </div>
        )}
      />
    </div>
  );
}
