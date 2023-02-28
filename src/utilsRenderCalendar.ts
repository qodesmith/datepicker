import {isDateWithinRange, isWeekendDate, stripTime} from './utils'
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
    startDay,
    events,
  } = internalPicker
  const currentYear = currentDate.getFullYear()
  const currentMonthNum = currentDate.getMonth()
  const currentMonthName = internalPicker.months[currentMonthNum]
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()
  const selectedDateNum = selectedDate ? +stripTime(selectedDate) : null
  const today = stripTime(new Date())
  const {start: rangeStart, end: rangeEnd} = internalPicker._getRange()

  // Which day of the week the 1st of the month falls on - 0-indexed (0 - 6).
  const indexOfFirstOfMonth = new Date(currentYear, currentMonthNum, 1).getDay()

  /**
   * START DAY, SUNDAY INDEX
   *         0, 0
   *         1, 6
   *         2, 5
   *         3, 4
   *         4, 3
   *         5, 2
   *         6, 1
   *
   * startDay is 0-indexed
   * Formula: (7 - start index) % 7
   */
  const indexOfSunday = (7 - startDay) % 7

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
      const columnStart = ((indexOfFirstOfMonth + indexOfSunday) % 7) + 1
      day.style.setProperty('grid-column-start', `${columnStart}`)
    }

    // Today.
    if (+today === dateNumForComparison) {
      day.classList.add('dp-today')
    } else {
      day.classList.remove('dp-today')
    }

    // Display / display none.
    if (num <= daysInMonth) {
      day.classList.remove('dp-dn')
    } else {
      day.classList.add('dp-dn')
    }

    // Selected date.
    if (isSelectedDate) {
      day.classList.add('dp-selected-date')
    } else {
      day.classList.remove('dp-selected-date')
    }

    // Event.
    if (isEvent) {
      day.classList.add('dp-event')
    } else {
      day.classList.remove('dp-event')
    }

    // Range start.
    if (
      isRangeSelected &&
      rangeStart &&
      +rangeStart === dateNumForComparison &&
      !isRangeDatesEqual
    ) {
      day.classList.add('dp-range-start')
    } else {
      day.classList.remove('dp-range-start')
    }

    // Range end.
    if (
      isRangeSelected &&
      rangeEnd &&
      +rangeEnd === dateNumForComparison &&
      !isRangeDatesEqual
    ) {
      day.classList.add('dp-range-end')
    } else {
      day.classList.remove('dp-range-end')
    }

    // Daterange dates.
    if (isRangeDate) {
      day.classList.add('dp-range-date')
    } else {
      day.classList.remove('dp-range-date')
    }

    // Disabled dates.
    if (
      !dateInRange ||
      disabledDates.has(dateNumForComparison) ||
      (noWeekends && isWeekend)
    ) {
      day.classList.add('dp-disabled-date')
    } else {
      day.classList.remove('dp-disabled-date')
    }
  })

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
