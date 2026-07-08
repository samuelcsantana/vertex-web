import { describe, expect, it } from "vitest";

import { extractHeadings } from "./extract-headings";

describe("extractHeadings", () => {
  it("extracts h2 and h3 in document order", () => {
    const headings = extractHeadings(
      "# Title\n\n## First section\n\nSome text.\n\n### A subsection\n\n## Second section"
    );

    expect(headings).toEqual([
      { id: "first-section", text: "First section", level: 2 },
      { id: "a-subsection", text: "A subsection", level: 3 },
      { id: "second-section", text: "Second section", level: 2 },
    ]);
  });

  it("ignores h1, h4, h5, h6", () => {
    const headings = extractHeadings(
      "# Title\n## Kept\n#### Skipped\n##### Also skipped"
    );

    expect(headings.map((h) => h.text)).toEqual(["Kept"]);
  });

  it("dedupes repeated headings with a numeric suffix", () => {
    const headings = extractHeadings("## Overview\n## Overview\n## Overview");

    expect(headings.map((h) => h.id)).toEqual([
      "overview",
      "overview-2",
      "overview-3",
    ]);
  });

  it("strips inline markdown syntax from the heading text", () => {
    const headings = extractHeadings(
      "## Using `useEffect` for **side effects**"
    );

    expect(headings[0]).toEqual({
      id: "using-useeffect-for-side-effects",
      text: "Using useEffect for side effects",
      level: 2,
    });
  });

  it("removes accents when slugifying", () => {
    const headings = extractHeadings("## Configuração e instalação");

    expect(headings[0].id).toBe("configuracao-e-instalacao");
  });

  it("ignores headings inside fenced code blocks", () => {
    const headings = extractHeadings(
      "## Real heading\n\n```md\n## Not a real heading\n```\n"
    );

    expect(headings).toEqual([
      { id: "real-heading", text: "Real heading", level: 2 },
    ]);
  });

  it("returns an empty array for content with no h2/h3 headings", () => {
    expect(extractHeadings("Just a paragraph, no headings here.")).toEqual([]);
  });
});
