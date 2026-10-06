import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CurrentUserProvider } from "@/features/auth/components/CurrentUserProvider";
import { CommentsSection } from "./CommentsSection";

vi.mock("@/features/comments/actions/comment-actions", () => ({
  getCommentsAction: vi.fn(async () => []),
  createCommentAction: vi.fn(),
  deleteCommentAction: vi.fn(),
}));

vi.mock("@/components/blog-identity/LoginModal", () => ({
  LoginModal: () => null,
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({ dateTime: () => "" }),
}));

const HINT_KEY = "vertex.session-hint";

const COMPOSER = "commentPlaceholder";
const SIGN_IN_CARD = "loginToComment";

function pendingFetch() {
  return vi.fn(() => new Promise(() => {}));
}

function jsonFetch(body: unknown) {
  return vi.fn(async () => ({ ok: true, json: async () => body }));
}

function renderSection() {
  return render(
    <CurrentUserProvider>
      <CommentsSection postId="post-1" allowComments />
    </CurrentUserProvider>
  );
}

describe("CommentsSection", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders neither the composer nor the sign-in card on the server", () => {
    const html = renderToString(
      <CurrentUserProvider>
        <CommentsSection postId="post-1" allowComments />
      </CurrentUserProvider>
    );

    expect(html).toContain("loadingComments");
    expect(html).not.toContain(COMPOSER);
    expect(html).not.toContain(SIGN_IN_CARD);
  });

  it("shows the composer to a returning signed-in visitor before /api/me answers", async () => {
    window.localStorage.setItem(HINT_KEY, "1");
    vi.stubGlobal("fetch", pendingFetch());

    renderSection();

    expect(await screen.findByPlaceholderText(COMPOSER)).toBeInTheDocument();
    expect(screen.queryByText(SIGN_IN_CARD)).not.toBeInTheDocument();
  });

  it("shows the sign-in card once /api/me answers anonymous", async () => {
    vi.stubGlobal("fetch", jsonFetch({ user: null, isAuthenticated: false }));

    renderSection();

    expect(await screen.findByText(SIGN_IN_CARD)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(COMPOSER)).not.toBeInTheDocument();
  });

  it("shows the composer once /api/me answers authenticated", async () => {
    vi.stubGlobal(
      "fetch",
      jsonFetch({
        isAuthenticated: true,
        user: {
          id: "user-1",
          email: "someone@example.com",
          role: "user",
          name: "Someone",
          displayName: null,
          avatarUrl: null,
        },
      })
    );

    renderSection();

    expect(await screen.findByPlaceholderText(COMPOSER)).toBeInTheDocument();
    expect(screen.queryByText(SIGN_IN_CARD)).not.toBeInTheDocument();
  });

  it("drops the composer when a stale hint is corrected by /api/me", async () => {
    window.localStorage.setItem(HINT_KEY, "1");
    vi.stubGlobal("fetch", jsonFetch({ user: null, isAuthenticated: false }));

    renderSection();

    await waitFor(() =>
      expect(screen.queryByPlaceholderText(COMPOSER)).not.toBeInTheDocument()
    );
    expect(screen.getByText(SIGN_IN_CARD)).toBeInTheDocument();
    expect(window.localStorage.getItem(HINT_KEY)).toBeNull();
  });
});
