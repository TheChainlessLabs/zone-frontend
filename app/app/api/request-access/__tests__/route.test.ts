import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/request-access/route";

let captureDir = "";
let captureFile = "";

function request(body: unknown) {
  return new Request("http://localhost/api/request-access", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/request-access", () => {
  beforeEach(async () => {
    captureDir = await mkdtemp(join(tmpdir(), "omega-request-access-"));
    captureFile = join(captureDir, "requests.jsonl");
    process.env.OMEGA_REQUEST_ACCESS_FILE = captureFile;
  });

  afterEach(async () => {
    delete process.env.OMEGA_REQUEST_ACCESS_FILE;
    if (captureDir) {
      await rm(captureDir, { recursive: true, force: true });
    }
  });

  it("accepts valid access requests", async () => {
    const response = await POST(
      request({
        name: "Brian Seong",
        email: "brian@omegamarkets.com",
        organization: "Omega Markets",
        useCase: "fund",
        message: "Stablecoin FX flow between USDC and EURC.",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const [line] = (await readFile(captureFile, "utf8")).trim().split("\n");
    expect(JSON.parse(line)).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        submittedAt: expect.any(String),
        name: "Brian Seong",
        email: "brian@omegamarkets.com",
        organization: "Omega Markets",
        useCase: "fund",
        message: "Stablecoin FX flow between USDC and EURC.",
      }),
    );
  });

  it("rejects invalid access requests", async () => {
    const response = await POST(
      request({
        name: "B",
        email: "not-email",
        organization: "",
        useCase: "fund",
        message: "short",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid access request.",
    });
  });
});
