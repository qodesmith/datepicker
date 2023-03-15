// TODO - don't export any functions that aren't consumed anywhere.

import {getOverlayClassName, getIsInput} from './utils'
import {
  InternalPickerData,
  SanitizedOptions,
  SelectorData,
  ViewType,
} from './types'

const arrowSVG = `
  <svg viewBox="0 0 24 24">
    <path d="M15 17.898C15 18.972 13.7351 19.546 12.9268 18.8388L6.61617 13.3169C5.81935 12.6197 5.81935 11.3801 6.61617 10.6829L12.9268 5.16108C13.7351 4.45388 15 5.02785 15 6.1018L15 17.898Z" fill="#212121"/>
  </svg>
`

type ControlElementsReturnType = {
  controlsContainer: HTMLDivElement
  leftArrow: HTMLDivElement
  rightArrow: HTMLDivElement
  monthYearContainer: HTMLDivElement
  monthName: HTMLDivElement
  year: HTMLDivElement
}

type CreateControlElementsInputType = {
  date: Date
  customMonths: CreateCalendarInput['customMonths']
  disableYearOverlay: SanitizedOptions['disableYearOverlay']
}
function createCalendarControlElements({
  date,
  customMonths,
  disableYearOverlay,
}: CreateControlElementsInputType): ControlElementsReturnType {
  const controlsContainer = document.createElement('div')
  const leftArrow = document.createElement('div')
  const rightArrow = document.createElement('div')
  const monthYearContainer = document.createElement('div')
  const monthName = document.createElement('div')
  const year = document.createElement('div')

  // Month
  const monthText = customMonths[date.getMonth()]
  monthName.textContent = monthText

  // Year
  const fullYear = date.getFullYear()
  year.textContent = `${fullYear}`

  // Arrows
  leftArrow.innerHTML = arrowSVG
  rightArrow.innerHTML = arrowSVG

  // Assign class names.
  controlsContainer.className = 'dp-controls-container'
  leftArrow.className = 'dp-arrow dp-arrow-left'
  rightArrow.className = 'dp-arrow dp-arrow-right'
  monthYearContainer.className = `dp-month-year-container${
    disableYearOverlay ? ' dp-disabled' : ''
  }`
  monthName.className = 'dp-month-name'
  year.className = 'dp-year'

  // Append all elements to their containers.
  monthYearContainer.append(monthName)
  monthYearContainer.append(year)
  controlsContainer.append(leftArrow)
  controlsContainer.append(monthYearContainer)
  controlsContainer.append(rightArrow)

  return {
    controlsContainer,
    leftArrow,
    rightArrow,
    monthYearContainer,
    monthName,
    year,
  }
}

/**
 * Creates an array of divs representing the 7 days of the week. If the
 * `customDays` option was used, the 1st 3 characters will be used for each day.
 * These elements are created once and are intended to be reused for each month
 */
function createWeekdayElements({
  weekDays,
  startDay,
}: {
  weekDays: SanitizedOptions['customDays']
  startDay: SanitizedOptions['startDay']
}): HTMLDivElement[] {
  const weekdayElements: HTMLDivElement[] = []

  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div')
    el.className = 'dp-weekday'

    // Weekday names are limited to 3 characters.
    el.textContent = weekDays[i].slice(0, 3)

    weekdayElements.push(el)
  }

  return weekdayElements
    .slice(startDay)
    .concat(weekdayElements.slice(0, startDay))
}

/**
 * Creates an array of divs representing the days in a given month. These
 * elements will be created once and are intended to be reused for each month.
 */
function createCalendarDayElements(): HTMLDivElement[] {
  return Array.from({length: 31}).map((_, i) => {
    const day = document.createElement('div')
    day.className = 'dp-day'
    day.textContent = `${i + 1}`
    return day
  })
}

type OverlayReturnType = {
  overlayContainer: HTMLDivElement
  inputContainer: HTMLDivElement
  input: HTMLInputElement
  overlayClose: HTMLDivElement
  overlayMonthsContainer: HTMLDivElement
  overlaySubmitButton: HTMLButtonElement
}

function createCalendarOverlay(
  overlayMonths: SanitizedOptions['overlayMonths'],
  defaultView: ViewType,
  overlayButtonText: SanitizedOptions['overlayButtonText'],
  overlayPlaceholder: CreateCalendarInput['overlayPlaceholder']
): OverlayReturnType {
  const overlayContainer = document.createElement('div')
  const inputContainer = document.createElement('div')
  const input = document.createElement('input')
  const overlayClose = document.createElement('div')
  const overlayMonthsContainer = document.createElement('div')
  const overlaySubmitButton = document.createElement('button')

  for (let i = 0; i < 12; i++) {
    const overlayMonth = document.createElement('div')
    overlayMonth.className = 'dp-overlay-month'
    overlayMonthsContainer.append(overlayMonth)

    // Overlay month names are limited to 3 characters.
    overlayMonth.textContent = overlayMonths[i].slice(0, 3)
    overlayMonth.dataset.num = `${i}`
  }

  // Append all the elements to their containers.
  inputContainer.append(input)
  inputContainer.append(overlayClose)
  overlayContainer.append(inputContainer)
  overlayContainer.append(overlayMonthsContainer)
  overlayContainer.append(overlaySubmitButton)

  inputContainer.className = 'dp-overlay-input-container'
  input.className = 'dp-overlay-input'
  input.placeholder = overlayPlaceholder
  overlayClose.className = 'dp-overlay-close'
  overlayClose.textContent = '✕'
  overlayMonthsContainer.className = 'dp-overlay-months-container'
  overlaySubmitButton.className = 'dp-overlay-submit'
  overlaySubmitButton.textContent = overlayButtonText
  // TODO - disable this upon year input
  overlaySubmitButton.disabled = true
  overlayContainer.className = getOverlayClassName({
    action: 'initialize',
    defaultView,
  })

  return {
    overlayContainer,
    inputContainer,
    input,
    overlayClose,
    overlayMonthsContainer,
    overlaySubmitButton,
  }
}

export type PickerElements = {
  calendarContainer: HTMLDivElement
  controls: ControlElementsReturnType
  weekdaysArray: HTMLDivElement[]
  weekdaysContainer: HTMLDivElement
  calendarDaysArray: HTMLDivElement[]
  daysContainer: HTMLDivElement
  overlay: OverlayReturnType
  showAllDatesData: [HTMLDivElement[], HTMLDivElement[]]
}

// TODO - can we get rid of this type and deduce things from the internal picker or the options?
type CreateCalendarInput = {
  date: Date
  customMonths: InternalPickerData['months']
  defaultView: ViewType
  overlayButtonText: SanitizedOptions['overlayButtonText']
  overlayPlaceholder: SanitizedOptions['overlayPlaceholder']
  selectorEl: SelectorData['el']
  alwaysShow: InternalPickerData['alwaysShow']
}
/**
 * This function creates the calendar HTML but doesn't add all the necessary
 * classes for calendar days (i.e. selected date, disabled dates, etc.).
 * Calendar days are fully processed in `renderCalendar`.
 */
export function createCalendarHTML(
  selectorEl: SelectorData['el'],
  options: SanitizedOptions
): PickerElements {
  const {
    startDate: date,
    months: customMonths,
    overlayMonths,
    customDays,
    defaultView,
    overlayButtonText,
    overlayPlaceholder,
    startDay,
    showAllDates,
    disableYearOverlay,
  } = options
  const alwaysShow = !!options?.alwaysShow
  const isInput = getIsInput(selectorEl)
  const calendarContainer = document.createElement('div')
  // TODO - turn all these internal function arguments from objects to multiple arguments.
  // Argument names can be minimized, object properties can't.
  const controls = createCalendarControlElements({
    date,
    customMonths,
    disableYearOverlay,
  })
  const weekdaysArray = createWeekdayElements({weekDays: customDays, startDay})
  const weekdaysContainer = document.createElement('div')
  const calendarDaysArray = createCalendarDayElements()
  const showAllDatesData = createShowAllDatesData()
  const daysContainer = document.createElement('div')
  const overlay = createCalendarOverlay(
    overlayMonths,
    defaultView,
    overlayButtonText,
    overlayPlaceholder
  )

  // TODO - use Tailwind. Keep current class names and use TW config to map class names to TW classes.
  calendarContainer.className = 'dp-calendar-container'
  weekdaysContainer.className = 'dp-weekdays-container'
  daysContainer.className = 'dp-days-container'

  calendarContainer.append(controls.controlsContainer)
  calendarContainer.append(weekdaysContainer)
  weekdaysContainer.append(...weekdaysArray)
  calendarContainer.append(daysContainer)
  daysContainer.append(...calendarDaysArray)
  calendarContainer.append(overlay.overlayContainer)

  if (showAllDates) {
    // Befores.
    daysContainer.prepend(...showAllDatesData[0])

    // Afters.
    daysContainer.append(...showAllDatesData[1])
  }

  /**
   * Pickers associated with an input will be hidden by default.
   * Pickers not associated with an input will be shown by default.
   */

  if (isInput && !alwaysShow) {
    calendarContainer.classList.add('dp-dn')
  }

  if (defaultView === 'overlay') {
    calendarContainer.classList.add('dp-blur')
  }

  return {
    calendarContainer,
    controls,
    weekdaysArray,
    weekdaysContainer,
    calendarDaysArray,
    daysContainer,
    overlay,
    showAllDatesData,
  }
}

/**
 * Creates 2 arrays of additional DOM nodes for showing days from the prior and
 * next months in the leading and trailing spaces.
 */
export function createShowAllDatesData(): PickerElements['showAllDatesData'] {
  const befores: HTMLDivElement[] = []
  const afters: HTMLDivElement[] = []

  // At most we will display 6 days before / after the month.
  for (let i = 0; i < 6; i++) {
    const beforeDiv = document.createElement('div')
    const afterDiv = document.createElement('div')

    // These div's will always be dimmed liked a disabled date.
    beforeDiv.className = afterDiv.className = 'dp-day dp-other-month-day'

    // The dates for the days after the current month will never change.
    afterDiv.textContent = `${i + 1}`

    befores.push(beforeDiv)
    afters.push(afterDiv)
  }

  return [befores, afters]
}

// TODO - turn as many functions into arrow functions - smaller build.
// Build will strip return from a body with a single return statement.

// TODO - make calendar elements tabable for accessibility.
// TODO - include aria attributes on calendar elements for accessibility.
// TODO - make all internal function arguments positional vs single obj? Might reduce build size.
