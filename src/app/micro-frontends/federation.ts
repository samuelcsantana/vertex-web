import { init, loadRemote } from "@module-federation/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";

export const HOST_NAME = "vertex-web";
export const REMOTE_NAME = "cygnus";

export const REMOTE_ENTRY =
  process.env.NEXT_PUBLIC_CYGNUS_REMOTE_ENTRY ??
  "https://cygnus.samuelsantana.dev/mf/remoteEntry.js";

export const OFFLINE_REMOTE_NAME = "cygnus-offline";
export const OFFLINE_REMOTE_ENTRY = "https://cygnus-remote.invalid/mf/remoteEntry.js";

const SHARED_REACT_RANGE = "^19.0.0";

let initialised = false;

export function initFederation(): void {
  if (initialised) return;
  initialised = true;

  init({
    name: HOST_NAME,
    remotes: [
      { name: REMOTE_NAME, entry: REMOTE_ENTRY, type: "module" },
      { name: OFFLINE_REMOTE_NAME, entry: OFFLINE_REMOTE_ENTRY, type: "module" },
    ],
    shared: {
      react: {
        version: React.version,
        lib: () => React,
        shareConfig: { singleton: true, requiredVersion: SHARED_REACT_RANGE },
      },
      "react-dom": {
        version: ReactDOM.version,
        lib: () => ReactDOM,
        shareConfig: { singleton: true, requiredVersion: SHARED_REACT_RANGE },
      },
    },
  });
}

export interface SharingReport {
  hostReactVersion: string;
  remoteReactVersion: string;
  sharesUseState: boolean;
  sharesCreateElement: boolean;
}

interface RemoteProbeModule {
  runtimeProbe: () => {
    reactVersion: string;
    useState: typeof React.useState;
    createElement: typeof React.createElement;
  };
}

export async function probeSharing(): Promise<SharingReport> {
  initFederation();

  const probeModule = await loadRemote<RemoteProbeModule>(
    `${REMOTE_NAME}/runtimeProbe`
  );

  if (!probeModule) throw new Error("the remote returned no probe module");

  const probe = probeModule.runtimeProbe();

  return {
    hostReactVersion: React.version,
    remoteReactVersion: probe.reactVersion,
    sharesUseState: probe.useState === React.useState,
    sharesCreateElement: probe.createElement === React.createElement,
  };
}

export async function loadVaccineSchedule(remoteName: string) {
  initFederation();

  const remoteModule = await loadRemote<{
    default: React.ComponentType<{
      apiOrigin?: string;
      limit?: number;
      onSelect?: (item: { id: string; name: string }) => void;
    }>;
  }>(`${remoteName}/VaccineSchedule`);

  if (!remoteModule) throw new Error(`${remoteName} returned no module`);

  return remoteModule;
}
