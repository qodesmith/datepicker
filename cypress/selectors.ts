import {ExpandRecursively} from '../src/types'

type SelectorsObj<T extends Record<any, string>> = {
  [K in keyof T]: `.${T[K]}`
}

function clsToSelector<T extends Record<any, string>>(
  obj: T
): ExpandRecursively<SelectorsObj<T>> {
  return Object.keys(obj).reduce((acc, key: keyof T) => {
    acc[key] = `.${obj[key]}`
    return acc
  }, {} as SelectorsObj<T>) as ExpandRecursively<SelectorsObj<T>>
}

export const containersCls = {
  calendarContainer: 'dp-calendar-container',
  controlsContainer: 'dp-controls-container',
  weekdaysContainer: 'dp-weekdays-container',
  monthYearContainer: 'dp-month-year-container',
  daysContainer: 'dp-days-container',
  overlayContainer: 'dp-overlay-container',
  overlayInputContainer: 'dp-overlay-input-container',
  overlayMonthsContainer: 'dp-overlay-months-container',
} as const

export const containers = clsToSelector(containersCls)

export const controlsCls = {
  leftArrow: 'dp-arrow-left',
  rightArrow: 'dp-arrow-right',
  monthName: 'dp-month-name',
  year: 'dp-year',
} as const

export const controls = clsToSelector(controlsCls)

export const daysCls = {
  day: 'dp-day',
  displayedDays: 'dp-day:not(.dp-dn)',
  disabledDate: 'dp-disabled-date',
  selectedDate: 'dp-selected-date',
  rangeStart: 'dp-range-start',
  rangeEnd: 'dp-range-end',
  rangeDate: 'dp-range-date',
  today: 'dp-today',
  event: 'dp-event',
  otherMonthDay: 'dp-other-month-day',
} as const

export const days = clsToSelector(daysCls)

export const overlayCls = {
  input: 'dp-overlay-input',
  close: 'dp-overlay-close',
  submit: 'dp-overlay-submit',
  month: 'dp-overlay-month',
} as const

export const overlay = clsToSelector(overlayCls)

export const otherCls = {
  none: 'dp-dn',
  overlayIn: 'dp-overlay-in',
  overlayOut: 'dp-overlay-out',
  overlayShown: 'dp-overlay-shown',
  overlayHidden: 'dp-overlay-hidden',
  blur: 'dp-blur',
  centered: 'dp-centered',
  arrow: 'dp-arrow',
  disableTransition: 'dp-disable-transition',
  weekday: 'dp-weekday',
} as const

export const other = clsToSelector(otherCls)

export const testElementIds = {
  // Header
  unfocus: '#unfocus',

  // Input Section
  inputSection: '#input-section',
  singleInput: '#single-input',

  // Single Standalone
  singleStandalone: '#single-standalone',

  // Daterange Standalone
  rangeStandaloneSection: '#range-standalone-section',
  rangeStandalone1: '#range-standalone-one',
  rangeStandalone2: '#range-standalone-two',

  // Daterange Inputs
  rangeInputSection: '#range-input-section',
  rangeInputsContainer: '#range-inputs-container',
  rangeInputStart: '#range-input-start',
  rangeInputEnd: '#range-input-end',
} as const

export const wackyBits = {
  wackySection: '#other-wacky-bits-section',
  idStartingWithNumber: '#1-number-id',
  wackyDiv: '.wacky-div',
  wackySpan: '.wacky-span',
  wackyAside: '.wacky-aside',
} as const
