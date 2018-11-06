const datepicker = require('../src/datepicker')

describe('General Usage' ,() => {
  let picker = undefined

  beforeEach(() => {
    document.body.innerHTML = '<input type="text" />'
    picker = datepicker('input')
  })

  afterEach(() => picker.remove())

  it('should show / hide the calendar when the input is focused / blurred', () => {
    const dp = document.querySelector('.qs-datepicker')

    const allPickers = document.querySelectorAll('.qs-datepicker')
    expect(allPickers.length).toBe(1)

    expect(!!dp).toBe(true)
    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })

  it('should hide the calendar when selecting a date on the calendar', () => {
    const dp = document.querySelector('.qs-datepicker')
    const dayOne = document.querySelector('.qs-square.qs-num:not(.qs-empty)')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    dayOne.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })

  it('should highlight the selected day on the calendar', () => {
    const dp = document.querySelector('.qs-datepicker')
    const dayOne = document.querySelector('.qs-square.qs-num:not(.qs-empty)')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    expect(dayOne.classList.contains('qs-square')).toBe(true)
    expect(dayOne.classList.contains('qs-num')).toBe(true)
    expect(dayOne.classList.contains('qs-active')).toBe(false)
    expect(dayOne.textContent).toBe('1')

    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    dayOne.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    expect(dayOne.classList.contains('qs-square')).toBe(true)
    expect(dayOne.classList.contains('qs-num')).toBe(true)
    expect(dayOne.classList.contains('qs-active')).toBe(true)
  })

  it('should change the month when the arrows are clicked', () => {
    const rightArrow = document.querySelector('.qs-arrow.qs-right')
    const month = document.querySelector('.qs-month')
    const startMonthText = month.textContent

    // Show the calendar.
    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))

    // Left arrow click.
    document.querySelector('.qs-arrow.qs-left').click()
    expect(document.querySelector('.qs-month').textContent).not.toBe(startMonthText)

    // Right arrow click.
    document.querySelector('.qs-arrow.qs-right').click()
    expect(document.querySelector('.qs-month').textContent).toBe(startMonthText)

    // Right arrow click.
    document.querySelector('.qs-arrow.qs-right').click()
    expect(document.querySelector('.qs-month').textContent).not.toBe(startMonthText)
  })

  it('should do nothing when the weekday names are clicked', () => {
    const days = document.querySelectorAll('.qs-day')
    expect(days.length).toBe(7)

    Array.from(days).forEach(day => {
      const className = day.className
      day.click()
      expect(day.className).toBe(className)
    })

    const selected = document.querySelectorAll('.qs-active')
    expect(selected.length).toBe(0)
  })

  it('should show todays date in bold', () => {
    const today = new Date().getDate().toString()
    const boldDay = document.querySelector('.qs-current')

    expect(boldDay.textContent).toBe(today)
  })

  it('should have no disabled dates', () => {
    const disabled = document.querySelectorAll('.qs-num.qs-disabled')
    expect(disabled.length).toBe(0)
  })
})
