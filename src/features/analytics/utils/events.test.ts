import { describe, expect, it } from "vitest";

import {
  articleCardClicked,
  articleRead,
  articleViewed,
  codeCopied,
  languageSwitched,
  outboundClicked,
  shareClicked,
  tocClicked,
} from "./events";

const EVENT_NAME = /^[a-z][a-z0-9_]{0,63}$/;
const PROPERTY_KEY = /^[a-z0-9_]{1,40}$/;
const MAX_PROPERTIES = 10;
const MAX_STRING = 100;

const samples = [
  articleViewed("a-post", "pt", 7),
  articleRead(50, "a-post", "en", 95),
  articleCardClicked("a-post", 3, "es"),
  tocClicked("a-post", "por-que-operators"),
  shareClicked("a-post", "native"),
  codeCopied("a-post"),
  outboundClicked("github.com", "a-post"),
  outboundClicked("github.com", null),
  languageSwitched("pt", "en"),
];

describe("event builders", () => {
  it.each(samples.map((event) => [event.name, event]))(
    "%s fits the API's name, key, count and length limits",
    (_name, event) => {
      expect(event.name).toMatch(EVENT_NAME);
      const entries = Object.entries(event.properties);
      expect(entries.length).toBeLessThanOrEqual(MAX_PROPERTIES);
      for (const [key, value] of entries) {
        expect(key).toMatch(PROPERTY_KEY);
        if (typeof value === "string") expect(value.length).toBeLessThanOrEqual(MAX_STRING);
      }
    }
  );

  it("names the reading events by depth and buckets the seconds", () => {
    expect(articleRead(25, "a-post", "pt", 12)).toEqual({
      name: "article_read_25",
      properties: { post: "a-post", locale: "pt", seconds: 12, time_bucket: "under_30s" },
    });
    expect(articleRead(100, "a-post", "pt", 400).name).toBe("article_read_100");
    expect(articleRead(100, "a-post", "pt", 400).properties.time_bucket).toBe("5_15min");
  });

  it("keeps the reading estimate with the article view", () => {
    expect(articleViewed("a-post", "pt", 7).properties).toEqual({
      post: "a-post",
      locale: "pt",
      reading_minutes: 7,
    });
  });

  it("sends the card position as a number", () => {
    expect(articleCardClicked("a-post", 1, "pt").properties.position).toBe(1);
  });

  it("leaves the post out of an outbound click made outside an article", () => {
    expect(outboundClicked("github.com", null).properties).toEqual({ host: "github.com" });
    expect(outboundClicked("github.com", "a-post").properties).toEqual({
      host: "github.com",
      post: "a-post",
    });
  });
});
