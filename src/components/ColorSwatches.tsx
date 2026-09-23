import { SHIRT_COLORS } from '../lib/constants'

interface ColorSwatchesProps {
  value: string
  onChange: (hex: string) => void
  allowCustom?: boolean
}

export function ColorSwatches({ value, onChange, allowCustom = true }: ColorSwatchesProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SHIRT_COLORS.map((c) => {
          const selected = value.toLowerCase() === c.hex.toLowerCase()
          return (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={selected}
              onClick={() => onChange(c.hex)}
              className={`h-8 w-8 rounded-full border transition ${
                selected
                  ? 'ring-2 ring-indigo-500 ring-offset-2'
                  : 'border-slate-300 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          )
        })}
      </div>
      {allowCustom && (
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span>Custom</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
          />
          <span className="font-mono text-xs uppercase text-slate-500">{value}</span>
        </label>
      )}
    </div>
  )
}
