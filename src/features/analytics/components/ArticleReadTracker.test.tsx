import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock("@/features/analytics/api/pyxis-client", () => client);

import { ArticleReadTracker } from "./ArticleReadTracker";

type Callback = (entries: IntersectionObserverEntry[]) => void;

const observers: { callback: Callback; observed: Element[]; unobserved: Element[] }[] = [];

class FakeIntersectionObserver {
  readonly observed: Element[] = [];
  readonly unobserved: Element[] = [];

  constructor(private readonly callback: Callback) {
    observers.push({ callback, observed: this.observed, unobserved: this.unobserved });
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  unobserve(element: Element) {
    this.unobserved.push(element);
  }

  disconnect() {}
}

function intersect(elements: Element[]) {
  const observer = observers.at(-1)!;
  act(() => {
    observer.callback(
      elements.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry)
    );
  });
}

function sentinel(depth: number): Element {
  return document.querySelector(`[data-read-depth="${depth}"]`)!;
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

describe("ArticleReadTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-10T12:00:00Z"));
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    observers.length = 0;
    setHidden(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("reports the article view once and observes the four depths", () => {
    const { rerender } = render(
      <ArticleReadTracker post="a-post" locale="pt" readingMinutes={6}>
        <p>Body</p>
      </ArticleReadTracker>
    );

    expect(client.track).toHaveBeenCalledWith({
      name: "article_viewed",
      properties: { post: "a-post", locale: "pt", reading_minutes: 6 },
    });
    expect(observers.at(-1)!.observed).toHaveLength(4);

    rerender(
      <ArticleReadTracker post="a-post" locale="pt" readingMinutes={6}>
        <p>Body</p>
      </ArticleReadTracker>
    );
    expect(client.track).toHaveBeenCalledTimes(1);
  });

  it("reports each depth once with the seconds the page was visible", () => {
    render(
      <ArticleReadTracker post="a-post" locale="en" readingMinutes={6}>
        <p>Body</p>
      </ArticleReadTracker>
    );
    client.track.mockClear();

    vi.setSystemTime(new Date("2026-10-10T12:00:12Z"));
    intersect([sentinel(25)]);
    intersect([sentinel(25)]);

    expect(client.track).toHaveBeenCalledTimes(1);
    expect(client.track).toHaveBeenCalledWith({
      name: "article_read_25",
      properties: { post: "a-post", locale: "en", seconds: 12, time_bucket: "under_30s" },
    });
  });

  it("does not count the time while the tab is hidden", () => {
    render(
      <ArticleReadTracker post="a-post" locale="pt" readingMinutes={6}>
        <p>Body</p>
      </ArticleReadTracker>
    );
    client.track.mockClear();

    vi.setSystemTime(new Date("2026-10-10T12:00:10Z"));
    setHidden(true);
    vi.setSystemTime(new Date("2026-10-10T12:10:10Z"));
    setHidden(false);
    vi.setSystemTime(new Date("2026-10-10T12:10:35Z"));
    intersect([sentinel(100)]);

    expect(client.track).toHaveBeenCalledWith({
      name: "article_read_100",
      properties: { post: "a-post", locale: "pt", seconds: 35, time_bucket: "30s_2min" },
    });
  });

  it("starts over for another article", () => {
    const { rerender } = render(
      <ArticleReadTracker key="a-post" post="a-post" locale="pt" readingMinutes={6}>
        <p>Body</p>
      </ArticleReadTracker>
    );
    intersect([sentinel(50)]);
    client.track.mockClear();

    rerender(
      <ArticleReadTracker key="b-post" post="b-post" locale="pt" readingMinutes={3}>
        <p>Other body</p>
      </ArticleReadTracker>
    );
    intersect([sentinel(50)]);

    expect(client.track).toHaveBeenNthCalledWith(1, {
      name: "article_viewed",
      properties: { post: "b-post", locale: "pt", reading_minutes: 3 },
    });
    expect(client.track).toHaveBeenNthCalledWith(2, {
      name: "article_read_50",
      properties: { post: "b-post", locale: "pt", seconds: 0, time_bucket: "under_30s" },
    });
  });
});
