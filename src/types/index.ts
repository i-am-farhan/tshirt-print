// Shirt style. (Named `Sleeve` for historical reasons; `polo` is a collared
// short-sleeve style rather than a sleeve length, but it shares the same plumbing.)
export type Sleeve = 'half' | 'full' | 'polo'
export type Side = 'front' | 'back'
export type Tool = 'select' | 'pen'
export type Screen = 'picker' | 'editor'

// Serialized Fabric canvas state. Kept loose on purpose: Fabric's JSON shape is
// version-specific and we only ever round-trip it through Fabric itself.
export type CanvasJSON = Record<string, unknown> | null
