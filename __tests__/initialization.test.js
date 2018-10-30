const datepicker = require('../datepicker')

describe('Initialization' ,() => {
  beforeEach(() => document.body.innerHTML = '<input type="text" id="input1" />')

  it('should take in a string for the 1st argument as a selector', () => {
    const picker = datepicker('#input1')
    const dp = document.querySelector('.qs-datepicker')

    expect(!!dp).toBe(true)
    picker.remove()
  })

  it('should take in a DOM node for the 1st argument as a selector', () => {
    const input = document.querySelector('#input1')
    const picker = datepicker(input)
    const dp = document.querySelector('.qs-datepicker')

    expect(!!dp).toBe(true)
    picker.remove()
  })

  it('should show / hide the calendar when "attached" to an <input> element', () => {})

  it('should show / hide the calendar when "attached" to a non-input element', () => {})
})
