import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  track: vi.fn(),
  optOut: vi.fn(),
  optIn: vi.fn(),
  trackingStatus: vi.fn(() => "on" as const),
}));

vi.mock("pyxis-analytics", () => sdk);

import {
  isAnalyticsConfigured,
  measuringStatus,
  resumeMeasuring,
  startMeasuring,
  stopMeasuring,
  subscribeToMeasuring,
  track,
} from "./pyxis-client";

describe("pyxis-client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_PYXIS_KEY", "pyxis_pk_test");
    vi.stubEnv("NEXT_PUBLIC_PYXIS_ENDPOINT", "https://api.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("is configured only when both the key and the endpoint are set", () => {
    expect(isAnalyticsConfigured()).toBe(true);

    vi.stubEnv("NEXT_PUBLIC_PYXIS_KEY", "   ");
    expect(isAnalyticsConfigured()).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_PYXIS_KEY", "pyxis_pk_test");
    vi.stubEnv("NEXT_PUBLIC_PYXIS_ENDPOINT", "");
    expect(isAnalyticsConfigured()).toBe(false);
  });

  it("starts the tracker with the key and the endpoint", () => {
    startMeasuring();

    expect(sdk.init).toHaveBeenCalledWith({
      key: "pyxis_pk_test",
      endpoint: "https://api.example.test",
    });
  });

  it("does not start the tracker without a key", () => {
    vi.stubEnv("NEXT_PUBLIC_PYXIS_KEY", "");

    startMeasuring();

    expect(sdk.init).not.toHaveBeenCalled();
  });

  it("sends an event with its name and properties", () => {
    track({ name: "share_clicked", properties: { post: "a-post", method: "copy" } });

    expect(sdk.track).toHaveBeenCalledWith("share_clicked", {
      post: "a-post",
      method: "copy",
    });
  });

  it("sends nothing without a key", () => {
    vi.stubEnv("NEXT_PUBLIC_PYXIS_KEY", "");

    track({ name: "share_clicked", properties: {} });

    expect(sdk.track).not.toHaveBeenCalled();
  });

  it("stops and resumes measuring and tells its subscribers each time", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToMeasuring(listener);

    stopMeasuring();
    expect(sdk.optOut).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);

    resumeMeasuring();
    expect(sdk.optIn).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    stopMeasuring();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("reads the status from the tracker", () => {
    sdk.trackingStatus.mockReturnValueOnce("opted-out" as never);

    expect(measuringStatus()).toBe("opted-out");
    expect(measuringStatus()).toBe("on");
  });
});
