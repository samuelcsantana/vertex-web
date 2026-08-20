import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CurrentUserProvider,
  useCurrentUser,
} from "@/features/auth/components/CurrentUserProvider";

const HINT_KEY = "vertex.session-hint";

function Probe() {
  const { isAuthenticated, isResolved, isLoading } = useCurrentUser();

  return (
    <output>
      {isResolved ? "resolved" : "unresolved"}:
      {isAuthenticated ? "authenticated" : "anonymous"}:
      {isLoading ? "loading" : "done"}
    </output>
  );
}

/** A fetch that stays pending, so assertions land in the window before /api/me answers. */
function pendingFetch() {
  return vi.fn(() => new Promise(() => {}));
}

function jsonFetch(body: unknown, ok = true) {
  return vi.fn(async () => ({ ok, json: async () => body }));
}

describe("CurrentUserProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves as anonymous before the network answers when there is no hint", async () => {
    vi.stubGlobal("fetch", pendingFetch());

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    // Resolved without a response: the absence of a hint is itself an answer for this browser.
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("resolved")
    );
    expect(screen.getByRole("status").textContent).toContain("anonymous");
    // Still loading, because the authoritative answer has not arrived — the two are different
    // questions, which is why the header reads isResolved and admin UI reads isLoading.
    expect(screen.getByRole("status").textContent).toContain("loading");
  });

  it("shows the signed-in state before the network answers when the hint is set", async () => {
    window.localStorage.setItem(HINT_KEY, "1");
    vi.stubGlobal("fetch", pendingFetch());

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    // This is the flicker fix: no round trip has completed and the header already knows.
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("authenticated")
    );
  });

  it("clears the hint when the server answers unauthenticated", async () => {
    window.localStorage.setItem(HINT_KEY, "1");
    vi.stubGlobal("fetch", jsonFetch({ user: null, isAuthenticated: false }, false));

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    await waitFor(() => expect(window.localStorage.getItem(HINT_KEY)).toBeNull());
  });

  it("writes the hint once the server confirms a session", async () => {
    vi.stubGlobal(
      "fetch",
      jsonFetch({ user: { email: "a@b.co", name: null, displayName: null, avatarUrl: null }, isAuthenticated: true })
    );

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    await waitFor(() => expect(window.localStorage.getItem(HINT_KEY)).toBe("1"));
  });

  it("keeps the hint when the request fails, because a dropped request is not a logout", async () => {
    window.localStorage.setItem(HINT_KEY, "1");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("done")
    );
    // The session may be perfectly valid and the network merely down. Clearing here would let one
    // dropped request reintroduce the signed-out flash on the next load.
    expect(window.localStorage.getItem(HINT_KEY)).toBe("1");
  });

  it("survives localStorage throwing, as it does in Safari private mode", async () => {
    const original = window.localStorage.getItem;
    window.localStorage.getItem = () => {
      throw new Error("SecurityError");
    };
    vi.stubGlobal("fetch", pendingFetch());

    expect(() =>
      render(
        <CurrentUserProvider>
          <Probe />
        </CurrentUserProvider>
      )
    ).not.toThrow();

    await act(async () => {});
    window.localStorage.getItem = original;
  });
});
