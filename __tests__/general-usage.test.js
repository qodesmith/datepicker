const datepicker = require('../datepicker')

describe('General Usage' ,() => {
  let picker = undefined

  beforeEach(() => {
    document.body.innerHTML = '<input type="text" id="input1" />'
    picker = datepicker('#input1')
  })

  afterEach(picker.remove)

  it.only('should show / hide the calendar when the input is focused / blurred', () => {
    const dp = document.querySelector('.qs-datepicker')

    const allPickers = document.querySelectorAll('.qs-datepicker')
    expect(allPickers.length).toBe(1)

    expect(!!dp).toBe(true)
    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('#input1').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })

  it('should close when selecting a date on the calendar', () => {
    const dp = document.querySelector('.qs-datepicker')


  })

  it('should highlight the selected day on the calendar', () => {})

  it('should change the month when the arrows are clicked', () => {})

  it('should do nothing when the weekday names are clicked', () => {})

  it('should show todays date in bold', () => {})

  it('should have no disabled dates', () => {})
})
