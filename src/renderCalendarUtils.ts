import getDaysInMonth from './getDaysInMonth'
import {DatepickersMapItem} from './types'

export function renderCalendar(picker: DatepickersMapItem): void {
  const currentYear = picker.currentDate.getFullYear()
  const currentMonthNum = picker.currentDate.getMonth()
  const currentMonth = picker.months[currentMonthNum]
  const daysInMonth = getDaysInMonth(picker.currentDate)

  /**
   * Iterate through the calendar days and hide any days that are beyond the
   * number of days in the current month.
   */
  picker.pickerElements.calendarDaysArray.forEach((el, i) => {
    const num = i + 1

    if (num <= daysInMonth) {
      el.classList.remove('dp-dn')
    } else {
      el.classList.add('dp-dn')
    }
  })

  // Adjust the month and year in the calendar controls.
  picker.pickerElements.controls.monthName.textContent = currentMonth
  picker.pickerElements.controls.year.textContent = `${currentYear}`
}
