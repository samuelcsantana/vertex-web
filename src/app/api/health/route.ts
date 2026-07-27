import { NextResponse } from "next/server";

// Liveness-only: no DB/API calls, just proves the deployment is up and
// responding. Intended for an external cron/uptime pinger.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
