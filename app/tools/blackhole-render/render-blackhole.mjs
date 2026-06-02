import { chromium } from "playwright";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(toolDir, "../..");
const outputDir = path.join(appDir, "public/landing/blackhole");
const framesDir = path.join(toolDir, ".frames/desktop");
const configPath = path.join(toolDir, "config.json");

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

function createStaticServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const requested = url.pathname === "/" ? "/tools/blackhole-render/index.html" : url.pathname;
      const filePath = path.resolve(appDir, `.${decodeURIComponent(requested)}`);
      assertInside(appDir, filePath);
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) throw new Error(`Not a file: ${filePath}`);
      response.writeHead(200, {
        "content-type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Unable to determine render server port");
      }
      resolve({ server, port: address.port });
    });
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

async function captureFrames(page, config) {
  const totalFrames = config.render.durationSeconds * config.render.fps;
  const posterFrame = Math.round(config.render.posterSeconds * config.render.fps);

  await fs.rm(framesDir, { recursive: true, force: true });
  await fs.mkdir(framesDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  for (let frame = 0; frame < totalFrames; frame += 1) {
    const seconds = frame / config.render.fps;
    const framePath = path.join(framesDir, `${String(frame).padStart(4, "0")}.png`);
    await page.evaluate((time) => window.__omegaBlackhole.renderAt(time), seconds);
    await page.screenshot({ path: framePath, type: "png", animations: "disabled" });

    if (frame === posterFrame) {
      await fs.copyFile(
        framePath,
        path.join(outputDir, config.render.outputs.desktop.poster),
      );
    }

    if (frame % config.render.fps === 0) {
      process.stdout.write(`captured ${frame}/${totalFrames} frames\n`);
    }
  }
}

async function encodeAssets(config) {
  const outputs = config.render.outputs.desktop;
  const inputPattern = path.join(framesDir, "%04d.png");
  const webmPath = path.join(outputDir, outputs.webm);
  const mp4Path = path.join(outputDir, outputs.mp4);

  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-framerate",
    String(config.render.fps),
    "-start_number",
    "0",
    "-i",
    inputPattern,
    "-vf",
    "format=yuv420p",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    String(config.render.encoding.webmCrf),
    "-row-mt",
    "1",
    "-an",
    webmPath,
  ]);

  await run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-framerate",
    String(config.render.fps),
    "-start_number",
    "0",
    "-i",
    inputPattern,
    "-vf",
    "format=yuv420p",
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-crf",
    String(config.render.encoding.mp4Crf),
    "-preset",
    "slow",
    "-movflags",
    "+faststart",
    "-an",
    mp4Path,
  ]);
}

async function main() {
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  const { server, port } = await createStaticServer();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: {
        width: config.render.desktop.width,
        height: config.render.desktop.height,
      },
      deviceScaleFactor: 1,
    });
    await page.goto(`http://127.0.0.1:${port}/tools/blackhole-render/index.html?capture=1`, {
      waitUntil: "networkidle",
    });
    await page.waitForFunction(() => window.__omegaBlackhole?.ready === true);
    await captureFrames(page, config);
    await encodeAssets(config);
  } finally {
    await browser.close();
    server.close();
  }

  process.stdout.write(`assets written to ${outputDir}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
