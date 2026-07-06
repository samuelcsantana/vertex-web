import type { Topic } from "@/features/topics/types";

interface TopicPillsProps {
  topics: Topic[];
  className?: string;
}

export function TopicPills({ topics, className }: TopicPillsProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {topics.map((topic) => (
        <span
          key={topic.id}
          className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
        >
          {topic.name}
        </span>
      ))}
    </div>
  );
}
