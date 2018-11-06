const datepicker = require('../src/datepicker')

function todaysDate() {
  const today = new Date()
  return [today.getFullYear(), today.getMonth()]
}

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

      it('should highlight a date on the calendar and populate the input field', () => {
        const input = document.querySelector('input')
        const picker = datepicker(input)
        const [year, month] = todaysDate()

        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))

        expect(picker.dateSelected).toBe(undefined)
        expect(input.value).toBe('')
        expect(document.querySelectorAll('.qs-active').length).toBe(0)

        picker.setDate(new Date(year, month, 1))
        expect(!!picker.dateSelected).toBe(true)
        expect(+picker.dateSelected).toBe(+new Date(year, month, 1))
        expect(!!input.value).toBe(true)
        expect(document.querySelectorAll('.qs-active').length).toBe(1)

        picker.remove()
      })

      it('should change the calendar month to that date', () => {
        const picker = datepicker('input')
        const startCurrentMonthYear = document.querySelector('.qs-month-year').textContent
        const [year, month] = todaysDate()

        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
        expect(picker.dateSelected).toBe(undefined)

        picker.setDate(new Date(year, month + 1, 1), true)
        expect(!!picker.dateSelected).toBe(true)
        expect(+picker.dateSelected).toBe(+new Date(year, month + 1, 1))

        const endCurrentMonthYear = document.querySelector('.qs-month-year').textContent
        expect(startCurrentMonthYear).not.toBe(endCurrentMonthYear)

        picker.remove()
      })

      it('should unset a date on the calendar', () => {
        const picker = datepicker('input')
        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))

        const allDays = Array.from(document.querySelectorAll('.qs-square.qs-num'))
        const day1 = allDays.find(node => node.textContent === '1')
        expect(document.querySelectorAll('.qs-active').length).toBe(0)

        day1.click()
        document.querySelector('input').dispatchEvent(new Event('focusin', { bubbles: true }))
        expect(!!document.querySelector('.qs-active')).toBe(true)

        picker.setDate()
        expect(!!document.querySelector('.qs-active')).toBe(false)
      })

      it('should throw if setting a date outside the selectable range', () => {
        const [year, month] = todaysDate()
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

        start.setDate(new Date(...todaysDate(), 15))

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

        end.setDate(new Date(...todaysDate(), 15))

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

      it('should throw if setting a date outside the selectable range (either calendar)', () => {
        start.remove()
        end.remove()

        const [year, month] = todaysDate()
        start = datepicker('.start', {
          id: 1,
          minDate: new Date(year, month, 10),
          maxDate: new Date(year, month, 20)
        })
        end = datepicker('.end', {
          id: 1,
          minDate: new Date(year, month, 10),
          maxDate: new Date(year, month, 20)
        })

        expect(() => start.setDate(new Date(year, month, 1))).toThrow()
        expect(() => start.setDate(new Date(year, month, 21))).toThrow()
        expect(() => end.setDate(new Date(year, month, 1))).toThrow()
        expect(() => end.setDate(new Date(year, month, 21))).toThrow()
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

        const minDate = new Date(...todaysDate(), 15)
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

        const minDate = new Date(...todaysDate(), 15)
        picker.setMin(minDate)

        const allNums2 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums2.forEach(node => {
          const num = +node.textContent
          expect(node.classList.contains('qs-disabled')).toBe(num < 15)
        })

        picker.setMin()
        const allNums3 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums3.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
      })

      it('should remove a selected date when setting the minimum after that date', () => {
        const [year, month] = todaysDate()
        expect(document.querySelectorAll('.qs-active').length).toBe(0)
        picker.setDate(new Date(year, month, 1))
        expect(document.querySelectorAll('.qs-active').length).toBe(1)

        picker.setMin(new Date(year, month, 10))
        expect(document.querySelectorAll('.qs-active').length).toBe(0)
      })

      it('should throw when setting the minimum past the maximum', () => {
        const [year, month] = todaysDate()
        picker.setMax(new Date(year, month, 10))

        expect(() => picker.setMin(new Date(year, month, 11))).toThrow()
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

        start.setMin(new Date(...todaysDate(), 15))

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

        end.setMin(new Date(...todaysDate(), 15))

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
        const [year, month] = todaysDate()
        start.setDate(new Date(year, month, 20))

        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num < 20)
          })
        })

        expect(document.querySelectorAll('.qs-active').length).toBe(1)
        expect(document.querySelector('.qs-active').textContent).toBe('20')

        start.setMin(new Date(year, month, 15))
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
          })
        })

        expect(document.querySelectorAll('.qs-active').length).toBe(1)
        expect(document.querySelector('.qs-active').textContent).toBe('15')
      })

      it('should throw when setting the minimum past the maximum', () => {
        const [year, month] = todaysDate()
        start.setMax(new Date(year, month, 10))

        expect(() => start.setMin(new Date(year, month, 11))).toThrow()
        expect(() => end.setMin(new Date(year, month, 11))).toThrow()
      })
    })
  })

  describe('setMax()', () => {
    describe('on a single caledar', () => {
      let picker = undefined

      beforeEach(() => {
        document.body.innerHTML = '<input type="text" />'
        picker = datepicker('input')
      })

      afterEach(() => picker.remove())

      it('should set the maximum selectable date', () => {
        const allNums1 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums1.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))

        const maxDate = new Date(...todaysDate(), 15)
        picker.setMax(maxDate)

        const allNums2 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums2.forEach(node => {
          const num = +node.textContent
          expect(node.classList.contains('qs-disabled')).toBe(num > 15)
        })
      })

      it('should unset the maximum selectable date', () => {
        const allNums1 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums1.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))

        const maxDate = new Date(...todaysDate(), 15)
        picker.setMax(maxDate)

        const allNums2 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums2.forEach(node => {
          const num = +node.textContent
          expect(node.classList.contains('qs-disabled')).toBe(num > 15)
        })

        picker.setMax()
        const allNums3 = Array.from(document.querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        allNums3.forEach(node => expect(node.classList.contains('qs-disabled')).toBe(false))
      })

      it('should remove a selected date when setting the maximum before that date', () => {
        const [year, month] = todaysDate()
        expect(document.querySelectorAll('.qs-active').length).toBe(0)
        picker.setDate(new Date(year, month, 10))
        expect(document.querySelectorAll('.qs-active').length).toBe(1)

        picker.setMax(new Date(year, month, 1))
        expect(document.querySelectorAll('.qs-active').length).toBe(0)
      })

      it('should throw when setting the maximum below the minimum', () => {
        const [year, month] = todaysDate()
        picker.setMin(new Date(year, month, 11))

        expect(() => picker.setMax(new Date(year, month, 10))).toThrow()
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

      it('should set / unset the maximum selectable date on both instances when called on the 1st one', () => {
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

        start.setMax(new Date(...todaysDate(), 15))

        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach((node, i) => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num > 15)
          })
        })

        start.setMax()

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

      it('should set / unset the maximum selectable date on both instances when called on the 2nd one', () => {
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

        end.setMax(new Date(...todaysDate(), 15))

        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach((node, i) => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num > 15)
          })
        })

        end.setMax()

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

      it('should change the selected date if setting maximum after that date', () => {
        const [year, month] = todaysDate()
        end.setDate(new Date(year, month, 20))

        const allStartDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays1 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays1, allEndDays1].forEach(arr => {
          arr.forEach(node => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num > 20)
          })
        })

        expect(document.querySelectorAll('.qs-active').length).toBe(1)
        expect(document.querySelector('.qs-active').textContent).toBe('20')

        end.setMax(new Date(year, month, 25))
        const allStartDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[0]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))
        const allEndDays2 = Array.from(document
          .querySelectorAll('.qs-datepicker')[1]
          .querySelectorAll('.qs-square.qs-num:not(.qs-empty)'))

        ;[allStartDays2, allEndDays2].forEach(arr => {
          arr.forEach(node => {
            const num = +node.textContent
            expect(node.classList.contains('qs-disabled')).toBe(num > 25)
          })
        })

        expect(document.querySelectorAll('.qs-active').length).toBe(1)
        expect(document.querySelector('.qs-active').textContent).toBe('25')
      })

      it('should change the selected date if setting maximum before that date', () => {})

      it('should throw when setting the maximum below the minimum', () => {
        const [year, month] = todaysDate()
        start.setMin(new Date(year, month, 10))

        expect(() => start.setMax(new Date(year, month, 9))).toThrow()
        expect(() => end.setMax(new Date(year, month, 9))).toThrow()
      })
    })
  })

  describe('show() / hide()', () => {
    let picker = undefined

    beforeEach(() => {
      document.body.innerHTML = '<input type="text" />'
      picker = datepicker('input')
    })

    afterEach(() => picker.remove())

    it('should show the calendar', () => {
      const dp = document.querySelector('.qs-datepicker')
      expect(dp.className.includes('qs-hidden')).toBe(true)

      picker.show()
      expect(dp.className.includes('qs-hidden')).toBe(false)
    })

    it('should hide the calendar', () => {
      const dp = document.querySelector('.qs-datepicker')
      expect(dp.className.includes('qs-hidden')).toBe(true)

      picker.show()
      expect(dp.className.includes('qs-hidden')).toBe(false)

      picker.hide()
      expect(dp.className.includes('qs-hidden')).toBe(true)
    })
  })
})
