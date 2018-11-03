const datepicker = require('../datepicker.min')

describe('Year Overlay', () => {
  let picker = undefined

  beforeEach(() => {
    document.body.innerHTML = '<input type="text" id="input1" />'
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
    const input = document.querySelector('input')
    input.dispatchEvent(new Event('focusin', { bubbles: true }))

    const yearInput = document.querySelector('.qs-overlay-year')

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

  it('should submit when pressing enter or clicking the submit button ', () => {})

  it('should only enable submission when there are 4 digits entered in the input field', () => {})
})
