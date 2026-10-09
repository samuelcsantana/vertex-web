import { describe, expect, it } from "vitest";

import { createVisibleClock, READ_DEPTHS, timeBucket } from "./read-depth";

describe("timeBucket", () => {
  it.each([
    [0, "under_30s"],
    [29, "under_30s"],
    [30, "30s_2min"],
    [119, "30s_2min"],
    [120, "2_5min"],
    [299, "2_5min"],
    [300, "5_15min"],
    [899, "5_15min"],
    [900, "over_15min"],
    [7200, "over_15min"],
  ])("puts %d seconds in %s", (seconds, bucket) => {
    expect(timeBucket(seconds)).toBe(bucket);
  });
});

describe("READ_DEPTHS", () => {
  it("covers a quarter, a half, three quarters and the end of an article", () => {
    expect(READ_DEPTHS).toEqual([25, 50, 75, 100]);
  });
});

describe("createVisibleClock", () => {
  function fakeNow() {
    let current = 0;
    return {
      now: () => current,
      advance(milliseconds: number) {
        current += milliseconds;
      },
    };
  }

  it("counts the time while the page is visible", () => {
    const time = fakeNow();
    const clock = createVisibleClock(time.now, true);

    time.advance(4_400);

    expect(clock.elapsedSeconds()).toBe(4);
  });

  it("does not count the time while the page is hidden", () => {
    const time = fakeNow();
    const clock = createVisibleClock(time.now, true);

    time.advance(2_000);
    clock.hide();
    time.advance(60_000);
    clock.show();
    time.advance(3_000);

    expect(clock.elapsedSeconds()).toBe(5);
  });

  it("starts paused when the page is hidden at the start", () => {
    const time = fakeNow();
    const clock = createVisibleClock(time.now, false);

    time.advance(10_000);
    expect(clock.elapsedSeconds()).toBe(0);

    clock.show();
    time.advance(1_000);
    expect(clock.elapsedSeconds()).toBe(1);
  });

  it("ignores a repeated hide or show", () => {
    const time = fakeNow();
    const clock = createVisibleClock(time.now, true);

    clock.show();
    time.advance(1_000);
    clock.hide();
    clock.hide();
    time.advance(5_000);

    expect(clock.elapsedSeconds()).toBe(1);
  });
});
