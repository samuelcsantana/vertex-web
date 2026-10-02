import type { Topic } from "@/features/topics/types";

interface TopicPillsProps {
  topics: Topic[];
  className?: string;
  // Caps how many pills render before collapsing the rest into a "+N" pill —
  // used on the home page's post grid, where cards need to stay a
  // predictable height. Omit it (as the post reading page and dashboard
  // table do) to show every topic.
  limit?: number;
}

export function TopicPills({ topics, className, limit }: TopicPillsProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  const visibleTopics = limit ? topics.slice(0, limit) : topics;
  const hiddenCount = topics.length - visibleTopics.length;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {visibleTopics.map((topic) => (
        <span
          key={topic.id}
          className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
        >
          {topic.name}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="rounded-full border border-input bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
