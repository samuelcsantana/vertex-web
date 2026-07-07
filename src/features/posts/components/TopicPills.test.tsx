import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopicPills } from "./TopicPills";

const topics = [
  {
    id: "1",
    name: "Engenharia de Software",
    slug: "engenharia-de-software",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Cafés Especiais",
    slug: "cafes-especiais",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const threeTopics = [
  ...topics,
  {
    id: "3",
    name: "RPGs",
    slug: "rpgs",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("TopicPills", () => {
  it("renders a pill for each topic", () => {
    render(<TopicPills topics={topics} />);
    expect(screen.getByText("Engenharia de Software")).toBeInTheDocument();
    expect(screen.getByText("Cafés Especiais")).toBeInTheDocument();
  });

  it("renders nothing for an empty topics array", () => {
    const { container } = render(<TopicPills topics={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  // Regression test: TopicPills used to crash when topics was missing
  // entirely rather than an empty array (fixed in 172bbdb).
  it("renders nothing when topics is undefined", () => {
    // @ts-expect-error deliberately omitting a required prop to cover the
    // real-world case (a stale API response) the guard clause protects against
    const { container } = render(<TopicPills topics={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows every topic when there is no limit", () => {
    render(<TopicPills topics={threeTopics} />);
    expect(screen.getByText("RPGs")).toBeInTheDocument();
    expect(screen.queryByText("+1")).not.toBeInTheDocument();
  });

  it("caps visible pills at the limit and shows a +N pill for the rest", () => {
    render(<TopicPills topics={threeTopics} limit={2} />);
    expect(screen.getByText("Engenharia de Software")).toBeInTheDocument();
    expect(screen.getByText("Cafés Especiais")).toBeInTheDocument();
    expect(screen.queryByText("RPGs")).not.toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("doesn't show a +N pill when the topic count is within the limit", () => {
    render(<TopicPills topics={topics} limit={2} />);
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
