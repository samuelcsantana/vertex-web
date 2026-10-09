"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import {
  isAnalyticsConfigured,
  measuringStatus,
  resumeMeasuring,
  stopMeasuring,
  subscribeToMeasuring,
  type MeasuringStatus,
} from "@/features/analytics/api/pyxis-client";

function serverStatus(): MeasuringStatus | null {
  return null;
}

const ACTION_CLASS =
  "cursor-pointer underline underline-offset-2 transition-colors hover:text-foreground";

export function UsageAnalyticsSwitch() {
  const t = useTranslations("UsageAnalytics");
  const status = useSyncExternalStore(
    subscribeToMeasuring,
    measuringStatus,
    serverStatus
  );

  if (!isAnalyticsConfigured() || status === null) return null;

  switch (status) {
    case "on":
      return (
        <p className="text-xs">
          {t("on")}{" "}
          <Link
            href={{ pathname: "/about", hash: t("aboutAnchor") }}
            className={ACTION_CLASS}
          >
            {t("learnMore")}
          </Link>
          {" · "}
          <button type="button" onClick={stopMeasuring} className={ACTION_CLASS}>
            {t("optOut")}
          </button>
        </p>
      );
    case "opted-out":
      return (
        <p className="text-xs">
          {t("off")}{" "}
          <button type="button" onClick={resumeMeasuring} className={ACTION_CLASS}>
            {t("optIn")}
          </button>
        </p>
      );
    case "blocked-by-browser":
      return <p className="text-xs">{t("blocked")}</p>;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}
