const datepicker = require('../datepicker')

describe('Initialization' ,() => {
  let picker = undefined

  beforeEach(() => document.body.innerHTML = '<input type="text" />')

  afterEach(() => picker.remove())

  it('should take in a string for the 1st argument as a selector', () => {
    picker = datepicker('input')
    const dp = document.querySelector('.qs-datepicker.qs-hidden')

    expect(!!dp).toBe(true)
  })

  it('should take in a DOM node for the 1st argument as a selector', () => {
    picker = datepicker(document.querySelector('input'))
    const dp = document.querySelector('.qs-datepicker.qs-hidden')

    expect(!!dp).toBe(true)
  })

  it('should show / hide the calendar when "attached" to an <input> element', () => {
    picker = datepicker('input')
    const dp = document.querySelector('.qs-datepicker')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })

  it('should show / hide the calendar when "attached" to a non-input element', () => {
    picker = datepicker(document.body)
    const dp = document.querySelector('.qs-datepicker')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })
})
