import { appendFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { RequestAccessValues } from "@/lib/landing/request-access";

export interface RequestAccessRecord extends RequestAccessValues {
  id: string;
  submittedAt: string;
}

function captureFilePath() {
  if (process.env.OMEGA_REQUEST_ACCESS_FILE) return process.env.OMEGA_REQUEST_ACCESS_FILE;
  return join(process.cwd(), ".next", "request-access.jsonl");
}

export async function captureRequestAccess(values: RequestAccessValues) {
  const record: RequestAccessRecord = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...values,
  };

  const webhookUrl = process.env.OMEGA_REQUEST_ACCESS_WEBHOOK_URL;
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error("Request access webhook failed");
    }

    return record;
  }

  if (process.env.NODE_ENV === "production" && !process.env.OMEGA_REQUEST_ACCESS_FILE) {
    throw new Error("Request access capture sink is not configured");
  }

  const filePath = captureFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}
