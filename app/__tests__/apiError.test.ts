import { describe, it, expect } from "vitest";
import { ApiError } from "../lib/apiError";

describe("ApiError", () => {
  it("stores status and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("ApiError");
    expect(err).toBeInstanceOf(Error);
  });

  it("parses JSON error response", async () => {
    const res = new Response(JSON.stringify({ message: "bad request" }), {
      status: 400,
      statusText: "Bad Request",
      headers: { "Content-Type": "application/json" },
    });
    const err = await ApiError.fromResponse(res);
    expect(err.status).toBe(400);
    expect(err.message).toBe("bad request");
  });

  it("falls back to statusText for non-JSON response", async () => {
    const res = new Response("internal error", {
      status: 500,
      statusText: "Internal Server Error",
    });
    const err = await ApiError.fromResponse(res);
    expect(err.status).toBe(500);
    expect(err.message).toBe("Internal Server Error");
  });

  it("falls back to statusText when message field is missing", async () => {
    const res = new Response(JSON.stringify({ error: "something" }), {
      status: 422,
      statusText: "Unprocessable Entity",
      headers: { "Content-Type": "application/json" },
    });
    const err = await ApiError.fromResponse(res);
    expect(err.status).toBe(422);
    expect(err.message).toBe("Unprocessable Entity");
  });
});
