import { beforeEach, describe, expect, it, vi } from "vitest";

const init = vi.fn();
const loadRemote = vi.fn();

vi.mock("@module-federation/runtime", () => ({
  init: (...args: unknown[]) => init(...args),
  loadRemote: (...args: unknown[]) => loadRemote(...args),
}));

async function freshModule() {
  vi.resetModules();
  init.mockClear();
  loadRemote.mockClear();
  const React = await import("react");
  const federation = await import("./federation");
  return { ...federation, React };
}

interface InitCall {
  name: string;
  remotes: Array<{ name: string; entry: string; type?: string }>;
  shared: Record<
    string,
    { version: string; lib: () => unknown; shareConfig: { singleton: boolean; requiredVersion: string } }
  >;
}

function initArgs(): InitCall {
  return init.mock.calls[0]?.[0] as InitCall;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("initFederation", () => {
  it("registers every remote as an ES module container", async () => {
    const { initFederation } = await freshModule();

    initFederation();

    expect(initArgs().remotes).toHaveLength(2);
    for (const remote of initArgs().remotes) {
      expect(remote.type, `${remote.name} must declare its container format`).toBe("module");
    }
  });

  it("publishes React as a singleton the remote can resolve to", async () => {
    const { initFederation, React } = await freshModule();

    initFederation();

    const shared = initArgs().shared;
    expect(shared.react?.shareConfig.singleton).toBe(true);
    expect(shared["react-dom"]?.shareConfig.singleton).toBe(true);
    expect(shared.react?.lib()).toBe(React);
  });

  it("runs once, however many times it is called", async () => {
    const { initFederation } = await freshModule();

    initFederation();
    initFederation();
    initFederation();

    expect(init).toHaveBeenCalledTimes(1);
  });

  it("points the offline container at a name that cannot resolve", async () => {
    const { OFFLINE_REMOTE_ENTRY } = await freshModule();

    expect(new URL(OFFLINE_REMOTE_ENTRY).hostname).toMatch(/\.invalid$/);
  });
});

describe("probeSharing", () => {
  it("reports sharing when the remote hands back this page's React", async () => {
    const { probeSharing, React } = await freshModule();

    loadRemote.mockResolvedValueOnce({
      runtimeProbe: () => ({
        reactVersion: React.version,
        useState: React.useState,
        createElement: React.createElement,
      }),
    });

    await expect(probeSharing()).resolves.toMatchObject({
      sharesUseState: true,
      sharesCreateElement: true,
    });
  });

  it("reports a failure when the remote loaded its own React, version match notwithstanding", async () => {
    const { probeSharing, React } = await freshModule();

    loadRemote.mockResolvedValueOnce({
      runtimeProbe: () => ({
        reactVersion: React.version,
        useState: ((): unknown => undefined) as typeof React.useState,
        createElement: ((): unknown => undefined) as typeof React.createElement,
      }),
    });

    const report = await probeSharing();

    expect(report.remoteReactVersion).toBe(report.hostReactVersion);
    expect(report.sharesUseState).toBe(false);
    expect(report.sharesCreateElement).toBe(false);
  });

  it("fails loudly when the container answers with nothing", async () => {
    const { probeSharing } = await freshModule();
    loadRemote.mockResolvedValueOnce(undefined);

    await expect(probeSharing()).rejects.toThrow(/no probe module/);
  });
});

describe("loadVaccineSchedule", () => {
  it("asks the named container for the exposed module", async () => {
    const { loadVaccineSchedule, REMOTE_NAME } = await freshModule();
    loadRemote.mockResolvedValueOnce({ default: () => null });

    await loadVaccineSchedule(REMOTE_NAME);

    expect(loadRemote).toHaveBeenCalledWith(`${REMOTE_NAME}/VaccineSchedule`);
  });

  it("names the container that failed", async () => {
    const { loadVaccineSchedule, OFFLINE_REMOTE_NAME } = await freshModule();
    loadRemote.mockResolvedValueOnce(null);

    await expect(loadVaccineSchedule(OFFLINE_REMOTE_NAME)).rejects.toThrow(OFFLINE_REMOTE_NAME);
  });
});
