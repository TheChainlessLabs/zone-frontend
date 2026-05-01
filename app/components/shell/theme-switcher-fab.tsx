"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeDirection = "0" | "1" | "2" | "3" | "4";

const STORAGE_KEY = "omega:theme-direction";

const OPTIONS: Array<{
  direction: ThemeDirection;
  label: string;
  accent: string;
}> = [
  { direction: "0", label: "Original", accent: "#6FA8FF" },
  { direction: "1", label: "Proofline Blue", accent: "#6FA8FF" },
  { direction: "2", label: "Alloy Signal", accent: "#C8A66A" },
  { direction: "3", label: "Acid Witness", accent: "#B8F36B" },
  { direction: "4", label: "Offset Ledger", accent: "#A9BFF7" },
];

function normalizeDirection(value: string | null): ThemeDirection {
  return OPTIONS.some((option) => option.direction === value)
    ? (value as ThemeDirection)
    : "0";
}

function applyThemeDirection(direction: ThemeDirection) {
  if (direction === "0") {
    document.documentElement.removeAttribute("data-brand-direction");
    return;
  }

  document.documentElement.setAttribute("data-brand-direction", direction);
}

export function ThemeSwitcherFAB() {
  const [open, setOpen] = React.useState(false);
  const [selectedDirection, setSelectedDirection] =
    React.useState<ThemeDirection>("0");

  React.useEffect(() => {
    try {
      const storedDirection = normalizeDirection(
        window.localStorage.getItem(STORAGE_KEY)
      );
      setSelectedDirection(storedDirection);
      applyThemeDirection(storedDirection);
    } catch {
      setSelectedDirection("0");
    }
  }, []);

  function handleDirectionSelect(direction: ThemeDirection) {
    setSelectedDirection(direction);
    applyThemeDirection(direction);

    try {
      window.localStorage.setItem(STORAGE_KEY, direction);
    } catch {
      // Ignore storage failures and still apply the runtime theme.
    }

    setOpen(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Switch theme direction"
            className="glass-pill inline-flex h-11 items-center gap-2 rounded-full border border-[var(--glass-edge)] px-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--glass-fill)_88%,var(--foreground)_12%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
            <span>Themes</span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="top"
            align="end"
            sideOffset={10}
            className="surface-soft min-w-[240px] rounded-2xl p-1.5 text-[var(--foreground)] outline-none"
          >
            <DropdownMenu.RadioGroup
              value={selectedDirection}
              onValueChange={(value) =>
                handleDirectionSelect(normalizeDirection(value))
              }
            >
              {OPTIONS.map((option) => {
                const isSelected = option.direction === selectedDirection;

                return (
                  <DropdownMenu.RadioItem
                    key={option.direction}
                    value={option.direction}
                    className={cn(
                      "flex cursor-default select-none items-center gap-3 rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:bg-[var(--accent)]",
                      isSelected && "bg-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 rounded-[5px] border border-white/10"
                      style={{ backgroundColor: option.accent }}
                    />
                    <span className="flex-1">{option.label}</span>
                    <Check
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 text-[var(--brand-accent)]",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
