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

// Pulls in next/navigation and the whole OAuth popup flow; none of it is
// what these tests are about.
vi.mock("@/components/blog-identity/LoginModal", () => ({
  LoginModal: () => null,
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("next-intl", () => ({
  // Message keys stand in for their translations, so an assertion names the
  // branch it is checking rather than a Portuguese string that a copy edit
  // would quietly break.
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

  // The whole reason this component stopped taking the profile as a prop:
  // the page it lives on is prerendered, so this markup is byte-identical
  // for every visitor. Committing to either branch on the server shows one
  // of them the wrong one.
  it("renders neither the composer nor the sign-in card on the server", () => {
    const html = renderToString(
      <CurrentUserProvider>
        <CommentsSection postId="post-1" allowComments />
      </CurrentUserProvider>
    );

    // Proves the section really rendered, so the two absences below are
    // the component's decision and not an empty string passing by default.
    expect(html).toContain("loadingComments");
    expect(html).not.toContain(COMPOSER);
    expect(html).not.toContain(SIGN_IN_CARD);
  });

  it("shows the composer to a returning signed-in visitor before /api/me answers", async () => {
    // The regression this test exists for: treating "/api/me hasn't answered"
    // as "signed out" would flash the sign-in card at the one visitor who is
    // actually signed in — the same bug the header had before the hint store.
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
    // The hint is forgeable and can outlive the session, so it only ever
    // decides what to paint first. Nothing is gated on it.
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
