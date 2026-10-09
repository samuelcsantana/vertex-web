import {
  init,
  optIn,
  optOut,
  track as sendEvent,
  trackingStatus,
  type Properties,
  type TrackingStatus,
} from "pyxis-analytics";

export type { Properties, TrackingStatus };

export interface AnalyticsEvent {
  readonly name: string;
  readonly properties: Properties;
}

export type MeasuringStatus = TrackingStatus;

type Listener = () => void;

const listeners = new Set<Listener>();

function readConfig(): { key: string; endpoint: string } | null {
  const key = process.env.NEXT_PUBLIC_PYXIS_KEY?.trim();
  const endpoint = process.env.NEXT_PUBLIC_PYXIS_ENDPOINT?.trim();

  if (!key || !endpoint) return null;

  return { key, endpoint };
}

export function isAnalyticsConfigured(): boolean {
  return readConfig() !== null;
}

export function startMeasuring(): void {
  const config = readConfig();

  if (config === null) return;

  init({ key: config.key, endpoint: config.endpoint });
}

export function track(event: AnalyticsEvent): void {
  if (!isAnalyticsConfigured()) return;

  sendEvent(event.name, event.properties);
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function stopMeasuring(): void {
  optOut();
  notify();
}

export function resumeMeasuring(): void {
  optIn();
  notify();
}

export function measuringStatus(): MeasuringStatus {
  return trackingStatus();
}

export function subscribeToMeasuring(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
