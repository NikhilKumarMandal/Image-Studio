# 📸 Screenshot Studio

A production-ready screenshot beautifier built with **Next.js 15 + TypeScript**. Upload any screenshot and transform it with backgrounds, frames, shadows, 3D effects, and captions — then export as full-resolution PNG.

## ✨ Features

- **Upload** — Click or drag & drop PNG, JPG, WEBP, GIF
- **16 Backgrounds** — Gradients, solids, mesh radials, noise/grain textures
- **Canvas Presets** — 16:9, 4:3, 1:1, 4:5, 9:16
- **Padding & Radius** — Full control over inset and corner rounding
- **7 Frame Mockups** — None, macOS Dark, macOS Light, Chrome, Arc Browser, iPhone, Border Glow
- **Shadow Controls** — Blur, Y-offset, opacity
- **5 3D Effects** — Flat, Tilt Left, Tilt Right, Float, Cinematic
- **Fine-tune 3D** — Independent Rotate X/Y and Scale sliders
- **9-point Alignment** — Grid + manual X/Y offset nudges
- **Caption Text** — 12 colors, font size, top/bottom placement
- **Export PNG** — Full-resolution canvas export

## 🚀 Getting Started

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
app/
├── components/
│   ├── CanvasArea.tsx     # Live canvas preview (RAF-based)
│   ├── LeftPanel.tsx      # Upload, backgrounds, frames, shadow
│   ├── RightPanel.tsx     # Effects, position, text tabs
│   ├── Section.tsx        # Collapsible panel section
│   ├── Slider.tsx         # Labeled range slider
│   ├── TopBar.tsx         # Logo + export button
│   └── UploadZone.tsx     # Drag & drop upload
├── data.ts                # All backgrounds, frames, effects data
├── renderer.ts            # Canvas 2D drawing engine
├── types.ts               # TypeScript types + default state
├── globals.css            # CSS variables + animations
├── layout.tsx             # Root layout
└── page.tsx               # App state orchestration
```

## 🛠 Extending

**Add a background:** In `data.ts`, add to `BACKGROUNDS` array, then handle in `drawBackground()` in `renderer.ts`.

**Add a frame:** Add to `FRAMES` in `data.ts`, add drawing logic in `drawFramedImage()` in `renderer.ts`.

## Tech Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · Lucide React
- Native Canvas 2D API (zero canvas library deps)
- Google Fonts: DM Sans + DM Mono
