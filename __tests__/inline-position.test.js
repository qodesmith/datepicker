const datepicker = require('../src/datepicker')

describe('Setting Inline Position', () => {
  beforeEach(() => document.body.innerHTML = '<input type="text" />')

  it('should set inline styles if the parent has no declared positioning (inline or css)', () => {
    document.body.innerHTML = '<input type="text" />'
    const picker = datepicker('input')

    expect(getComputedStyle(picker.parent).position).toBe('relative')
    picker.remove()
  })

  // This test applies a picker to the body first.
  it('should remove inline styles set (1)', () => {
    document.body.innerHTML = '<input type="text" />'
    const pickerBody = datepicker('body')
    const pickerInput = datepicker('input')
    const { parent } = pickerInput

    expect(parent).toBe(pickerBody.parent)
    expect(getComputedStyle(parent).position).toBe('relative')

    pickerInput.remove()
    expect(getComputedStyle(parent).position).toBe('relative')

    pickerBody.remove()
    expect(getComputedStyle(parent).position).toBe('')
  })

  // This test applies a picker to the input first.
  it('should remove inline styles set (2)', () => {
    document.body.innerHTML = '<input type="text" />'
    const pickerInput = datepicker('input')
    const pickerBody = datepicker('body')
    const { parent } = pickerInput

    expect(parent).toBe(pickerBody.parent)
    expect(getComputedStyle(parent).position).toBe('relative')

    pickerBody.remove()
    expect(getComputedStyle(parent).position).toBe('relative')

    pickerInput.remove()
    expect(getComputedStyle(parent).position).toBe('')
  })

  it('should not set inline styles on parent if parent has inline positioning', () => {
    document.body.innerHTML = '<input type="text" />'
    document.body.style.setProperty('position', 'absolute')
    const picker = datepicker('input')
    const { position } = getComputedStyle(picker.parent)

    expect(position).toBe('absolute')
    picker.remove()

    // Cleanup body for next test.
    document.body.style.removeProperty('position')
  })

  it('should set inlinePosition to true when applying inline styles', () => {
    document.body.innerHTML = '<input type="text" />'
    const picker = datepicker('input')

    expect(picker.inlinePosition).toBe(true)
    picker.remove()
  })

  it('should remove inline styles after having applied them once picker.remove() is called', () => {
    document.body.innerHTML = '<input type="text" />'
    const picker = datepicker('input')
    const { parent } = picker
    const { position } = getComputedStyle(picker.parent)

    expect(getComputedStyle(parent).position).toBe('relative')
    picker.remove()
    expect(getComputedStyle(parent).position).toBe('')
  })

  it('should not set the inlinePosition property if no inline styles were applied', () => {
    document.body.innerHTML = '<input type="text" />'
    document.body.style.setProperty('position', 'absolute')
    const picker = datepicker('input')

    expect(picker.inlinePosition).toBe(undefined)
    picker.remove()

    // Cleanup body for next test.
    document.body.style.removeProperty('position')
  })
})
