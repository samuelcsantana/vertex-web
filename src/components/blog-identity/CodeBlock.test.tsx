import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import { CodeBlock } from "./CodeBlock";

const messages = {
  Common: { copyCode: "Copy code", codeCopied: "Copied!" },
};

const markdown = "```js\nconst greeting = 'hello';\n```";

function renderCodeBlock() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={{ pre: CodeBlock }}>
        {markdown}
      </ReactMarkdown>
    </NextIntlClientProvider>
  );
}

describe("CodeBlock", () => {
  it("copies the plain-text code, ignoring rehype-highlight's <span> wrapping", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderCodeBlock();
    // Confirms rehype-highlight actually tokenized the block into spans —
    // otherwise this test wouldn't be exercising the thing it claims to.
    expect(document.querySelector("code .hljs-keyword")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("const greeting = 'hello';")
    );
  });

  it("swaps to a 'copied' state after a successful copy", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    renderCodeBlock();
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await screen.findByRole("button", { name: "Copied!" });
  });

  it("does not touch inline code (no <pre>, so no button)", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ReactMarkdown components={{ pre: CodeBlock }}>
          {"Run `npm install` first."}
        </ReactMarkdown>
      </NextIntlClientProvider>
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
