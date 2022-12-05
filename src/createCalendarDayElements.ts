import getDaysInMonth from './getDaysInMonth'

/**
 * Creates an array of divs representing the days in a given month.
 */
export default function createCalendarDayElements(
  date: Date
): HTMLDivElement[] {
  const elements: HTMLDivElement[] = []
  const daysInMonth = getDaysInMonth(date)

  /**
   * We use 31 since it's the maximum number of days in a month. Any number that
   * exceeds the maximum days in the current month will be hidden.
   */
  for (let i = 1; i <= 31; i++) {
    const el = document.createElement('div')
    el.textContent = `${i}`

    if (i > daysInMonth) {
      /**
       * Add inline position styles - https://mzl.la/3gYmnYj
       * I've seen that `element.style.position = '...'` isn't reliable.
       */
      el.style.setProperty('display', 'none')
    }

    elements.push(el)
  }

  return elements
}
