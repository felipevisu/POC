// Ported from LocalCan/invisible-captcha (MIT) story.ts.

// Jev reads words and can't do math, so every measurement becomes a phrase from these tables.
// Each row is [upper bound, words]: the first row whose bound is >= the value wins. Tune freely.

const COUNT = [
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
  [5, 'a few'],
  [9, 'several'],
  [Infinity, 'many'],
]
const VISIT_MS = [
  [1_500, 'about a second'],
  [5_000, 'a few seconds'],
  [20_000, 'about ten seconds'],
  [45_000, 'about half a minute'],
  [120_000, 'a minute or two'],
  [Infinity, 'several minutes'],
]
const HOVER_MS = [
  [40, 'for no time at all'],
  [250, 'only briefly'],
  [2_000, 'for a moment'],
  [Infinity, 'for a long moment'],
]
const PRESS_MS = [
  [10, 'an instant'],
  [40, 'a very short'],
  [250, 'a normal-length'],
  [Infinity, 'a long'],
]
const PRESS_OFFSET = [
  [0.08, 'dead centre'],
  [0.35, 'a little off centre'],
  [Infinity, 'well off centre'],
]
const STRAIGHT_SHARE = [
  [0.2, 'mostly curved'],
  [0.6, 'some curved and some straight'],
  [Infinity, 'mostly in straight lines'],
]
const KEY_GAP_CV = [
  [0.12, 'very even'],
  [0.3, 'fairly even'],
  [Infinity, 'uneven'],
]
const KEY_GAP_MS = [
  [30, 'extremely fast'],
  [90, 'fast'],
  [250, 'steady'],
  [Infinity, 'slow'],
]

// A real mouse reports dozens of positions per stroke. Automation often teleports in one or two.
const MIN_MOVES_PER_GLIDE = 3
const QUICK_START_MS = 300
// One press without a move can be a cursor that was already resting on the field.
const MIN_PRESSES_WITHOUT_MOVE = 2

const BROWSER_NAMES = {
  chrome: 'Chrome',
  edge: 'Edge',
  firefox: 'Firefox',
  safari: 'Safari',
  samsung: 'Samsung Internet',
  'headless-chrome': 'headless Chrome',
  'http-library': 'an HTTP library',
  other: 'an unrecognised browser',
}
const OS_NAMES = {
  macos: 'macOS',
  windows: 'Windows',
  ios: 'iOS',
  android: 'Android',
  linux: 'Linux',
  chromeos: 'ChromeOS',
  other: 'an unrecognised system',
}
const CHROMIUM = ['chrome', 'edge', 'samsung', 'headless-chrome']

const words = (table, value) =>
  (table.find(([upTo]) => value <= upTo) ?? table[table.length - 1])[1]
const count = (n, noun) => `${words(COUNT, n)} ${noun}${n === 1 ? '' : 's'}`
const capitalise = (text) => text[0].toUpperCase() + text.slice(1)
const subject = (n, noun) =>
  capitalise(`${count(n, noun)} ${n === 1 ? 'was' : 'were'}`)

function browserSentence(f) {
  if (f.browser === 'http-library') return 'The request comes from an HTTP library, not a browser.'
  const claim = `The browser identifies as ${BROWSER_NAMES[f.browser]} on ${OS_NAMES[f.os]}`
  // Every iOS browser is WebKit underneath, so Chrome on iOS rightly sends no client hints.
  if (!CHROMIUM.includes(f.browser) || f.os === 'ios') return `${claim}.`
  const hints = f.clientHintsPresent ? 'and sends' : 'but sends no'
  return `${claim} ${hints} client hints.`
}

function pointerSentence(s) {
  const pointer = s.pointerTypes.includes('mouse') ? 'mouse' : 'pen'
  if (s.strokes === 0)
    return !s.pointerTypes.includes('touch') && 'No pointer movement was recorded.'
  const moves = count(s.strokes, 'move')
  if (s.pointerMoves / s.strokes < MIN_MOVES_PER_GLIDE) {
    return `The ${pointer} pointer jumped to its targets in ${moves} instead of gliding.`
  }
  const shape = words(STRAIGHT_SHARE, s.straightStrokes / s.strokes)
  return `A ${pointer} moved in ${count(s.strokes, 'stroke')}, ${shape}.`
}

function focusSentence(s) {
  const byTab = s.focusByTab > 0
  const byPointer = s.focusByPointer > 0
  const pointing = s.pointerTypes.includes('touch') ? 'tapping' : 'clicking'
  if (byTab && byPointer) return `The fields were reached by ${pointing} and with the Tab key.`
  if (byTab) return 'The fields were reached with the Tab key.'
  if (byPointer) return `The fields were reached by ${pointing} them.`
  return s.fieldsTyped > 0 && 'The fields received focus without a click, tap or Tab key.'
}

function typingSentence(s) {
  const speed = s.medianKeyGapMs === null ? '' : words(KEY_GAP_MS, s.medianKeyGapMs)
  const pace = speed && ` at ${/^[aeiou]/.test(speed) ? 'an' : 'a'} ${speed} pace`
  const rhythm =
    s.keyGapCv === null ? '' : ` with ${words(KEY_GAP_CV, s.keyGapCv)} gaps between keys`
  return `${subject(s.fieldsTyped, 'field')} typed${pace}${rhythm}.`
}

function pressSentence(s) {
  const press = s.pressMs === null ? '' : words(PRESS_MS, s.pressMs)
  const offset = s.pressOffset === null ? '' : ` ${words(PRESS_OFFSET, s.pressOffset)}`
  if (s.submitVia === 'enter') return 'The form was submitted with the Enter key.'
  if (s.submitVia === 'space') return 'The button was pressed with the Space key.'
  if (s.submitVia === 'none') return 'The form was submitted without a click, tap or key press.'
  if (s.submitVia === 'tap') return `The button got ${press || 'a'} tap${offset}.`
  if (!press) return 'The button received a click with no pointer press.'
  if (s.hoverMsBeforePress === null) return `The button got ${press} press${offset}.`
  const hover = words(HOVER_MS, s.hoverMsBeforePress)
  return `The pointer rested on the button ${hover} before ${press} press${offset}.`
}

/** Describes a visit in short, literal sentences. Every word comes from this file. */
export function writeStory(s, f) {
  const isPhone = f.os === 'ios' || f.os === 'android'
  const fillsScreen = s.screenW > 0 && s.viewportW === s.screenW && s.viewportH === s.screenH
  const headlessHints = f.headlessToken && f.browser !== 'headless-chrome'
  const filled = s.fieldsFilledWithoutKeys
  const autofilled = s.fieldsMarkedAutofill
  const firstInput = s.msToFirstInteraction
  const quickStart = firstInput !== null && firstInput < QUICK_START_MS
  const scrolled = s.scrollReversals > 0 ? ', changing direction' : ''

  const sentences = [
    browserSentence(f),
    f.chromiumHintsMismatch && 'It sends client hints, which only Chromium browsers send.',
    headlessHints && 'Its client hints name a headless browser.',
    f.declaredAgent && `The user agent declares an AI agent from ${f.declaredAgent}.`,
    f.signaturePresent && 'It carries an unverified Web Bot Auth signature, as AI agents do.',
    s.webdriver && 'The browser reports that automation software controls it.',
    isPhone && s.maxTouchPoints === 0 && 'It claims a phone system but reports no touchscreen.',
    fillsScreen && 'The page fills the entire screen, with no room for browser toolbars.',
    pointerSentence(s),
    s.pressesWithoutMove >= MIN_PRESSES_WITHOUT_MOVE &&
      `The pointer pressed ${count(s.pressesWithoutMove, 'spot')} without moving to any of them.`,
    s.pointerTypes.includes('touch') && 'The screen was touched, as on a phone or tablet.',
    focusSentence(s),
    s.fieldsTyped > 0 && typingSentence(s),
    s.backspaces > 0 && `${subject(s.backspaces, 'correction')} made with Backspace.`,
    s.pastes > 0 && `Text was pasted ${count(s.pastes, 'time')}.`,
    filled > 0 && `${subject(filled, 'field')} filled without typing or pasting.`,
    autofilled > 0 && `The browser marked ${count(autofilled, 'field')} as autofilled.`,
    pressSentence(s),
    !s.submitTrusted && 'The submit came from a synthetic event created by page script.',
    firstInput === null && 'There was no pointer, key or touch input during the visit.',
    quickStart && 'The first input came almost as soon as the page loaded.',
    s.scrolls > 0 && `The page was scrolled ${count(s.scrolls, 'time')}${scrolled}.`,
    s.windowBlurs > 0 && `The window lost focus ${count(s.windowBlurs, 'time')} during the visit.`,
    `The visit took ${words(VISIT_MS, s.msOnPage)}.`,
  ]
  return sentences.filter((sentence) => typeof sentence === 'string')
}
