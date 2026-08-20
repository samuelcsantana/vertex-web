import { init, loadRemote } from "@module-federation/runtime";
import * as React from "react";
import * as ReactDOM from "react-dom";

/**
 * The host side of Module Federation, using the runtime API rather than a bundler plugin.
 *
 * That is not a preference. `@module-federation/nextjs-mf` — the plugin every tutorial reaches for —
 * declares `next: ^12 || ^13 || ^14 || ^15`, and this app is on Next 16 with Turbopack. There is no
 * version of the plugin path available here.
 *
 * The runtime API turns out to be the better shape anyway, and it is worth being precise about why,
 * because "we could not use the plugin" and "we did not need the plugin" are different claims:
 *
 * - The plugin's job is to rewrite `import` statements into container lookups at build time. This
 *   host has no such imports. It names one URL and resolves everything behind it at runtime, which
 *   is the property that makes a micro frontend independently deployable in the first place.
 * - What the plugin also does, and this file has to do by hand, is publish the host's own
 *   dependencies into the share scope. That is the `lib: () => React` below, and getting it wrong is
 *   the failure mode the whole demo is built to make visible.
 *
 * The cost is real and belongs next to the benefit: no build-time validation that a remote exists,
 * no federated type checking on this side, and a typo in a remote module name is a runtime error.
 */

export const HOST_NAME = "vertex-web";
export const REMOTE_NAME = "cygnus";

/** The live container. Same origin the Cygnus app and its embed are served from. */
export const REMOTE_ENTRY =
  process.env.NEXT_PUBLIC_CYGNUS_REMOTE_ENTRY ??
  "https://cygnus.samuelsantana.dev/mf/remoteEntry.js";

/**
 * A deliberately dead container, registered alongside the live one.
 *
 * Runtime resolution means the host's page now depends on an origin it does not deploy, and a demo
 * that only shows the happy path is hiding the actual trade-off. Registering the failure as a second
 * remote — rather than re-initialising the runtime with a broken URL — keeps the two paths
 * independent, so exercising the failure cannot corrupt the state the working one relies on.
 */
export const OFFLINE_REMOTE_NAME = "cygnus-offline";
/**
 * `.invalid` is reserved by RFC 2606 and guaranteed never to resolve, which is what makes this a
 * clean stand-in for "the remote's origin is down".
 *
 * A missing path on the real origin would not do: `*.samuelsantana.dev` is a wildcard pointing at
 * Vercel, and Cygnus rewrites unmatched paths to its SPA shell — so a nonexistent entry answers 200
 * with an HTML document, and the browser blocks it as a cross-origin type mismatch. That still
 * fails, but it demonstrates content-type filtering rather than an unreachable remote.
 */
export const OFFLINE_REMOTE_ENTRY = "https://cygnus-remote.invalid/mf/remoteEntry.js";

/**
 * Wide on purpose, and worth knowing that it accepts a prerelease.
 *
 * Next vendors its own React for the App Router, so what this host actually offers is a
 * `19.3.0-canary-*` build rather than the 19.2.4 in package.json. Under strict semver a prerelease
 * does not satisfy `^19.0.0`; the federation runtime accepts it, and the remote resolves to the
 * host's instance. Had it refused, the failure would have been silent — the remote falls back to the
 * copy it carries, renders correctly, and breaks only when it touches host-owned state. That is the
 * exact scenario `probeSharing` exists to rule out on every load.
 */
const SHARED_REACT_RANGE = "^19.0.0";

let initialised = false;

/**
 * Publishes this app's React into the share scope and registers both containers.
 *
 * `lib: () => React` is the whole contract: it hands the container a *reference* to the instance
 * already rendering this page, so the remote resolves `react` to that object instead of the copy it
 * carries as a fallback. Drop it, or drop `singleton`, and the remote loads its own React — which
 * renders, and then fails the first time it touches state or context this host owns.
 *
 * `requiredVersion` is what lets the negotiation refuse rather than silently duplicate.
 *
 * Idempotent because React 19 Strict Mode mounts effects twice in development, and `init` is not
 * something to run twice against the same share scope.
 */
export function initFederation(): void {
  if (initialised) return;
  initialised = true;

  init({
    name: HOST_NAME,
    remotes: [
      // `type: "module"` is not optional here, and the failure it prevents is opaque. The Vite
      // plugin emits an ESM container; without this the runtime injects it through a plain
      // <script> tag, the browser refuses it with "Cannot use import statement outside a module",
      // and what surfaces is RUNTIME-001 "Failed to get remoteEntry exports" — a message about
      // exports, for a file that was fetched with a 200 and never evaluated.
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
  /** True only if the two bundles resolved `react` to one instance. */
  sharesUseState: boolean;
  /** A second, independent reference, so one re-exported symbol cannot produce a false positive. */
  sharesCreateElement: boolean;
}

interface RemoteProbeModule {
  runtimeProbe: () => {
    reactVersion: string;
    useState: typeof React.useState;
    createElement: typeof React.createElement;
  };
}

/**
 * Asks the remote what React it ended up with, and compares by reference.
 *
 * A matching version string is not proof: two copies of the same version are still two objects.
 * Reference identity is the only check that can fail when sharing fails, which is why both sides are
 * compared by reference. Two exports rather than one, because a single symbol could in principle
 * survive an interop layer by accident.
 *
 * The versions are reported anyway, and in this pairing they corroborate. Next vendors its own React
 * build for the App Router, so this host publishes `19.3.0-canary-*` into the share scope while the
 * remote is compiled against 19.2.8. The remote reporting the canary is a version it does not ship
 * and could only have been handed.
 */
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

/** Loads the exposed component from whichever container is named. */
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
