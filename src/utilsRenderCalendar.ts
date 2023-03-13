import {
  getDaysInMonth,
  getIndexOfLastDayOfMonth,
  isDateWithinRange,
  isWeekendDate,
  stripTime,
} from './utils'
import {InternalPickerData} from './types'

/**
 * TODO - make function accept undefined and move conditional logic here.
 *
 * Updates classes to all the calendar DOM elements according to the current
 * calendar data (i.e. selected date, min/max dates, current month, etc.).
 */
export function renderCalendar(
  internalPicker: InternalPickerData | undefined
): void {
  if (!internalPicker) return

  const {
    currentDate,
    sibling,
    selectedDate,
    minDate,
    maxDate,
    disabledDates,
    noWeekends,
    startDay, // Defaults to 0 => Sunday
    events,
    showAllDates,
  } = internalPicker
  const currentYear = currentDate.getFullYear()
  const currentMonthNum = currentDate.getMonth()
  const currentMonthName = internalPicker.months[currentMonthNum]
  const daysInMonth = getDaysInMonth(currentDate)
  const selectedDateNum = selectedDate ? +stripTime(selectedDate) : null
  const today = stripTime(new Date())
  const {start: rangeStart, end: rangeEnd} = internalPicker._getRange()
  const lastMonthsLastDayIndex = getIndexOfLastDayOfMonth(
    new Date(currentYear, currentMonthNum - 1),
    startDay
  )
  /**
   * Why 0 if `showAllDates` is true?
   * Because we don't want `grid-column-start` in CSS to do any of the work in
   * adjusting the 1st of the month. Instead, we will be inserting the correct
   * amount of DOM nodes before and after the month.
   *
   * Why the 2 +1's?
   * - lastMonthsLastDayIndex + 1
   *   - because last month's last day is 1 day behind the 1st of this month.
   * - (... %7) + 1
   *   - because we're going from 0-based indices to a 1-based starting number.
   *   - We need a number from 1 - 7, not 0 - 6.
   *
   * Why the `% 7`?
   * We're dealing with a round-robin set of 7 which are the values 0 - 6. If we
   * get a value > 6, we want to round-robin it back to the beginning.
   */
  const gridColumnStart = showAllDates
    ? 0
    : ((lastMonthsLastDayIndex + 1) % 7) + 1

  /**
   * This class prevents a ghost background fade effect from happening because
   * we have transition on the background and the DOM elements are reused.
   * To disable that transition when switching months, we add this class to
   * switch off the CSS transition styles.
   */
  internalPicker.pickerElements.daysContainer.classList.add(
    'dp-disable-transition'
  )

  /**
   * Iterate through the calendar days and hide any days that are beyond the
   * number of days in the current month.
   */
  internalPicker.pickerElements.calendarDaysArray.forEach((day, i) => {
    const num = i + 1
    const dateForComparison = new Date(currentYear, currentMonthNum, num)
    const dateNumForComparison = +dateForComparison
    const isEvent = events.has(dateNumForComparison)
    const isWeekend = isWeekendDate(dateForComparison)
    const dateInRange = isDateWithinRange({
      date: dateForComparison,
      minDate,
      maxDate,
    })
    const isRangeSelected = Boolean(selectedDate && sibling?.selectedDate)
    const isSelectedDate =
      selectedDateNum === dateNumForComparison && dateInRange
    const isRangeDatesEqual = Boolean(
      rangeStart && rangeEnd && +rangeStart === +rangeEnd
    )
    const isRangeDate =
      rangeStart &&
      rangeEnd &&
      isDateWithinRange({
        date: dateForComparison,
        minDate: new Date(
          rangeStart.getFullYear(),
          rangeStart.getMonth(),
          rangeStart.getDate() + 1
        ),
        maxDate: new Date(
          rangeEnd.getFullYear(),
          rangeEnd.getMonth(),
          rangeEnd.getDate() - 1
        ),
      })

    // Adjust the starting offest of the calendar.
    if (i === 0) {
      day.style.setProperty('grid-column-start', `${gridColumnStart || ''}`)
    }

    // Today.
    addOrRemoveClass(day, 'dp-today', +today === dateNumForComparison)

    // Display / display none.
    addOrRemoveClass(day, 'dp-dn', !(num <= daysInMonth))

    // Selected date.
    addOrRemoveClass(day, 'dp-selected-date', isSelectedDate)

    // Event.
    addOrRemoveClass(day, 'dp-event', isEvent)

    // Range start.
    addOrRemoveClass(
      day,
      'dp-range-start',
      isRangeSelected &&
        rangeStart &&
        +rangeStart === dateNumForComparison &&
        !isRangeDatesEqual
    )

    // Range end.
    addOrRemoveClass(
      day,
      'dp-range-end',
      isRangeSelected &&
        rangeEnd &&
        +rangeEnd === dateNumForComparison &&
        !isRangeDatesEqual
    )

    // Daterange dates.
    addOrRemoveClass(day, 'dp-range-date', isRangeDate)

    // Disabled dates.
    addOrRemoveClass(
      day,
      'dp-disabled-date',
      !dateInRange ||
        disabledDates.has(dateNumForComparison) ||
        (noWeekends && isWeekend)
    )
  })

  renderShowAllDatesDays(internalPicker, lastMonthsLastDayIndex)

  // Adjust the month name and year in the calendar controls.
  internalPicker.pickerElements.controls.monthName.textContent =
    currentMonthName
  internalPicker.pickerElements.controls.year.textContent = `${currentYear}`

  /**
   * Removing the class inside requestAnimationFrame gives the DOM time to paint
   * first (1 tick) and then it is safe to remove the class. Otherwise, the
   * addition of this class won't take effect because there was no time between
   * adding and removing. Also, using setTimeout requires an arbitrary time and
   * requestAnimationFrame is guaranteed to execute on the next paint cycle.
   */
  requestAnimationFrame(() => {
    internalPicker.pickerElements.daysContainer.classList.remove(
      // TODO - extract strings used more than once into variables to lower byte size.
      'dp-disable-transition'
    )
  })
}

/**
 * Utility to add or remove a class name from an element.
 *
 * The last argument `shouldAdd` controls wether the class is:
 * * added (`true`)
 * * removed (`false`)
 */
function addOrRemoveClass<T extends HTMLElement>(
  el: T,
  className: string,
  shouldAdd: boolean | undefined
): void {
  el.classList[shouldAdd ? 'add' : 'remove'](className)
}

const renderShowAllDatesDays = (
  internalPicker: InternalPickerData,
  lastMonthsLastDayIndex: number
) => {
  const {
    pickerElements,
    currentDate,
    events,
    startDay,
    showAllDates,
    showAllDatesClickable,
  } = internalPicker
  const {showAllDatesData} = pickerElements
  if (!showAllDates) return

  const [befores, afters] = showAllDatesData
  const daysInPriorMonth = getDaysInMonth(currentDate, -1)
  const currentYear = currentDate.getFullYear()
  const currentMonthNum = currentDate.getMonth()
  const todayDateNum = +stripTime(new Date())
  const updateClasses = (
    div: HTMLDivElement,
    isEvent: boolean,
    isToday: boolean
  ) => {
    addOrRemoveClass(div, 'dp-dn', false)
    addOrRemoveClass(div, 'dp-event', isEvent)
    addOrRemoveClass(div, 'dp-today', isToday)
    addOrRemoveClass(div, 'dp-disabled-date', !showAllDatesClickable)
  }

  befores
    .slice() // Leave the original array in tact.
    .reverse() // It's easier to reason about the before days in reverse.
    .forEach((div, i) => {
      div.textContent = `${daysInPriorMonth - i}`

      // If the index is 6, that means we don't show any prior-month days.
      if (i > lastMonthsLastDayIndex || lastMonthsLastDayIndex === 6) {
        return addOrRemoveClass(div, 'dp-dn', true)
      }

      const currentDayNum = daysInPriorMonth - 6 + i + 1
      const dateForComparison = new Date(
        currentYear,
        currentMonthNum - 1,
        currentDayNum
      )
      const dateNumForComparison = +dateForComparison

      updateClasses(
        div,
        events.has(dateNumForComparison),
        todayDateNum === dateNumForComparison
      )
    })

  const daysToAdd = 6 - getIndexOfLastDayOfMonth(currentDate, startDay)

  afters.slice().forEach((div, i) => {
    if (i >= daysToAdd) {
      return addOrRemoveClass(div, 'dp-dn', true)
    }

    const dateForComparison = new Date(currentYear, currentMonthNum + 1, i + 1)
    const dateNumForComparison = +dateForComparison

    updateClasses(
      div,
      events.has(dateNumForComparison),
      todayDateNum === dateNumForComparison
    )
  })
}
