// Offline check of the signals -> story path (no Jev call): node server/selfcheck.js
import assert from 'node:assert/strict'
import { requestFacts } from './facts.js'
import { SignalsError, validateSignals } from './signals.js'
import { writeStory } from './story.js'

const bot = validateSignals({
  maxTouchPoints: 0, viewportW: 1280, viewportH: 720, screenW: 1280, screenH: 720, dpr: 1, msOnPage: 900,
  pointerMoves: 0, strokes: 0, straightStrokes: 0, keystrokes: 40, backspaces: 0, pastes: 0, tabs: 0,
  fieldsTyped: 3, fieldsFilledWithoutKeys: 0, fieldsMarkedAutofill: 0, focusByTab: 0, focusByPointer: 0,
  scrolls: 0, scrollReversals: 0, windowBlurs: 0, pressesWithoutMove: 4,
  msToFirstInteraction: 50, hoverMsBeforePress: null, pressOffset: 0, pressMs: 2, keyGapCv: 0.01,
  medianKeyGapMs: 5, webdriver: true, submitTrusted: true, pointerTypes: ['mouse'], submitVia: 'click',
  extra: 'dropped',
})
assert.equal(bot.extra, undefined)
assert.throws(() => validateSignals({ ...bot, webdriver: 'yes' }), SignalsError)

const story = writeStory(bot, requestFacts({ 'user-agent': 'Mozilla/5.0 (Macintosh) HeadlessChrome/140.0' }))
assert.ok(story.includes('The browser reports that automation software controls it.'))
assert.ok(story.includes('The pointer pressed a few spots without moving to any of them.'))
assert.ok(story.includes('Three fields were typed at an extremely fast pace with very even gaps between keys.'))
console.log(story.join('\n'))
console.log('selfcheck ok')
