# Omega Blackhole Render Lab

Standalone asset renderer for the M8 landing hero. It builds a procedural Three.js scene and records static media that the landing page can consume later.

The lab prefers a WebGPU renderer adapted from the MIT-licensed `dgreenheck/webgpu-black-hole` project when the browser supports WebGPU. It falls back to the local WebGL renderer for scripted capture and browsers without WebGPU.

## Live Tuning

From the repository root:

```bash
pnpm --filter @omega/app blackhole:lab
```

Open `http://127.0.0.1:4114/tools/blackhole-render/index.html` and tune the blackhole live. Press **Save Config** to write the current art direction back to `config.json`.

## Regenerate

From the repository root:

```bash
pnpm --filter @omega/app render:blackhole
```

The script opens the local render lab in Playwright, captures deterministic frames, and encodes the outputs with ffmpeg.

## Outputs

Generated files land in `app/public/landing/blackhole/`:

- `omega-blackhole-hero-desktop.webm` - primary desktop hero video
- `omega-blackhole-hero-desktop.mp4` - compatibility fallback
- `omega-blackhole-hero-poster.png` - still poster fallback

Intermediate frames are written to `app/tools/blackhole-render/.frames/` and ignored by git.

## Art Direction

The scene is intentionally black-and-white and zinc-based. The palette mirrors `omega-docs/03-brand/assets/tokens.json`: dark background, zinc foreground, quiet muted lensing, and no semantic color. The asset has no visible copy.

The current lab view is focused on the blackhole only: event horizon, slow accretion disk, lensing, and premium monochrome grain. Narrative objects are disabled in config until the blackhole silhouette and motion feel right.

Tune the scene through `config.json`:

- `coreRadius`
- `diskIntensity`
- `lensingStrength`
- `spinSpeed`
- `showBackgroundGuides`
- `view.pitchDegrees`
- `view.yawDegrees`
- `view.zoom`
- `view.diskSpread`
- `composition`

The renderer is a lab only. Do not import it into the app runtime; consume the generated assets from `public/landing/blackhole/`.

## Third-Party Source

The optional WebGPU renderer vendors source from `dgreenheck/webgpu-black-hole` under `vendor/dgreenheck-webgpu-black-hole/`. Keep its MIT license file with the vendored source.
