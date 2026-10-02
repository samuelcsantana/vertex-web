import { describe, expect, it } from "vitest";

import { formatPostDate } from "./format-post-date";

// Mid-day UTC, the way posts are stamped, so the calendar day is the same in any test timezone.
const OCTOBER_2 = "2026-10-02T15:00:00.000Z";

describe("formatPostDate", () => {
  it("writes the Portuguese date in Portuguese word order", () => {
    expect(formatPostDate(OCTOBER_2, "pt")).toBe("02 de outubro de 2026");
  });

  it("writes the English date in English word order", () => {
    expect(formatPostDate(OCTOBER_2, "en")).toBe("October 02, 2026");
  });

  it("writes the Spanish date in Spanish, not in Portuguese", () => {
    expect(formatPostDate(OCTOBER_2, "es")).toBe("02 de octubre de 2026");
  });

  it("falls back to Portuguese, the default locale, for an unknown locale", () => {
    expect(formatPostDate(OCTOBER_2, "fr")).toBe("02 de outubro de 2026");
  });
});
