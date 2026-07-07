import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { useDialogBehavior } from "./useDialogBehavior";

function TestDialog() {
  const [open, setOpen] = useState(false);
  const dialogRef = useDialogBehavior(open, () => setOpen(false));

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      {open && (
        <div ref={dialogRef} role="dialog" aria-modal="true">
          <button>First</button>
          <button>Last</button>
        </div>
      )}
    </div>
  );
}

describe("useDialogBehavior", () => {
  it("moves focus to the first focusable element when the dialog opens", async () => {
    const user = userEvent.setup();
    render(<TestDialog />);

    await user.click(screen.getByText("Open dialog"));

    expect(screen.getByText("First")).toHaveFocus();
  });

  // Real Tab-key focus traversal is native browser behavior that jsdom
  // doesn't implement — a synthetic "Tab" keydown never moves focus on its
  // own, which is exactly what makes fireEvent the right tool here: any
  // focus change observed can only have come from the hook's own
  // preventDefault()-and-refocus logic, not an emulated browser default.
  it("traps focus: Tab from the last element wraps to the first", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open dialog"));

    screen.getByText("Last").focus();
    fireEvent.keyDown(screen.getByText("Last"), { key: "Tab" });

    expect(screen.getByText("First")).toHaveFocus();
  });

  it("traps focus: Shift+Tab from the first element wraps to the last", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open dialog"));

    screen.getByText("First").focus();
    fireEvent.keyDown(screen.getByText("First"), { key: "Tab", shiftKey: true });

    expect(screen.getByText("Last")).toHaveFocus();
  });

  it("closes on Escape", async () => {
    render(<TestDialog />);
    await userEvent.setup().click(screen.getByText("Open dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("restores focus to the trigger after closing", async () => {
    render(<TestDialog />);
    const trigger = screen.getByText("Open dialog");
    await userEvent.setup().click(trigger);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveFocus();
  });
});
