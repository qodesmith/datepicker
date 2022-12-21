import {getOffsetNumber, getOverlayClassName, getDaysInMonth} from './utils'
import {DatepickerOptions, InternalPickerData, ViewType} from './types'

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
}
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
  const monthText = customMonths[date.getMonth()]
  monthName.textContent = monthText

  // Year
  const fullYear = date.getFullYear()
  year.textContent = `${fullYear}`

  // Arrows
  leftArrow.innerHTML = createArrowSVG()
  rightArrow.innerHTML = createArrowSVG()

  // Assign class names.
  controlsContainer.className = 'dp-controls-container'
  leftArrow.className = 'dp-arrow dp-arrow-left'
  rightArrow.className = 'dp-arrow dp-arrow-right'
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

function createArrowSVG(): string {
  return `
    <svg viewBox="0 0 24 24">
      <path d="M15 17.898C15 18.972 13.7351 19.546 12.9268 18.8388L6.61617 13.3169C5.81935 12.6197 5.81935 11.3801 6.61617 10.6829L12.9268 5.16108C13.7351 4.45388 15 5.02785 15 6.1018L15 17.898Z" fill="#212121"/>
    </svg>
  `
}

/**
 * Creates an array of divs representing the 7 days of the week. If the
 * `customDays` option was used, the 1st 3 characters will be used for each day.
 * These elements are created once and are intended to be reused for each month
 */
export function createWeekdayElements(
  weekDays: CreateCalendarInput['customDays']
): HTMLDivElement[] {
  const weekdayElements: HTMLDivElement[] = []

  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div')
    el.className = 'dp-weekday'

    // Weekday names are limited to 3 characters.
    el.textContent = weekDays[i].slice(0, 3)

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
  const todaysDate = date.getDate()
  const offset = getOffsetNumber(date)

  /**
   * We use 31 since it's the maximum number of days in a month. Any number that
   * exceeds the maximum days in the current month will be hidden.
   */
  for (let i = 1; i <= 31; i++) {
    const day = document.createElement('div')
    day.className = 'dp-day'
    day.textContent = `${i}`

    // Adjsut the starting offest of the calendar.
    if (i === 1) {
      day.style.setProperty('grid-column-start', `${offset}`)
    }

    // This will be used by event handlers to know which date was clicked.
    day.dataset.num = `${i}`

    if (i > daysInMonth) {
      // Days that aren't in the month should still be created but not shown.
      day.classList.add('dp-dn')
    }

    if (i === todaysDate) {
      day.classList.add('dp-today')
    }

    elements.push(day)
  }

  return elements
}

type OverlayReturnType = {
  overlayContainer: HTMLDivElement
  inputContainer: HTMLDivElement
  input: HTMLInputElement
  overlayClose: HTMLDivElement
  overlayMonthsContainer: HTMLDivElement
  overlaySubmitButton: HTMLButtonElement
}

export function createCalendarOverlay(
  customMonths: CreateCalendarInput['customMonths'],
  defaultView: ViewType,
  overlayButtonText: CreateCalendarInput['overlayButtonText'],
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
    overlayMonth.textContent = customMonths[i].slice(0, 3)
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
}

type CreateCalendarInput = {
  date: Date
  customMonths: InternalPickerData['months']
  customDays: NonNullable<DatepickerOptions['customDays']>
  defaultView: ViewType
  overlayButtonText: InternalPickerData['overlayButtonText']
  overlayPlaceholder: InternalPickerData['overlayPlaceholder']
}
export function createCalendarHTML({
  date,
  customMonths,
  customDays,
  defaultView,
  overlayButtonText,
  overlayPlaceholder,
}: CreateCalendarInput): PickerElements {
  const calendarContainer = document.createElement('div')
  const controls = createCalendarControlElements({date, customMonths})
  const weekdaysArray = createWeekdayElements(customDays)
  const weekdaysContainer = document.createElement('div')
  const calendarDaysArray = createCalendarDayElements(date)
  const daysContainer = document.createElement('div')
  const overlay = createCalendarOverlay(
    customMonths,
    defaultView,
    overlayButtonText,
    overlayPlaceholder
  )

  calendarContainer.className = 'dp-calendar-container'
  weekdaysContainer.className = 'dp-weekdays-container'
  daysContainer.className = 'dp-days-container'

  calendarContainer.append(controls.controlsContainer)
  calendarContainer.append(weekdaysContainer)
  calendarContainer.append(daysContainer)
  calendarContainer.append(overlay.overlayContainer)
  weekdaysArray.forEach(weekday => weekdaysContainer.append(weekday))
  calendarDaysArray.forEach(day => daysContainer.append(day))

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
