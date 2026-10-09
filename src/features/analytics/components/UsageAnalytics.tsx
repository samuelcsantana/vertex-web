"use client";

import { useEffect, useRef } from "react";

import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";
import { startMeasuring, stopMeasuring } from "@/features/analytics/api/pyxis-client";

export function UsageAnalytics() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const decided = useRef(false);
  const isAdmin = user?.role === "admin";

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
