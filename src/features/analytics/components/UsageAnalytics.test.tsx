import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "@/features/auth/types";

const client = vi.hoisted(() => ({
  startMeasuring: vi.fn(),
  stopMeasuring: vi.fn(),
  track: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  state: {
    user: null as CurrentUser | null,
    isAuthenticated: false,
    isLoading: true,
  },
}));

vi.mock("@/features/analytics/api/pyxis-client", () => client);
vi.mock("@/features/auth/components/CurrentUserProvider", () => ({
  useCurrentUser: () => auth.state,
}));

import { UsageAnalytics } from "./UsageAnalytics";

function user(role: CurrentUser["role"]): CurrentUser {
  return {
    id: "user-1",
    email: "someone@example.com",
    role,
    name: "Someone",
    displayName: null,
    avatarUrl: null,
  };
}

function setState(state: Partial<typeof auth.state>) {
  auth.state = { ...auth.state, ...state };
}

describe("UsageAnalytics", () => {
  afterEach(() => {
    vi.clearAllMocks();
    auth.state = { user: null, isAuthenticated: false, isLoading: true };
  });

  it("starts measuring at once for a visitor without a session hint", () => {
    render(<UsageAnalytics />);

    expect(client.startMeasuring).toHaveBeenCalledTimes(1);
    expect(client.stopMeasuring).not.toHaveBeenCalled();
  });

  it("waits for the session answer when the hint says the visitor is signed in", () => {
    setState({ isAuthenticated: true, isLoading: true });
    const { rerender } = render(<UsageAnalytics />);

    expect(client.startMeasuring).not.toHaveBeenCalled();

    setState({ user: user("user"), isLoading: false });
    rerender(<UsageAnalytics />);

    expect(client.startMeasuring).toHaveBeenCalledTimes(1);
    expect(client.stopMeasuring).not.toHaveBeenCalled();
  });

  it("opts an admin out instead of starting", () => {
    setState({ isAuthenticated: true, isLoading: true });
    const { rerender } = render(<UsageAnalytics />);

    setState({ user: user("admin"), isLoading: false });
    rerender(<UsageAnalytics />);

    expect(client.stopMeasuring).toHaveBeenCalledTimes(1);
    expect(client.startMeasuring).not.toHaveBeenCalled();
  });

  it("stops measuring when the admin signs in during the page", () => {
    const { rerender } = render(<UsageAnalytics />);
    expect(client.startMeasuring).toHaveBeenCalledTimes(1);

    setState({ user: user("admin"), isAuthenticated: true, isLoading: false });
    rerender(<UsageAnalytics />);

    expect(client.stopMeasuring).toHaveBeenCalledTimes(1);
  });

  it("reports clicks on tracked elements and on links to other sites, and stops listening when unmounted", () => {
    document.body.innerHTML = `
      <a id="card" href="/blog/a-post" data-track-event="article_card_clicked" data-track-post="a-post" data-track-position="1" data-track-locale="pt">A post</a>
      <a id="out" href="https://github.com/samuelcsantana">GitHub</a>
      <a id="home" href="/">Home</a>
    `;
    const stayOnPage = (event: Event) => event.preventDefault();
    document.body.addEventListener("click", stayOnPage);
    const { unmount } = render(<UsageAnalytics />);

    document.getElementById("card")!.click();
    document.getElementById("out")!.click();
    document.getElementById("home")!.click();

    expect(client.track).toHaveBeenCalledTimes(2);
    expect(client.track).toHaveBeenNthCalledWith(1, {
      name: "article_card_clicked",
      properties: { post: "a-post", position: 1, locale: "pt" },
    });
    expect(client.track).toHaveBeenNthCalledWith(2, {
      name: "outbound_clicked",
      properties: { host: "github.com" },
    });

    unmount();
    document.getElementById("card")!.click();
    expect(client.track).toHaveBeenCalledTimes(2);
    document.body.removeEventListener("click", stayOnPage);
    document.body.innerHTML = "";
  });

  it("starts only once across re-renders", () => {
    const { rerender } = render(<UsageAnalytics />);

    setState({ isLoading: false });
    rerender(<UsageAnalytics />);
    setState({ user: user("user"), isAuthenticated: true });
    rerender(<UsageAnalytics />);

    expect(client.startMeasuring).toHaveBeenCalledTimes(1);
  });
});
