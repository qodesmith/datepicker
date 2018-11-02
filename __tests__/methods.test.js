const datepicker = require('../datepicker')

describe('Instance Methods', () => {
  describe('remove()', () => {
    let picker = undefined

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

  describe('setDate()', () => {})

  describe('setMin()', () => {})

  describe('setMax()', () => {})
})
