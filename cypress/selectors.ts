export const containers = {
  calendarContainer: '.dp-calendar-container',
  controlsContainer: '.dp-controls-container',
  weekdaysContainer: '.dp-weekdays-container',
  monthYearContainer: '.dp-month-year-container',
  daysContainer: '.dp-days-container',
  overlayContainer: '.dp-overlay-container',
  overlayInputContainer: '.dp-overlay-input-container',
  overlayMonthsContainer: '.dp-overlay-months-container',
} as const

export const controls = {
  leftArrow: '.dp-left-arrow',
  rightArrow: '.dp-right-arrow',
  monthName: '.dp-month-name',
  year: '.dp-year',
} as const

export const days = {
  day: '.dp-day',
  disabledDate: '.dp-disabled-date',
  selectedDate: '.dp-selected-date',
  rangeStart: '.dp-range-start',
  rangeEnd: '.dp-range-end',
  rangeDate: '.dp-range-date',
  today: '.dp-today',
} as const

export const overlay = {
  input: '.dp-overlay-input',
  close: '.dp-overlay-close',
  submit: '.dp-overlay-submit',
  month: '.dp-overlay-month',
} as const

export const other = {
  none: '.dp-dn',
  overlayIn: '.dp-overlay-in',
  overlayOut: '.dp-overlay-out',
  overlayShown: '.dp-overlay-shown',
  overlayHidden: '.dp-overlay-hidden',
  blur: '.dp-blur',
  centered: '.dp-centered',
  arrow: '.dp-arrow',
  disableTransition: '.dp-disable-transition',
} as const

export const testElements = {
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
