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
    describe('on a single calendar', () => {
      beforeEach(() => document.body.innerHTML = '<input type="text" />')

      it('should set a date on the calendar and populate the input field', () => {
        const input = document.querySelector('input')
        const picker = datepicker(input)

        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))

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

        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
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
        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))

        const allDays = Array.from(document.querySelectorAll('.qs-square.qs-num'))
        const day1 = allDays.find(node => node.textContent === '1')

        day1.click()
        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
        expect(!!document.querySelector('.qs-active')).toBe(true)

        picker.setDate()
        expect(!!document.querySelector('.qs-active')).toBe(false)
      })

      it('should throw if setting a date outside the selectable range', () => {
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const picker = datepicker('input', {
          minDate: new Date(year, month, 10),
          maxDate: new Date(year, month, 20)
        })

        const allDays = document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)')
        allDays.forEach(node => {
          const num = +node.textContent
          expect(node.classList.contains('qs-disabled')).toBe(num < 10 || num > 20)
        })

        expect(() => picker.setDate(new Date(year, month, 1))).toThrow()
        expect(() => picker.setDate(new Date(year, month, 21))).toThrow()
      })
    })

    describe('with a daterange pair', () => {
      let start = undefined
      let end = undefined

      beforeEach(() => {
        document.body.innerHTML = `
          <input type="text" class="start" />
          <input type="text" class="end" />
        `
        start = datepicker('.start', { id: 1 })
        end = datepicker('.end', { id: 1 })
      })

      afterEach(() => {
        start.remove()
        end.remove()
      })

      it('should set the min date on both calendars when called on the 1st', () => {
        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => {
            expect(node.classList.contains('qs-disabled')).toBe(false)
            expect(node.classList.contains('active')).toBe(false)
          })
        })

        const today = new Date()
        start.setDate(new Date(today.getFullYear(), today.getMonth(), 15))

        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach(node => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num < 15)
            expect(node.classList.contains('active')).toBe(false)
          })
        })
      })

      it('should set the max date on both calendars when called on the 2nd', () => {
        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => {
            expect(node.classList.contains('qs-disabled')).toBe(false)
            expect(node.classList.contains('active')).toBe(false)
          })
        })

        const today = new Date()
        end.setDate(new Date(today.getFullYear(), today.getMonth(), 15))

        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach(node => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num > 15)
            expect(node.classList.contains('active')).toBe(false)
          })
        })
      })
    })
  })

  describe('setMin()', () => {
    describe('on a single caledar', () => {
      let picker = undefined

      beforeEach(() => {
        document.body.innerHTML = '<input type="text" />'
        picker = datepicker('input')
      })

      afterEach(() => picker.remove())

      it('should set the minimum selectable date', () => {
        const allNums1 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums1.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))

        const today = new Date()
        const minDate = new Date(today.getFullYear(), today.getMonth(), 15)
        picker.setMin(minDate)

        const allNums2 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums2.forEach(node => {
          const num = +node.textContent
          expect(node.classList.contains('qs-disabled')).toBe(num < 15)
        })
      })

      it('should unset the minimum selectable date', () => {
        const allNums1 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums1.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))

        const today = new Date()
        const minDate = new Date(today.getFullYear(), today.getMonth(), 15)
        picker.setMin(minDate)

        const allNums2 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums2.forEach(node => {
          const num = +node.textContent
          expect(node.classList.contains('qs-disabled')).toBe(num < 15 ? true : false)
        })

        picker.setMin()
        const allNums3 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums3.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
      })
    })

    describe('with a daterange pair', () => {
      let start = undefined
      let end = undefined

      beforeEach(() => {
        document.body.innerHTML = `
          <input type="text" class="start" />
          <input type="text" class="end" />
        `
        start = datepicker('.start', { id: 1 })
        end = datepicker('.end', { id: 1 })
      })

      afterEach(() => {
        start.remove()
        end.remove()
      })

      it('should set / unset the minimum selectable date on both instances when called on the 1st one', () => {
        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        // Assert that no days on either calendar are disabled.
        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
        })

        const today = new Date()
        const minDate = new Date(today.getFullYear(), today.getMonth(), 15)
        start.setMin(minDate)

        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach((node, i) => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num < 15)
          })
        })

        start.setMin()

        const allStartDays3 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays3 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
        })
      })

      it('should set / unset the minimum selectable date on both instances when called on the 2nd one', () => {
        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        // Assert that no days on either calendar are disabled.
        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
        })

        const today = new Date()
        const minDate = new Date(today.getFullYear(), today.getMonth(), 15)
        end.setMin(minDate)

        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach((node, i) => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num < 15)
          })
        })

        end.setMin()

        const allStartDays3 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays3 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
        })
      })

      it('should change the selected date if setting minimum prior to that date', () => {
        const today = new Date()
        start.setDate(new Date(today.getFullYear(), today.getMonth(), 20))
        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => {
            const num = +node.textContent
            expect()
          })
        })
        expect()

        const minDate = new Date(today.getFullYear(), today.getMonth(), 15)

      })
    })
  })

  describe('setMax()', () => {
    describe('on a single caledar', () => {})

    describe('with a daterange pair', () => {})
  })
})
