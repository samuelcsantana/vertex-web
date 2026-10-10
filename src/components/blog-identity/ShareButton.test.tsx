import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock("@/features/analytics/api/pyxis-client", () => client);

import { ShareButton } from "./ShareButton";

const messages = { Post: { share: "Share", linkCopied: "Link copied" } };

function renderButton() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ShareButton title="A post" post="a-post" url="https://example.test/blog/a-post" />
    </NextIntlClientProvider>
  );
}

describe("ShareButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { share: undefined });
  });

  it("reports a native share", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });

    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(client.track).toHaveBeenCalledWith({
      name: "share_clicked",
      properties: { post: "a-post", method: "native" },
    });
  });

  it("reports a copied link when the browser cannot share", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(screen.getByText("Link copied")).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledWith("https://example.test/blog/a-post");
    expect(client.track).toHaveBeenCalledWith({
      name: "share_clicked",
      properties: { post: "a-post", method: "copy" },
    });
  });
});
