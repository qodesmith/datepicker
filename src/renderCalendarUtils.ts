import {isDateWithinRange, stripTime} from './generalUtils'
import getDaysInMonth from './getDaysInMonth'
import {InternalPickerData} from './types'

export function renderCalendar(picker: InternalPickerData): void {
  const currentYear = picker.currentDate.getFullYear()
  const currentMonthNum = picker.currentDate.getMonth()
  const currentMonthName = picker.months[currentMonthNum]
  const daysInMonth = getDaysInMonth(picker.currentDate)
  const {selectedDate, minDate, maxDate, disabledDates} = picker
  const selectedDateNum = selectedDate ? +stripTime(selectedDate) : null

  /**
   * Iterate through the calendar days and hide any days that are beyond the
   * number of days in the current month.
   */
  picker.pickerElements.calendarDaysArray.forEach((el, i) => {
    const num = i + 1
    const dateForComparison = new Date(currentYear, currentMonthNum, num)
    const dateNumForComparison = +dateForComparison
    const dateInRange = isDateWithinRange({
      date: dateForComparison,
      minDate,
      maxDate,
    })

    // Apply / remove displayed date styles.
    if (num <= daysInMonth) {
      el.classList.remove('dp-dn')
    } else {
      el.classList.add('dp-dn')
    }

    // Apply / remove selected date styles.
    if (selectedDateNum === dateNumForComparison && dateInRange) {
      el.classList.add('dp-selected-date')
    } else {
      el.classList.remove('dp-selected-date')
    }

    // Apple / remove disabled date styles.
    if (!dateInRange || disabledDates.has(dateNumForComparison)) {
      el.classList.add('dp-disabled-date')
    } else {
      el.classList.remove('dp-disabled-date')
    }
  })

  // Adjust the month name and year in the calendar controls.
  picker.pickerElements.controls.monthName.textContent = currentMonthName
  picker.pickerElements.controls.year.textContent = `${currentYear}`
}
