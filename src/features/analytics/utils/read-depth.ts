export const READ_DEPTHS = [25, 50, 75, 100] as const;

export type ReadDepth = (typeof READ_DEPTHS)[number];

export type TimeBucket =
  | "under_30s"
  | "30s_2min"
  | "2_5min"
  | "5_15min"
  | "over_15min";

const SECONDS_PER_MINUTE = 60;

const BUCKET_LIMITS: readonly { readonly below: number; readonly bucket: TimeBucket }[] = [
  { below: 30, bucket: "under_30s" },
  { below: 2 * SECONDS_PER_MINUTE, bucket: "30s_2min" },
  { below: 5 * SECONDS_PER_MINUTE, bucket: "2_5min" },
  { below: 15 * SECONDS_PER_MINUTE, bucket: "5_15min" },
];

export function timeBucket(seconds: number): TimeBucket {
  for (const { below, bucket } of BUCKET_LIMITS) {
    if (seconds < below) return bucket;
  }

  return "over_15min";
}

export interface VisibleClock {
  readonly hide: () => void;
  readonly show: () => void;
  readonly elapsedSeconds: () => number;
}

const MILLISECONDS_PER_SECOND = 1000;

export function createVisibleClock(now: () => number, visibleAtStart: boolean): VisibleClock {
  let accumulated = 0;
  let visibleSince: number | null = visibleAtStart ? now() : null;

  return {
    hide() {
      if (visibleSince === null) return;
      accumulated += now() - visibleSince;
      visibleSince = null;
    },
    show() {
      if (visibleSince !== null) return;
      visibleSince = now();
    },
    elapsedSeconds() {
      const running = visibleSince === null ? 0 : now() - visibleSince;
      return Math.round((accumulated + running) / MILLISECONDS_PER_SECOND);
    },
  };
}
