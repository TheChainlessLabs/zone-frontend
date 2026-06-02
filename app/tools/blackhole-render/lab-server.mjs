import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(toolDir, "../..");
const configPath = path.join(toolDir, "config.json");
const preferredPort = Number(process.env.OMEGA_BLACKHOLE_LAB_PORT ?? 4114);
const listenHost = process.env.OMEGA_BLACKHOLE_LAB_HOST ?? "127.0.0.1";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
]);

function assertInside(base, target) {
  const relative = path.relative(base, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to serve path outside app directory: ${target}`);
  }
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function handleConfigPost(request, response) {
  const body = await readRequestBody(request);
  const config = JSON.parse(body);
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(config));
}

function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");

      if (url.pathname === "/health") {
        response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
        response.end("ok\n");
        return;
      }

      if (url.pathname === "/api/config" && request.method === "GET") {
        response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        response.end(await fs.readFile(configPath, "utf8"));
        return;
      }

      if (url.pathname === "/api/config" && request.method === "POST") {
        await handleConfigPost(request, response);
        return;
      }

      const requested =
        url.pathname === "/" ? "/tools/blackhole-render/index.html" : url.pathname;
      const filePath = path.resolve(appDir, `.${decodeURIComponent(requested)}`);
      assertInside(appDir, filePath);
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) throw new Error(`Not a file: ${filePath}`);
      response.writeHead(200, {
        "content-type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Not found");
    }
  });
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, listenHost, () => {
      server.off("error", reject);
      resolve(port);
    });
  });
}

async function start() {
  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    const server = createServer();
    try {
      await listen(server, port);
      const displayHost = listenHost === "0.0.0.0" ? "127.0.0.1" : listenHost;
      const url = `http://${displayHost}:${port}/tools/blackhole-render/index.html`;
      process.stdout.write(`Omega blackhole lab running at ${url}\n`);
      process.stdout.write("Press Ctrl+C to stop.\n");
      return server;
    } catch (error) {
      server.close();
      if (error?.code !== "EADDRINUSE") throw error;
    }
  }

  throw new Error("No available local port for the blackhole lab");
}

const server = await start();

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
