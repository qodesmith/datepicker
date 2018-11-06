const datepicker = require('../src/datepicker')

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

  it('should return an object with the correct methods & properties', () => {
    // Add a div so we can test a 2nd datepicker's properties
    document.body.innerHTML = `
      <input type="text" />
      <div style="position: absolute">
        <span></span>
      </div>
    `
    picker = datepicker('input')
    const picker2 = datepicker('span')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const date = new Date()
    const currentMonth = date.getMonth()
    const currentMonthName = months[currentMonth]
    const currentYear = date.getFullYear()
    const strippedTime = new Date(currentYear, currentMonth, date.getDate())

    // Methods.
    const allMethods1 = ['remove', 'setDate', 'setMin', 'setMax'].every(method => {
      return typeof picker[method] === 'function'
    })
    const allMethods2 = ['remove', 'setDate', 'setMin', 'setMax'].every(method => {
      return typeof picker2[method] === 'function'
    })
    expect(allMethods1).toBe(true)
    expect(allMethods2).toBe(true)

    // Properties - as listed in README "Properties & Values" section.
    expect(picker.calendar).toBe(document.querySelectorAll('.qs-datepicker')[1])
    expect(picker2.calendar).toBe(document.querySelectorAll('.qs-datepicker')[0])
    expect(picker.currentMonth).toBe(currentMonth)
    expect(picker.currentMonthName).toBe(currentMonthName)
    expect(picker.currentYear).toBe(currentYear)
    expect(picker.dateSelected).toBe(undefined)
    expect(picker.hasOwnProperty('dateSelected')).toBe(true)
    expect(picker.el).toBe(document.querySelector('input'))
    expect(picker.minDate).toBe(undefined)
    expect(picker.hasOwnProperty('minDate')).toBe(true)
    expect(picker.maxDate).toBe(undefined)
    expect(picker.hasOwnProperty('maxDate')).toBe(true)

    // Remaining properties.
    expect(picker.alwaysShow).toBe(false)
    expect(picker.days).toEqual(days)
    expect(picker.disableMobile).toBe(undefined)
    expect(picker.hasOwnProperty('disableMobile')).toBe(true)
    expect(picker.disableYearOverlay).toBe(undefined)
    expect(picker.hasOwnProperty('disableYearOverlay')).toBe(true)
    expect(picker.disabledDates).toEqual([])
    expect(picker.disabler).toBe(false)
    expect(picker.formatter).toBe(false)
    expect(picker.id).toBe(undefined)
    expect(picker.hasOwnProperty('id')).toBe(true)
    expect(picker.isMobile).toBe(false)
    expect(picker.months).toEqual(months)
    expect(picker.noPosition).toBe(false)
    expect(picker.noWeekends).toBe(false)
    expect(picker.nonInput).toBe(false)
    expect(picker.onHide).toBe(false)
    expect(picker.onMonthChange).toBe(false)
    expect(picker.onSelect).toBe(false)
    expect(picker.onShow).toBe(false)
    expect(picker.overlayButton).toBe('Submit')
    expect(picker.overlayPlaceholder).toBe('4-digit year')
    expect(picker.parent).toBe(document.querySelector('input').parentElement)
    expect(picker.position).toEqual({ bottom: 1, left: 1 })
    expect(+picker.startDate).toBe(+strippedTime)
    expect(picker.startDay).toBe(0)
    expect(picker.weekendIndices).toEqual([6, 0])

    // `inlinePosition` property.
    expect(picker.inlinePosition).toBe(true)
    expect(picker.hasOwnProperty('inlinePosition')).toBe(true)
    expect(picker2.inlinePosition).toBe(undefined)
    expect(picker2.hasOwnProperty('inlinePosition')).toBe(false)

    // Cleanup for this test.
    picker2.remove()
  })

  it('should show / hide the calendar when "attached" to an <input> element', () => {
    picker = datepicker('input')
    const dp = document.querySelector('.qs-datepicker')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })

  it('should show / hide the calendar when "attached" to a non-input element', () => {
    picker = datepicker(document.body)
    const dp = document.querySelector('.qs-datepicker')

    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
    expect(dp.className).toBe('qs-datepicker qs-hidden')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker')

    document.body.click()
    expect(dp.className).toBe('qs-datepicker qs-hidden')
  })
})
