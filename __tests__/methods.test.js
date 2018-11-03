const datepicker = require('../datepicker.min')

describe('Instance Methods', () => {
  describe('remove()', () => {
    beforeEach(() => {
      document.body.innerHTML = '<input type="text" /><div><span></span></div>'
    })

    it('should remove the calendar from the DOM', () => {
      const picker = datepicker('input')
      expect(!!document.querySelector('.qs-datepicker')).toBe(true)

      picker.remove()
      expect(!!document.querySelector('.qs-datepicker')).toBe(false)
    })

    it('should remove inline styles if they were set', () => {
      const div = document.querySelector('div')
      expect(div.style.position).toBe('')

      const picker = datepicker('span')
      expect(div.style.position).toBe('relative')

      picker.remove()
      expect(div.style.position).toBe('')
    })

    it('should delete the sibling property on a sibling instance', () => {
      const picker1 = datepicker('input', { id: 1 })
      const picker2 = datepicker('span', { id: 1 })

      expect(picker1).toBe(picker2.sibling)
      expect(picker2).toBe(picker1.sibling)
      expect(!!picker1.sibling).toBe(true)
      expect(!!picker2.sibling).toBe(true)

      picker1.remove()
      expect(picker2.sibling).toBe(undefined)
      picker2.remove()
    })

    it('should delete all properties on the instance', () => {
      const picker = datepicker('input')
      expect(Object.keys(picker).length > 1).toBe(true)

      picker.remove()
      expect(Object.keys(picker).length).toBe(0)
    })
  })

  describe('setDate()', () => {
    beforeEach(() => document.body.innerHTML = '<input type="text" />')

    it('should set a date on the calendar and populate the input field', () => {
      const input = document.querySelector('input')
      const picker = datepicker(input)

      document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

      expect(picker.dateSelected).toBe(undefined)
      expect(input.value).toBe('')

      picker.setDate(new Date(2099, 0, 1))
      expect(!!picker.dateSelected).toBe(true)
      expect(+picker.dateSelected).toBe(+new Date(2099, 0, 1))
      expect(!!input.value).toBe(true)

      picker.remove()
    })

    it('should change the calendar month to that date', () => {
      const picker = datepicker('input')
      const startCurrentMonthYear = document.querySelector('.qs-month-year').textContent

      document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      expect(picker.dateSelected).toBe(undefined)

      picker.setDate(new Date(2099, 0, 1), true)
      expect(!!picker.dateSelected).toBe(true)
      expect(+picker.dateSelected).toBe(+new Date(2099, 0, 1))

      const endCurrentMonthYear = document.querySelector('.qs-month-year').textContent
      expect(startCurrentMonthYear).not.toBe(endCurrentMonthYear)

      picker.remove()
    })

    it('should unset a date on the calendar', () => {
      const picker = datepicker('input')
      document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

      const allDays = Array.from(document.querySelectorAll('.qs-square.qs-num'))
      const day1 = allDays.find(node => node.textContent === '1')

      day1.click()
      document.querySelector('input').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      expect(!!document.querySelector('.qs-active')).toBe(true)

      picker.setDate()
      expect(!!document.querySelector('.qs-active')).toBe(false)
    })
  })

  describe('setMin()', () => {})

  describe('setMax()', () => {})
})
