"use client";

import { useEffect, useRef } from "react";

import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";
import {
  startMeasuring,
  stopMeasuring,
  track,
} from "@/features/analytics/api/pyxis-client";
import { clickEvent } from "@/features/analytics/utils/click-events";

function reportClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;

  const tracked = clickEvent(event.target, window.location.hostname);

  if (tracked !== null) track(tracked);
}

export function UsageAnalytics() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const decided = useRef(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    document.addEventListener("click", reportClick, true);
    return () => document.removeEventListener("click", reportClick, true);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      decided.current = true;
      stopMeasuring();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (decided.current) return;
    if (isAuthenticated && isLoading) return;

    decided.current = true;
    startMeasuring();
  }, [isAuthenticated, isLoading]);

  return null;
}
