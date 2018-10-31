const datepicker = require('../datepicker')

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

    document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })

  it('should hide the calendar when selecting a date on the calendar', () => {
    const dp = document.querySelector('.qs-datepicker')
    const dayOne = document.querySelector('.qs-square.qs-num:not(.qs-empty)')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
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

    document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    dayOne.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(dayOne.classList.contains('qs-square')).toBe(true)
    expect(dayOne.classList.contains('qs-num')).toBe(true)
    expect(dayOne.classList.contains('qs-active')).toBe(true)
  })

  // it('should change the month when the arrows are clicked', () => {})

  // it('should do nothing when the weekday names are clicked', () => {})

  // it('should show todays date in bold', () => {})

  // it('should have no disabled dates', () => {})
})
