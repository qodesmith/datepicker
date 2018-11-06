const datepicker = require('../src/datepicker')

describe('Year Overlay', () => {
  let picker = undefined
  let input = undefined

  beforeEach(() => {
    document.body.innerHTML = '<input type="text" id="input1" />'
    input = document.querySelector('input')
    picker = datepicker('#input1')
  })

  afterEach(() => picker.remove())

  it('should show the year overlay when the month / year is clicked', () => {
    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    const monthYear = document.querySelector('.qs-month-year')
    const overlay = document.querySelector('.qs-overlay')

    expect(overlay.classList.contains('qs-hidden')).toBe(true)
    monthYear.click()
    expect(overlay.classList.contains('qs-hidden')).toBe(false)
  })

  it('should only allow numbers to be typed (max of 4 digits) into the input field', () => {
    input.dispatchEvent(new Event('focusin', { bubbles: true }))
    const yearInput = document.querySelector('.qs-overlay-year')
    const monthYear = document.querySelector('.qs-month-year')
    monthYear.click()

    yearInput.value = 'Qodesmith'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(yearInput.value).toBe('')

    yearInput.value = '123456'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(yearInput.value).toBe('1234')

    yearInput.value = '12'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(yearInput.value).toBe('12')
  })

  it('should not allow 0 to be the first digit, limiting the lowest year to 1000', () => {
    input.dispatchEvent(new Event('focusin', { bubbles: true }))
    const yearInput = document.querySelector('.qs-overlay-year')
    const monthYear = document.querySelector('.qs-month-year')
    monthYear.click()

    yearInput.value = '0123'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(yearInput.value).toBe('123')

    yearInput.value = '0000000000000'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(yearInput.value).toBe('')

    yearInput.value = '0000000000001001'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(yearInput.value).toBe('1001')
  })

  it('should only enable submission when there are 4 digits entered in the input field', () => {
    input.dispatchEvent(new Event('focusin', { bubbles: true }))
    const yearInput = document.querySelector('.qs-overlay-year')
    const submit = document.querySelector('.qs-submit')
    const monthYear = document.querySelector('.qs-month-year')
    monthYear.click()

    expect(submit.className.includes('qs-disabled')).toBe(true)

    yearInput.value = '2'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(submit.className.includes('qs-disabled')).toBe(true)

    yearInput.value = '20'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(submit.className.includes('qs-disabled')).toBe(true)

    yearInput.value = '201'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(submit.className.includes('qs-disabled')).toBe(true)

    yearInput.value = '2019'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))
    expect(submit.className.includes('qs-disabled')).toBe(false)
  })

  it('should submit when pressing enter or clicking the submit button', done => {
    input.dispatchEvent(new Event('focusin', { bubbles: true }))
    const monthYear = document.querySelector('.qs-month-year')

    monthYear.click()
    const isHidden = document.querySelector('.qs-overlay').classList.contains('qs-hidden')
    expect(isHidden).toBe(false)

    const yearInput = document.querySelector('.qs-overlay-year')
    const submit = document.querySelector('.qs-submit')

    yearInput.value = '2099'
    yearInput.dispatchEvent(new Event('input', { bubbles: true }))

    expect(submit.classList.contains('qs-disabled')).toBe(false)
    expect(document.querySelector('.qs-year').textContent).not.toBe('2099')

    // https://goo.gl/oyP2WC
    yearInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }))

    // There is a setTimeout in `renderCalendar` that waits to hide the calendar.
    setTimeout(() => {
      const isHidden = document.querySelector('.qs-overlay').classList.contains('qs-hidden')
      expect(isHidden).toBe(true)
      expect(document.querySelector('.qs-year').textContent).toBe('2099')
      done()
    }, 100)
  })
})
