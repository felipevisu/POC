// Ported from LocalCan/invisible-captcha (MIT) signals.ts. The schema is also the allowlist:
// a key not listed here never leaves validateSignals().
const COUNT = [0, 10_000]
const MS = [0, 3_600_000]
const DIM = [0, 10_000]

const NUMBERS = {
  maxTouchPoints: COUNT, viewportW: DIM, viewportH: DIM, screenW: DIM, screenH: DIM, dpr: [0, 10],
  msOnPage: MS, pointerMoves: COUNT, strokes: COUNT, straightStrokes: COUNT, keystrokes: COUNT,
  backspaces: COUNT, pastes: COUNT, tabs: COUNT, fieldsTyped: COUNT, fieldsFilledWithoutKeys: COUNT,
  fieldsMarkedAutofill: COUNT, focusByTab: COUNT, focusByPointer: COUNT, scrolls: COUNT,
  scrollReversals: COUNT, windowBlurs: COUNT, pressesWithoutMove: COUNT,
}
const NULLABLE_NUMBERS = {
  msToFirstInteraction: MS, hoverMsBeforePress: MS, pressOffset: [0, 1], pressMs: MS,
  keyGapCv: [0, 10], medianKeyGapMs: MS,
}
const FLAGS = ['webdriver', 'submitTrusted']
const POINTER_TYPES = ['mouse', 'touch', 'pen']
const SUBMIT_VIA = ['click', 'tap', 'enter', 'space', 'none']

export class SignalsError extends Error {}

function readNumber(raw, key, [min, max]) {
  const value = raw[key]
  if (!Number.isFinite(value)) throw new SignalsError(`${key} must be a finite number`)
  return Math.min(max, Math.max(min, value))
}

function oneOf(allowed, value, key) {
  if (!allowed.includes(value)) throw new SignalsError(`${key} is not an allowed value`)
  return value
}

/** Builds a fresh signals object from known keys only. Throws SignalsError on anything else. */
export function validateSignals(raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
    throw new SignalsError('signals must be an object')
  const out = {}
  for (const [key, range] of Object.entries(NUMBERS)) out[key] = readNumber(raw, key, range)
  for (const [key, range] of Object.entries(NULLABLE_NUMBERS)) {
    out[key] = raw[key] === null ? null : readNumber(raw, key, range)
  }
  for (const key of FLAGS) {
    if (typeof raw[key] !== 'boolean') throw new SignalsError(`${key} must be a boolean`)
    out[key] = raw[key]
  }
  const types = raw.pointerTypes
  if (!Array.isArray(types) || types.length > POINTER_TYPES.length)
    throw new SignalsError('pointerTypes must be a short array')
  out.pointerTypes = [...new Set(types.map((t) => oneOf(POINTER_TYPES, t, 'pointerTypes')))]
  out.submitVia = oneOf(SUBMIT_VIA, raw.submitVia, 'submitVia')
  return out
}
