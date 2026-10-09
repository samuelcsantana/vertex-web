import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MeasuringStatus } from "@/features/analytics/api/pyxis-client";

const client = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  const store = { status: "on" as MeasuringStatus, configured: true };
  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    store,
    isAnalyticsConfigured: vi.fn(() => store.configured),
    measuringStatus: vi.fn(() => store.status),
    stopMeasuring: vi.fn(() => {
      store.status = "opted-out";
      notify();
    }),
    resumeMeasuring: vi.fn(() => {
      store.status = "on";
      notify();
    }),
    subscribeToMeasuring: vi.fn((listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }),
  };
});

vi.mock("@/features/analytics/api/pyxis-client", () => client);

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: { pathname: string; hash: string };
    children: ReactNode;
    className?: string;
  }) => (
    <a href={`${href.pathname}#${href.hash}`} className={className}>
      {children}
    </a>
  ),
}));

import { UsageAnalyticsSwitch } from "./UsageAnalyticsSwitch";

const messages = {
  UsageAnalytics: {
    on: "Usage measured without cookies or personal data.",
    learnMore: "Learn more",
    optOut: "Don't measure my visits",
    off: "Measurement is off in this browser.",
    optIn: "Measure again",
    blocked: "Measurement is off by your browser's do not track.",
    aboutAnchor: "privacy",
  },
};

function renderSwitch() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <UsageAnalyticsSwitch />
    </NextIntlClientProvider>
  );
}

describe("UsageAnalyticsSwitch", () => {
  afterEach(() => {
    vi.clearAllMocks();
    client.store.status = "on";
    client.store.configured = true;
  });

  it("explains the measurement and offers to stop it, with a link to the privacy section", () => {
    renderSwitch();

    expect(
      screen.getByText("Usage measured without cookies or personal data.", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      "/about#privacy"
    );
    expect(screen.getByRole("button", { name: "Don't measure my visits" })).toBeInTheDocument();
  });

  it("stops measuring on the first click and offers to resume", () => {
    renderSwitch();

    fireEvent.click(screen.getByRole("button", { name: "Don't measure my visits" }));

    expect(client.stopMeasuring).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Measurement is off in this browser.", { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Measure again" }));

    expect(client.resumeMeasuring).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Don't measure my visits" })).toBeInTheDocument();
  });

  it("says when the browser itself turned the measurement off, with no button", () => {
    client.store.status = "blocked-by-browser";

    renderSwitch();

    expect(
      screen.getByText("Measurement is off by your browser's do not track.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders nothing when no key is configured", () => {
    client.store.configured = false;

    const { container } = renderSwitch();

    expect(container).toBeEmptyDOMElement();
  });
});
