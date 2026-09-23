# Tee Studio — Custom T-Shirt Designer

A client-only React + TypeScript single-page app for designing custom t-shirts. Pick a
sleeve style and color, then add text, upload artwork, draw freehand, and export a
print-ready, high-resolution design for the front and back of the shirt.

Everything runs in the browser — no backend, no login. Your work auto-saves to
`localStorage` so it survives a refresh.

> 📄 **Full requirements, architecture, and diagrams:** see [`spec.md`](./spec.md).
> It documents every functional/non-functional requirement (with traceability to
> the code), the data model, key flows, the asset pipeline, and the
> responsive/touch spec — including Mermaid architecture, sequence, and flow
> diagrams for future reference.

## Features

- Half-sleeve, full-sleeve, and **polo (collared)** t-shirt templates with real **front and back** photos
- 15 preset shirt colors plus a custom color picker (plain shirts)
- Live design canvas powered by [Fabric.js](http://fabricjs.com/)
- Independent **front** and **back** design surfaces
- A clearly marked **print safe-zone** so designs stay printable
- Tools:
  - **Text** — editable, with font, size, color, bold/italic, and alignment
  - **Image upload** — PNG/JPG/SVG/WEBP (validated by type and size)
  - **Pen** — freehand drawing with adjustable color and brush size
  - **Shapes** — rectangle, circle, line (auto-colored to contrast the shirt)
  - Duplicate, delete, bring forward / send backward
  - **Align** the selection to the print-area center (horizontal / vertical)
- **Layers** panel with select, show/hide, lock, and delete
- **Undo / redo** (with availability-aware buttons) and arrow-key nudging
- **Zoom** controls (out / in / reset / fit-to-screen) with auto-fit on load & resize
- Adaptive UI: overlay labels and the canvas backdrop recolor for legibility based
  on the selected shirt color
- Polished UX: toast notifications, auto-save indicator, confirm dialogs, a
  keyboard-shortcuts cheat sheet, tooltips, and an error boundary
- **Responsive + touch-friendly** — works on desktop, iPad, and phone
- High-quality export:
  - Print-ready PNG (design only, transparent, cropped to print area, 4× resolution)
  - Full design PNG (transparent, high resolution)
  - Mockup PNG (shirt + design composited)
  - Mockup PDF

## Keyboard shortcuts

| Action            | Shortcut                            |
| ----------------- | ----------------------------------- |
| Undo              | `Cmd/Ctrl + Z`                      |
| Redo              | `Cmd/Ctrl + Shift + Z` or `Ctrl+Y`  |
| Duplicate         | `Cmd/Ctrl + D`                      |
| Delete            | `Delete` / `Backspace`              |
| Deselect          | `Esc`                               |
| Nudge selection   | Arrow keys (1px) · `Shift`+Arrow (10px) |
| Export            | `Cmd/Ctrl + S`                      |
| Shortcuts help    | `?`                                 |

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

### Other scripts

```bash
npm run build     # type-check and build for production (outputs to dist/)
npm run preview   # preview the production build locally
npm run lint      # type-check only (tsc --noEmit)
```

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Fabric.js** — canvas engine (objects, text, free drawing, serialization, high-DPI export)
- **Zustand** (with `persist`) — app/config state and localStorage persistence
- **jsPDF** — PDF export
- **Tailwind CSS** — styling

## Project structure

A condensed view of the core modules is below. For the **complete file tree and
architecture/flow diagrams**, see [`spec.md`](./spec.md).

```
src/
  components/
    Editor/
      CanvasStage.tsx     # Fabric canvas + shirt underlay + front/back + safe zone
      Toolbar.tsx         # tool rail (text, image, pen, shapes, undo/redo, ...)
      PropertiesPanel.tsx # selection properties + layers panel
    ColorSwatches.tsx     # shared color picker
    ExportDialog.tsx      # export options + mockup preview
    TemplatePicker.tsx    # landing screen (style + color selection)
    icons.tsx             # inline SVG icons
  lib/
    constants.ts          # canvas size, print area, colors, fonts
    fabricCanvas.ts        # canvas singleton, object ops, pen, history
    exportDesign.ts       # PNG / mockup / PDF export + native download
    shirtTemplates.tsx    # ShirtMockup component (photo + multiply tint)
  store/
    useDesignStore.ts     # Zustand store (persisted)
  types/
    index.ts
```

## How it works

- The shirt is a **photographic mockup** (a white cotton shirt photo with a transparent
  background, in `public/shirts/`). It is recolored the way professional mockup generators
  do: a solid color layer is masked to the shirt shape and composited with
  `mix-blend-mode: multiply` over the photo, so the real folds, shadows, and highlights are
  preserved and any color looks like genuine dyed fabric. The Fabric design canvas sits
  transparently on top of the chest print area.
- Front and back are kept as separate serialized Fabric JSON documents. Toggling sides
  serializes the current side and loads the other.
- Exports use Fabric's `toDataURL({ multiplier: 4 })` for crisp, print-quality output.
  The print-ready export is cropped to the safe-zone rectangle.

## Security notes

- Uploaded images are read via `FileReader` as data URLs and validated by MIME type and
  size. No user input is ever passed to file-system, `require`, `eval`, or shell APIs
  (this is a client-only app).
