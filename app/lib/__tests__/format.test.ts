import { describe, expect, it } from "vitest";

import {
  formatAbsoluteTime,
  formatRelativeTime,
  formatThousands,
  formatUSD,
  truncateHash,
} from "@/lib/format";

describe("truncateHash", () => {
  it("collapses a long 32-byte hash to lead…tail", () => {
    expect(
      truncateHash(
        "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
      ),
    ).toBe("0xa1b2…4d5e");
  });

  it("respects custom lead/tail widths", () => {
    expect(
      truncateHash(
        "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
        10,
        6,
      ),
    ).toBe("0xa1b2c3d4…3c4d5e");
  });

  it("leaves short strings untouched", () => {
    expect(truncateHash("0xabc")).toBe("0xabc");
  });

  it("only truncates 0x-prefixed strings", () => {
    expect(truncateHash("notahash")).toBe("notahash");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-04-27T14:00:00Z");

  it("renders seconds + minutes + hours", () => {
    expect(formatRelativeTime("2026-04-27T13:59:30Z", now)).toBe("30s ago");
    expect(formatRelativeTime("2026-04-27T13:55:00Z", now)).toBe("5m ago");
    expect(formatRelativeTime("2026-04-27T11:00:00Z", now)).toBe("3h ago");
  });

  it("renders days inside the week window", () => {
    expect(formatRelativeTime("2026-04-25T14:00:00Z", now)).toBe("2d ago");
  });

  it("falls back to a calendar date past a week", () => {
    const out = formatRelativeTime("2026-04-01T14:00:00Z", now);
    expect(out).toMatch(/Apr/);
  });

  it("returns a placeholder for invalid input", () => {
    expect(formatRelativeTime("not-a-date", now)).toBe("—");
  });
});

describe("formatAbsoluteTime", () => {
  it("renders YYYY-MM-DD HH:mm:ss UTC", () => {
    expect(formatAbsoluteTime("2026-04-27T14:02:09Z")).toBe(
      "2026-04-27 14:02:09 UTC",
    );
  });
});

describe("formatThousands + formatUSD", () => {
  it("groups the integer portion of the value", () => {
    expect(formatThousands("1234567.89")).toBe("1,234,567.89");
    expect(formatThousands("1000")).toBe("1,000");
  });

  it("renders USD with two-decimal cents", () => {
    expect(formatUSD("184250.00")).toBe("$184,250.00");
    expect(formatUSD("96400.25")).toBe("$96,400.25");
  });
});
