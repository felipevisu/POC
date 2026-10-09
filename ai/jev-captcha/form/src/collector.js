// Ported from LocalCan/invisible-captcha (MIT): https://github.com/LocalCan/invisible-captcha/blob/main/public/collector.js
// Measures how the form gets filled in. Only counts, durations, flags and a few fixed words leave
// the page: snapshot() returns that summary, never the raw events or anything the visitor typed.

const STROKE_PAUSE_MS = 150 // a pause this long ends one mouse stroke and starts the next
const STRAIGHT_RATIO = 0.98 // displacement / path length at or above this is a straight stroke
const TYPING_PAUSE_MS = 2_000 // longer gaps are thinking, not typing rhythm
const SUBMIT_WINDOW_MS = 1_000 // how recent an input must be to count as the one that submitted
const LISTEN = { capture: true, passive: true }

function isAutofilled(field) {
  return [':autofill', ':-webkit-autofill'].some((selector) => {
    try {
      return field.matches(selector)
    } catch {
      return false // this browser does not know the selector
    }
  })
}

export function startCollector(form) {
  const start = performance.now()
  const button = form.querySelector('[type="submit"]')
  const fields = [...form.querySelectorAll('input, textarea')]
  const isField = (target) => fields.includes(target)

  const n = {
    pointerMoves: 0,
    strokes: 0,
    straightStrokes: 0,
    keystrokes: 0,
    backspaces: 0,
    pastes: 0,
    tabs: 0,
    focusByTab: 0,
    focusByPointer: 0,
    scrolls: 0,
    scrollReversals: 0,
    windowBlurs: 0,
    pressesWithoutMove: 0,
  }
  const pointerTypes = new Set()
  const keyed = new Set()
  const pasted = new Set()
  const autofilled = new Set()
  const keyGaps = []
  const last = { tab: -Infinity, pointerDown: -Infinity, key: null, submitKey: null, click: null }
  let firstInputAt = null
  let hoverSince = null
  let stroke = null // the mouse stroke in progress
  let press = null // the latest press on the submit button
  let movedSincePress = false
  let scroll = { at: -Infinity, y: scrollY, dir: 0 }

  // Only trusted events count, so a script cannot fake input by dispatching events of its own.
  const on = (target, type, fn) =>
    target.addEventListener(type, (e) => e.isTrusted && fn(e), LISTEN)
  const noteInput = (e) => (firstInputAt ??= e.timeStamp - start)

  function endStroke() {
    if (!stroke) return
    n.strokes++
    const direct = Math.hypot(stroke.x - stroke.x0, stroke.y - stroke.y0)
    if (stroke.points >= 3 && stroke.path > 0 && direct / stroke.path >= STRAIGHT_RATIO) {
      n.straightStrokes++
    }
    stroke = null
  }

  on(window, 'pointermove', (e) => {
    noteInput(e)
    pointerTypes.add(e.pointerType)
    if (e.pointerType === 'touch') return
    n.pointerMoves++
    movedSincePress = true
    if (stroke && e.timeStamp - stroke.at >= STROKE_PAUSE_MS) endStroke()
    stroke ??= { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, path: 0, points: 0 }
    stroke.path += Math.hypot(e.clientX - stroke.x, e.clientY - stroke.y)
    stroke.points++
    Object.assign(stroke, { x: e.clientX, y: e.clientY, at: e.timeStamp })
  })

  on(button, 'pointerenter', (e) => (hoverSince = e.timeStamp))
  on(button, 'pointerleave', () => (hoverSince = null))

  on(window, 'pointerdown', (e) => {
    noteInput(e)
    pointerTypes.add(e.pointerType)
    last.pointerDown = e.timeStamp
    // A hand has to move a mouse to reach the next target. Automation can press where it likes.
    if (e.pointerType !== 'touch') {
      if (!movedSincePress) n.pressesWithoutMove++
      movedSincePress = false
    }
    if (!button.contains(e.target)) return
    const box = button.getBoundingClientRect()
    const dx = e.clientX - (box.left + box.width / 2)
    const dy = e.clientY - (box.top + box.height / 2)
    const offset = Math.min(1, Math.hypot(dx, dy) / Math.hypot(box.width / 2, box.height / 2))
    const hover = e.pointerType !== 'touch' && hoverSince !== null ? e.timeStamp - hoverSince : null
    press = { type: e.pointerType, downAt: e.timeStamp, upAt: null, offset, hover }
  })
  on(window, 'pointerup', (e) => {
    if (press && press.upAt === null) press.upAt = e.timeStamp
  })

  on(window, 'keydown', (e) => {
    // Chrome's autofill sends each field a trusted keydown that is a plain Event with no key.
    if (typeof e.key !== 'string') return
    noteInput(e)
    const field = isField(e.target) ? e.target : null
    const erase = e.key === 'Backspace' || e.key === 'Delete'
    if (erase) n.backspaces++
    if (e.key === 'Tab') {
      n.tabs++
      last.tab = e.timeStamp
    }
    const enter = e.key === 'Enter' && e.target.tagName !== 'TEXTAREA'
    const space = e.key === ' ' && e.target === button
    if (enter || space) last.submitKey = { key: e.key, at: e.timeStamp }

    // Only keys that edit the text mark a field as typed: not Tab, arrows, Enter or Cmd+V.
    // Android keyboards report most keys as "Unidentified" and IMEs send "Process".
    // Windows reports AltGr as Ctrl+Alt, and AltGr types characters such as @ on many layouts.
    const printable = e.key.length === 1 || e.key === 'Unidentified' || e.key === 'Process'
    const shortcut = (e.ctrlKey && !e.altKey) || e.metaKey
    if (!field || shortcut || !(printable || erase)) return
    keyed.add(field)
    if (!printable) return
    n.keystrokes++
    const gap = last.key?.field === field ? e.timeStamp - last.key.at : Infinity
    if (gap < TYPING_PAUSE_MS) keyGaps.push(gap)
    last.key = { field, at: e.timeStamp }
  })

  on(window, 'paste', (e) => {
    n.pastes++
    if (isField(e.target)) pasted.add(e.target)
  })
  on(form, 'input', (e) => {
    if (isField(e.target) && isAutofilled(e.target)) autofilled.add(e.target)
  })
  on(form, 'focusin', (e) => {
    if (!isField(e.target)) return
    if (e.timeStamp - last.tab < 200) n.focusByTab++
    else if (e.timeStamp - last.pointerDown < 500) n.focusByPointer++
  })
  on(window, 'scroll', (e) => {
    if (e.target !== document) return
    const dir = Math.sign(scrollY - scroll.y)
    if (e.timeStamp - scroll.at >= STROKE_PAUSE_MS) n.scrolls++
    if (dir && scroll.dir && dir !== scroll.dir) n.scrollReversals++
    scroll = { at: e.timeStamp, y: scrollY, dir: dir || scroll.dir }
  })
  on(window, 'blur', (e) => {
    if (e.target === window) n.windowBlurs++
  })
  // Deliberately not filtered: a click on the button that a script made up is worth knowing about.
  const noteClick = (e) => (last.click = { at: e.timeStamp, trusted: e.isTrusted })
  button.addEventListener('click', noteClick, true)

  function snapshot(submitEvent) {
    endStroke()
    const now = submitEvent.timeStamp
    const recent = (at) => at != null && now - at < SUBMIT_WINDOW_MS

    let submitVia = 'none'
    let pressed = { hover: null, offset: null, ms: null }
    if (recent(press?.upAt)) {
      submitVia = press.type === 'touch' ? 'tap' : 'click'
      pressed = { ...press, ms: press.upAt - press.downAt }
    } else if (recent(last.submitKey?.at)) {
      submitVia = last.submitKey.key === 'Enter' ? 'enter' : 'space'
    } else if (recent(last.click?.at) && last.click.trusted) {
      submitVia = 'click' // a click with no pointer press, as screen readers send
    }
    const fakeClick = recent(last.click?.at) && !last.click.trusted

    const mean = keyGaps.reduce((sum, gap) => sum + gap, 0) / keyGaps.length
    const sd = Math.sqrt(keyGaps.reduce((sum, gap) => sum + (gap - mean) ** 2, 0) / keyGaps.length)
    const sortedGaps = [...keyGaps].sort((a, b) => a - b)
    const untyped = fields.filter((f) => f.value !== '' && !keyed.has(f) && !pasted.has(f))
    for (const field of fields) if (isAutofilled(field)) autofilled.add(field)

    return {
      ...n,
      webdriver: navigator.webdriver === true,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
      viewportW: innerWidth,
      viewportH: innerHeight,
      screenW: screen.width,
      screenH: screen.height,
      dpr: devicePixelRatio,
      msToFirstInteraction: firstInputAt,
      msOnPage: now - start,
      pointerTypes: [...pointerTypes].filter((type) => ['mouse', 'touch', 'pen'].includes(type)),
      submitVia,
      submitTrusted: submitEvent.isTrusted && !fakeClick,
      hoverMsBeforePress: pressed.hover,
      pressOffset: pressed.offset,
      pressMs: pressed.ms,
      keyGapCv: keyGaps.length >= 5 ? (mean > 0 ? sd / mean : 0) : null,
      medianKeyGapMs: keyGaps.length > 0 ? sortedGaps[Math.floor(sortedGaps.length / 2)] : null,
      fieldsTyped: keyed.size,
      fieldsFilledWithoutKeys: untyped.length,
      fieldsMarkedAutofill: autofilled.size,
    }
  }

  return { snapshot }
}
