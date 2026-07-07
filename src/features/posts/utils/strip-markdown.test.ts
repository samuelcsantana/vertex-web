import { describe, expect, it } from "vitest";

import { stripMarkdown } from "./strip-markdown";

describe("stripMarkdown", () => {
  it("strips headings", () => {
    expect(stripMarkdown("# Hello\n## World")).toBe("Hello World");
  });

  it("strips bold and italic emphasis, keeping the text", () => {
    expect(stripMarkdown("This is **bold** and _italic_ and *also italic*")).toBe(
      "This is bold and italic and also italic"
    );
  });

  it("strips inline code, keeping the text", () => {
    expect(stripMarkdown("Run `npm install` first")).toBe("Run npm install first");
  });

  it("strips fenced code blocks entirely", () => {
    expect(stripMarkdown("Before\n```ts\nconst x = 1;\n```\nAfter")).toBe(
      "Before After"
    );
  });

  it("replaces links with their link text", () => {
    expect(stripMarkdown("Check [the docs](https://example.com) out")).toBe(
      "Check the docs out"
    );
  });

  it("strips images entirely", () => {
    expect(stripMarkdown("Look: ![alt text](https://example.com/x.png) nice")).toBe(
      "Look: nice"
    );
  });

  it("strips list markers", () => {
    expect(stripMarkdown("- one\n- two\n1. three")).toBe("one two three");
  });

  it("strips blockquote markers", () => {
    expect(stripMarkdown("> quoted text")).toBe("quoted text");
  });

  it("strips strikethrough, keeping the text", () => {
    expect(stripMarkdown("~~deleted~~ text")).toBe("deleted text");
  });

  it("collapses newlines and extra whitespace", () => {
    expect(stripMarkdown("line one\n\n\nline two   line three")).toBe(
      "line one line two line three"
    );
  });

  it("trims leading and trailing whitespace", () => {
    expect(stripMarkdown("   padded text   ")).toBe("padded text");
  });
});
