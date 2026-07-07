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
});
