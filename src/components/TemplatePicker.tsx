import { useDesignStore } from '../store/useDesignStore'
import { SLEEVE_LABELS } from '../lib/constants'
import { ShirtMockup } from '../lib/shirtTemplates'
import { ColorSwatches } from './ColorSwatches'
import {
  ShirtIcon,
  ArrowRightIcon,
  TextIcon,
  ImageIcon,
  PenIcon,
  PaletteIcon,
  LayersIcon,
  DownloadIcon,
  SparklesIcon,
  SaveIcon,
  FlipIcon,
  BoltIcon,
  CheckIcon,
} from './icons'
import type { Sleeve } from '../types'

const SLEEVES: Sleeve[] = ['half', 'full', 'polo']

export function TemplatePicker() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <NavBar />
      <Hero />
      <StatStrip />
      <Features />
      <HowItWorks />
      <Showcase />
      <CtaBanner />
      <Footer />
    </div>
  )
}

function NavBar() {
  const openEditor = useDesignStore((s) => s.openEditor)
  return (
    <header className="lg-surface sticky top-0 z-30 rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <ShirtIcon width={18} height={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Tee Studio</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-900">Features</a>
          <a href="#how" className="transition hover:text-slate-900">How it works</a>
          <a href="#showcase" className="transition hover:text-slate-900">Showcase</a>
        </nav>
        <button type="button" onClick={openEditor} className="btn-primary">
          Open studio <ArrowRightIcon width={16} height={16} />
        </button>
      </div>
    </header>
  )
}

function Hero() {
  const sleeve = useDesignStore((s) => s.sleeve)
  const color = useDesignStore((s) => s.color)
  const setSleeve = useDesignStore((s) => s.setSleeve)
  const setColor = useDesignStore((s) => s.setColor)
  const openEditor = useDesignStore((s) => s.openEditor)

  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* Full-bleed gradient + texture */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-20 -z-10 h-[26rem] w-[26rem] rounded-full bg-sky-300/30 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-32 pt-16 lg:grid-cols-2 lg:px-10 lg:pt-24">
        <div className="min-w-0 text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <SparklesIcon width={14} height={14} /> Design studio right in your browser
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Design a t-shirt that's{' '}
            <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
              unmistakably yours
            </span>
            .
          </h1>
          <p className="mt-5 max-w-md text-lg text-indigo-100">
            Pick a style and color, then add text, upload artwork, and draw freehand. Export a
            print-ready, high-resolution design for the front and back — no sign-up required.
          </p>

          {/* Live configurator (elevated material card) */}
          <div className="mt-8 max-w-md rounded-2xl bg-white p-5 text-slate-900 shadow-2xl ring-1 ring-black/5">
            <h3 className="field-label">1. Choose a style</h3>
            <div className="grid grid-cols-3 gap-2">
              {SLEEVES.map((s) => {
                const active = sleeve === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSleeve(s)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="canvas-checkerboard flex w-full justify-center rounded-lg py-1">
                      <ShirtMockup sleeve={s} color={color} className="h-12 w-auto" />
                    </span>
                    <span className="text-xs font-semibold leading-tight text-slate-700">
                      {SLEEVE_LABELS[s]}
                    </span>
                  </button>
                )
              })}
            </div>

            <h3 className="field-label mt-5">2. Pick a color</h3>
            <ColorSwatches value={color} onChange={setColor} />

            <button
              type="button"
              onClick={openEditor}
              className="btn-primary mt-5 w-full py-3 text-base"
            >
              Start designing <ArrowRightIcon width={18} height={18} />
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Free · Works offline · Auto-saves your work
            </p>
          </div>
        </div>

        {/* Big preview (desktop only — the configurator already shows a live mini preview) */}
        <div className="relative hidden justify-center lg:flex lg:justify-end">
          <div className="relative rounded-3xl bg-white/95 p-8 shadow-2xl ring-1 ring-black/5">
            <div className="canvas-checkerboard rounded-2xl p-2">
              <ShirtMockup sleeve={sleeve} color={color} className="h-[460px] w-auto" />
            </div>
            <span className="absolute right-6 top-6 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
              Live preview
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatStrip() {
  const stats = [
    { value: '3', label: 'Shirt styles' },
    { value: '15+', label: 'Fabric colors' },
    { value: '2', label: 'Print sides' },
    { value: '4K', label: 'Export quality' },
  ]
  return (
    <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-6 lg:px-10">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl ring-1 ring-black/5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-extrabold text-indigo-600">{s.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: TextIcon, title: 'Custom text', desc: 'Add headlines and slogans with fonts, colors, weight, and alignment.', tint: 'bg-indigo-50 text-indigo-600' },
  { icon: ImageIcon, title: 'Upload artwork', desc: 'Drop in PNG, JPG, or SVG logos and photos — scaled to the print area.', tint: 'bg-emerald-50 text-emerald-600' },
  { icon: PenIcon, title: 'Freehand pen', desc: 'Sketch and doodle directly on the shirt with an adjustable brush.', tint: 'bg-rose-50 text-rose-600' },
  { icon: PaletteIcon, title: '15+ colors', desc: 'Choose from a curated palette or dial in any custom hex you like.', tint: 'bg-amber-50 text-amber-600' },
  { icon: FlipIcon, title: 'Front & back', desc: 'Design both sides independently and switch between them instantly.', tint: 'bg-sky-50 text-sky-600' },
  { icon: LayersIcon, title: 'Layers & shapes', desc: 'Reorder, lock, hide, and combine text, shapes, and images.', tint: 'bg-violet-50 text-violet-600' },
  { icon: DownloadIcon, title: 'HD export', desc: 'Print-ready PNG (4×), full-design PNG, mockup PNG, and PDF.', tint: 'bg-fuchsia-50 text-fuchsia-600' },
  { icon: SaveIcon, title: 'Auto-save', desc: 'Your design is saved locally, so a refresh never loses your work.', tint: 'bg-teal-50 text-teal-600' },
]

function Features() {
  return (
    <section id="features" className="bg-white pb-20 pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Everything you need"
          title="A full design toolkit, zero learning curve"
          subtitle="From a quick slogan tee to a fully illustrated piece — the studio has the tools without the clutter."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1.5 hover:shadow-xl"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.tint} transition group-hover:scale-110`}>
                <f.icon />
              </span>
              <h3 className="mt-5 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { n: 1, title: 'Choose a style', desc: 'Half sleeve, full sleeve, or polo — then pick your fabric color.' },
  { n: 2, title: 'Customize', desc: 'Add text, upload art, draw, and arrange layers on front and back.' },
  { n: 3, title: 'Preview', desc: 'See an instant, realistic mockup of your shirt as you design.' },
  { n: 4, title: 'Export', desc: 'Download a high-resolution, print-ready file or PDF.' },
]

function HowItWorks() {
  return (
    <section id="how" className="relative isolate overflow-hidden bg-slate-950 py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-dots-light opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to print in four steps"
          subtitle="The whole flow runs in your browser — nothing to install."
          dark
        />
        <div className="relative mt-14 grid gap-6 md:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-extrabold text-white shadow-lg">
                {s.n}
              </span>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const SHOWCASE: { sleeve: Sleeve; color: string; name: string }[] = [
  { sleeve: 'half', color: '#c0392b', name: 'Classic Red' },
  { sleeve: 'full', color: '#1f2a44', name: 'Midnight Navy' },
  { sleeve: 'half', color: '#27ae60', name: 'Fresh Green' },
  { sleeve: 'full', color: '#6c3fb5', name: 'Royal Purple' },
  { sleeve: 'half', color: '#f1c40f', name: 'Sunbeam Gold' },
  { sleeve: 'full', color: '#e67e22', name: 'Ember Orange' },
  { sleeve: 'half', color: '#141414', name: 'Jet Black' },
  { sleeve: 'polo', color: '#2b50aa', name: 'Sport Polo' },
  { sleeve: 'polo', color: '#1e5631', name: 'Greens Polo' },
]

function Showcase() {
  const setSleeve = useDesignStore((s) => s.setSleeve)
  const setColor = useDesignStore((s) => s.setColor)
  const openEditor = useDesignStore((s) => s.openEditor)

  const start = (sleeve: Sleeve, color: string) => {
    setSleeve(sleeve)
    setColor(color)
    openEditor()
  }

  return (
    <section id="showcase" className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white py-24">
      <div className="absolute inset-0 -z-10 bg-dots opacity-50" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Showcase"
          title="One canvas, endless looks"
          subtitle="Tap any shirt to jump straight into the studio with that style and color."
        />
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {SHOWCASE.map((item) => (
            <button
              key={`${item.sleeve}-${item.color}`}
              type="button"
              onClick={() => start(item.sleeve, item.color)}
              className="group relative flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="canvas-checkerboard w-full rounded-xl p-3">
                <ShirtMockup sleeve={item.sleeve} color={item.color} className="mx-auto h-48 w-auto" />
              </div>
              <span className="mt-3 text-sm font-semibold text-slate-700">{item.name}</span>
              <span className="pointer-events-none absolute inset-x-0 bottom-5 flex translate-y-2 justify-center opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                <span className="btn-primary">
                  Customize <ArrowRightIcon width={16} height={16} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner() {
  const openEditor = useDesignStore((s) => s.openEditor)
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 py-20 text-center">
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="mx-auto max-w-3xl px-6">
        <BoltIcon className="mx-auto text-white/90" width={36} height={36} />
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white">
          Ready to make something great?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-indigo-100">
          Open the studio and have a print-ready design in minutes. It's free and works offline.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={openEditor}
            className="btn inline-flex bg-white px-7 py-3.5 text-base text-indigo-700 shadow-xl hover:bg-indigo-50 active:scale-[0.98]"
          >
            Start designing <ArrowRightIcon width={18} height={18} />
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-100">
            <CheckIcon width={16} height={16} /> No account needed
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShirtIcon width={16} height={16} />
          </span>
          <span className="font-bold text-white">Tee Studio</span>
        </div>
        <p className="text-sm text-slate-400">
          Built with React, Fabric.js &amp; Tailwind. A client-side demo app.
        </p>
        <div className="flex gap-6 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#showcase" className="hover:text-white">Showcase</a>
        </div>
      </div>
    </footer>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  dark,
}: {
  eyebrow: string
  title: string
  subtitle: string
  dark?: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">{eyebrow}</span>
      <h2
        className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      <p className={`mt-3 text-lg ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{subtitle}</p>
    </div>
  )
}
