import {days, months} from './constants'
import getDaysInMonth from './getDaysInMonth'
import {DatepickerOptions} from './types'

type ControlElementsReturnType = {
  controlsContainer: HTMLDivElement
  leftArrow: HTMLDivElement
  rightArrow: HTMLDivElement
  monthYearContainer: HTMLDivElement
  monthName: HTMLDivElement
  year: HTMLDivElement
}

/** */
export function createCalendarControlElements({
  date,
  customMonths,
}: CreateControlElementsInputType): ControlElementsReturnType {
  const controlsContainer = document.createElement('div')
  const leftArrow = document.createElement('div')
  const rightArrow = document.createElement('div')
  const monthYearContainer = document.createElement('div')
  const monthName = document.createElement('div')
  const year = document.createElement('div')

  // Month
  const currentMonths = customMonths ?? months
  const monthText = currentMonths[date.getMonth()]
  monthName.textContent = monthText

  // Year
  const fullYear = date.getFullYear()
  year.textContent = `${fullYear}`

  // Assign class names.
  controlsContainer.className = 'dp-controls-container'
  leftArrow.className = 'dp-left-arrow'
  rightArrow.className = 'dp-right-arrow'
  monthYearContainer.className = 'dp-month-year-container'
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
export function createWeekdayElements(
  customDays: DatepickerOptions['customDays']
): HTMLDivElement[] {
  const weekdays = customDays ?? days
  const weekdayElements: HTMLDivElement[] = []

  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div')
    el.className = 'dp-weekday'

    // Weekday names are limited to 3 characters.
    el.textContent = weekdays[i].slice(0, 3)

    weekdayElements.push(el)
  }

  return weekdayElements
}

/**
 * Creates an array of divs representing the days in a given month. These
 * elements will created once and are intended to be reused for each month.
 */
export function createCalendarDayElements(date: Date): HTMLDivElement[] {
  const elements: HTMLDivElement[] = []
  const daysInMonth = getDaysInMonth(date)

  /**
   * We use 31 since it's the maximum number of days in a month. Any number that
   * exceeds the maximum days in the current month will be hidden.
   */
  for (let i = 1; i <= 31; i++) {
    const el = document.createElement('div')
    el.className = 'dp-day'
    el.textContent = `${i}`

    if (i > daysInMonth) {
      // Days that aren't in the month should still be created but not shown.
      el.classList.add('dp-dn')
    }

    elements.push(el)
  }

  return elements
}

type CreateControlElementsInputType = {
  date: Date
  customMonths: DatepickerOptions['customMonths']
}

type OverlayReturnType = {
  overlayContainer: HTMLDivElement
  inputContainer: HTMLDivElement
  input: HTMLDivElement
  overlayClose: HTMLDivElement
  overlayMonthsContainer: HTMLDivElement
}

export function createCalendarOverlay(
  customMonths: DatepickerOptions['customMonths']
): OverlayReturnType {
  const overlayContainer = document.createElement('div')
  const inputContainer = document.createElement('div')
  const input = document.createElement('input')
  const overlayClose = document.createElement('div')
  const overlayMonthsContainer = document.createElement('div')
  const currentMonths = customMonths ?? months

  for (let i = 0; i < 12; i++) {
    const overlayMonth = document.createElement('div')
    overlayMonth.className = 'dp-overlay'
    overlayMonthsContainer.append(overlayMonth)

    // Overlay month names are limited to 3 characters.
    overlayMonth.textContent = currentMonths[i].slice(0, 3)
  }

  // Append all the elements to their containers.
  inputContainer.append(input)
  inputContainer.append(overlayClose)
  overlayContainer.append(inputContainer)
  overlayContainer.append(overlayMonthsContainer)

  overlayContainer.className = 'dp-overlay-container dp-hidden'

  return {
    overlayContainer,
    inputContainer,
    input,
    overlayClose,
    overlayMonthsContainer,
  }
}

type CreateCalendarInput = {
  date: Date
  customMonths: DatepickerOptions['customMonths']
  customDays: DatepickerOptions['customDays']
}

export type PickerElements = {
  calendarContainer: HTMLDivElement
  controls: ControlElementsReturnType
  weekdaysArray: HTMLDivElement[]
  weekdaysContainer: HTMLDivElement
  calendarDaysArray: HTMLDivElement[]
  daysContainer: HTMLDivElement
  overlay: OverlayReturnType
}

export function createCalendarHTML({
  date,
  customMonths,
  customDays,
}: CreateCalendarInput): PickerElements {
  const calendarContainer = document.createElement('div')
  const controls = createCalendarControlElements({date, customMonths})
  const weekdaysArray = createWeekdayElements(customDays)
  const weekdaysContainer = document.createElement('div')
  const calendarDaysArray = createCalendarDayElements(date)
  const daysContainer = document.createElement('div')
  const overlay = createCalendarOverlay(customMonths)

  calendarContainer.className = 'dp-calendar-container'
  weekdaysContainer.className = 'dp-weekdays-container'
  daysContainer.className = 'dp-days-container'

  calendarContainer.append(controls.controlsContainer)
  calendarContainer.append(weekdaysContainer)
  calendarContainer.append(daysContainer)
  weekdaysArray.forEach(el => weekdaysContainer.append(el))
  calendarDaysArray.forEach(el => daysContainer.append(el))

  return {
    calendarContainer,
    controls,
    weekdaysArray,
    weekdaysContainer,
    calendarDaysArray,
    daysContainer,
    overlay,
  }
}
