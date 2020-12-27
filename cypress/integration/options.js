import selectors from '../selectors'
import pickerProperties from '../pickerProperties'

const {
  singleDatepickerInput,
  single,
  range,
  common,
  singleDatepickerInputParent,
  daterangeInputStart,
  daterangeInputEnd,
} = selectors

describe('User options', function() {
  beforeEach(function() {
    cy.visit('http://localhost:9001')

    /*
      We can't simply import the datepicker library up at the top because it will not
      be associated with the correct window object. Instead, we can use a Cypress alias
      that will expose what we want on `this`, so long as we avoid using arrow functions.
      This is possible because datepicker is assigned a value on the window object in `sandbox.js`.
    */
    cy.window().then(global => cy.wrap(global.datepicker).as('datepicker'))
  })

  describe('Customizations', function() {
    describe('formatter', function() {
      it('should customize the input value when a date is selected', function() {
        const expectedValue = 'datepicker rulez'
        const options = {
          formatter: (input, date, instance) => {
            input.value = expectedValue
          }
        }
        this.datepicker(singleDatepickerInput, options)

        cy.get(singleDatepickerInput).should('have.value', '').click()
        cy.get(`${single.calendarContainer} [data-direction="0"]`).first().click()
        cy.get(singleDatepickerInput).should('have.value', expectedValue)
      })

      it('should be called with the correct arguments', function() {
        let picker
        const today = new Date()
        const selectedDate = new Date(today.getFullYear(), today.getMonth(), 1)
        const options = {
          formatter: (input, date, instance) => {
            expect(input, '1st arg to `formatter` should be the input').to.eq(instance.el)

            /*
              We can't use `instanceof Date` because `Date` is a different constructor
              than the one on the window object that Cypress uses. Essentially,
              we're dealing with 2 different window object. So it's easier to just do
              the whole toString thingy.
            */
            expect(({}).toString.call(date), '2nd arg to `formatter` should be the date selected').to.eq('[object Date]')
            expect(+instance.dateSelected, 'the date should === instance.dateSelected').to.eq(+date)
            expect(+selectedDate, 'the selected date should have the correct value').to.eq(+date)
            expect(instance, '3rd arg to `formatter` should be the instance').to.eq(picker)
          }
        }

        picker = this.datepicker(singleDatepickerInput, options)
        cy.get(singleDatepickerInput).click()
        cy.get(`${single.calendarContainer} [data-direction="0"]`).first().click()
      })

      it(`should not be called if the picker doesn't have an associated input`, function() {
        const options = { formatter: () => {} }
        const spy = cy.spy(options, 'formatter')
        this.datepicker(singleDatepickerInputParent, options)

        cy.get(singleDatepickerInputParent).click({ force: true })
        cy.get(`${common.squaresContainer} [data-direction="0"]`).first().click().then(() => {
          expect(spy).not.to.be.called
        })
      })
    })

    describe('position', function() {
      it('should position the calendar relative to the input - default (bottom left)', function() {
        this.datepicker(singleDatepickerInput)

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.greaterThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(left).to.equal('0px')
        })
      })

      it('should position the calendar relative to the input - bottom left', function() {
        this.datepicker(singleDatepickerInput, {position: 'bl'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.greaterThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(left).to.equal('0px')
        })
      })

      it('should position the calendar relative to the input - bottom right', function() {
        this.datepicker(singleDatepickerInput, {position: 'br'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.greaterThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(+left.replace('px', '')).to.be.greaterThan(0)
        })
      })

      it('should position the calendar relative to the input - top left', function() {
        this.datepicker(singleDatepickerInput, {position: 'tl'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.lessThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(left).to.equal('0px')
        })
      })

      it('should position the calendar relative to the input - top right', function() {
        this.datepicker(singleDatepickerInput, {position: 'tr'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.lessThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(+left.replace('px', '')).to.be.greaterThan(0)
        })
      })
    })

    describe('startDay', function() {
      it('should start the calendar on the specified day of the week (Monday)', function() {
        this.datepicker(singleDatepickerInput, {startDay: 1})

        cy.get(single.squares).then($squares => {
          const [firstSquare] = $squares
          expect(firstSquare.textContent).to.equal('Mon')
        })
      })

      it('should start the calendar on the specified day of the week (Thursday)', function() {
        this.datepicker(singleDatepickerInput, {startDay: 4})

        cy.get(single.squares).then($squares => {
          const [firstSquare] = $squares
          expect(firstSquare.textContent).to.equal('Thu')
        })
      })
    })

    describe('customDays', function() {
      it('should display custom days in the calendar header', function() {
        const customDays = 'abcdefg'.split('')
        this.datepicker(singleDatepickerInput, {customDays})

        cy.get(single.squares).then($squares => {
          Array
            .from($squares)
            .slice(0, 7)
            .map(el => el.textContent)
            .forEach((text, i) => expect(text).to.equal(customDays[i]))
        })
      })
    })

    describe('customMonths', function() {
      const customMonths = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ]

      it('should display custom month names in the header', function() {
        let currentMonthIndex = new Date().getMonth()

        // `alwaysShow` is used simply to avoid having to click to open the calendar each time.
        this.datepicker(singleDatepickerInput, {customMonths, alwaysShow: 1})

        // https://stackoverflow.com/a/53487016/2525633 - Use array iteration as opposed to a for-loop.
        Array.from({length: 12}, (_, i) => {
          if (currentMonthIndex > 11) currentMonthIndex = 0

          cy.get(`${single.controls} .qs-month`).should('have.text', customMonths[currentMonthIndex])
          cy.get(`${single.controls} .qs-arrow.qs-right`).click()

          currentMonthIndex++
        })
      })

      it('should display abbreviated custom month names in the overlay', function() {
        this.datepicker(singleDatepickerInput, {customMonths})

        cy.get(common.overlayMonth).then($months => {
          Array.from($months).forEach((month, i) => {
            expect(month.textContent).to.equal(customMonths[i].slice(0, 3))
          })
        })
      })
    })

    describe('customOverlayMonths', function() {
      const customOverlayMonths = 'abcdefghijkl'.split('')

      it('should display custom abbreviated month names in the overlay', function() {
        this.datepicker(singleDatepickerInput, {customOverlayMonths})

        cy.get(common.overlayMonth).then($months => {
          Array.from($months).forEach((month, i) => {
            expect(month.textContent).to.equal(customOverlayMonths[i])
          })
        })
      })

      it('should display custom abbreviated month names in the overlay, unaffected by `customMonths`', function() {
        const customMonths = [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ]
        this.datepicker(singleDatepickerInput, {customOverlayMonths, customMonths})

        cy.get(common.overlayMonth).then($months => {
          Array.from($months).forEach((month, i) => {
            expect(month.textContent).to.equal(customOverlayMonths[i])
          })
        })
      })
    })

    describe('overlayButton', function() {
      it('should display custom text for the overlay button', function() {
        const overlayButton = '¡Vamanos!'
        this.datepicker(singleDatepickerInput, {overlayButton})

        cy.get(common.overlaySubmit).should('have.text', overlayButton)
      })
    })

    describe('overlayPlaceholder', function() {
      it('should display custom placeholder text for the overlay year-input', function() {
        const overlayPlaceholder = 'Entrar un año'
        this.datepicker(singleDatepickerInput, {overlayPlaceholder})

        cy.get(common.overlayYearInput).should('have.attr', 'placeholder', overlayPlaceholder)
      })
    })

    describe('events', function() {
      it('should show a blue dot next to each day for the dates provided', function() {
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const days = [5, 10, 15]
        const events = days.map(day => new Date(year, month, day))
        this.datepicker(singleDatepickerInput, {events})

        cy.get(singleDatepickerInput).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const day = i + 1

            if (days.includes(day)) {
              // https://stackoverflow.com/a/55517628/2525633 - get pseudo element styles in Cypress.
              const win = square.ownerDocument.defaultView
              const after = win.getComputedStyle(square, 'after')

              expect(square.classList.contains('qs-event'), day).to.equal(true)
              expect(after.backgroundColor).to.equal('rgb(0, 119, 255)')
              expect(after.borderRadius).to.equal('50%')
            } else {
              expect(square.classList.contains('qs-event'), day).to.equal(false)
            }
          })
        })
      })
    })
  })

  describe('Settings', function() {
    describe('alwaysShow', function() {
      it('should always show the calendar', function() {
        const todaysDate = new Date().getDate()
        this.datepicker(singleDatepickerInput, {alwaysShow: true})

        cy.get(single.calendarContainer).should('be.visible')
        cy.get('body').click()
        cy.get(single.calendarContainer).should('be.visible')
        cy.get(common.squareWithNum).eq(todaysDate === 1 ? 1 : 0).click()
        cy.get(single.calendarContainer).should('be.visible')
      })
    })

    describe('dateSelected', function() {
      it('should have a date selected on the calendar', function() {
        const dateSelected = new Date()
        const date = dateSelected.getDate()
        this.datepicker(singleDatepickerInput, {dateSelected})

        cy.get('.qs-active').should('have.text', date)
        cy.get(singleDatepickerInput).should('have.value', dateSelected.toDateString())
      })
    })

    describe('maxDate', function() {
      it('should disable dates beyond the date provided', function() {
        const maxDate = new Date()
        const todaysDate = maxDate.getDate()
        this.datepicker(singleDatepickerInput, {maxDate})

        cy.get(singleDatepickerInput).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)

            if (i + 1 > todaysDate) {
              expect(square.classList.contains('qs-disabled')).to.equal(true)
              expect(opacity, 'disabled date opacity').to.equal('0.2')
              expect(cursor, 'disabled date cursor').to.equal('not-allowed')
            } else {
              expect(square.classList.contains('qs-disabled')).to.equal(false)
              expect(opacity, 'enabled date opacity').to.equal('1')
              expect(cursor, 'enabled date cursor').to.equal('pointer')
            }
          })
        })

        // Check the next month.
        cy.get(`${single.controls} .qs-arrow.qs-right`).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)

            expect(square.classList.contains('qs-disabled')).to.equal(true)
            expect(opacity, 'disabled date opacity').to.equal('0.2')
            expect(cursor, 'disabled date cursor').to.equal('not-allowed')
          })
        })

        // Check the month before.
        cy.get(`${single.controls} .qs-arrow.qs-left`).click()
        cy.get(`${single.controls} .qs-arrow.qs-left`).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)

            expect(square.classList.contains('qs-disabled')).to.equal(false)
            expect(opacity, 'enabled date opacity').to.equal('1')
            expect(cursor, 'enabled date cursor').to.equal('pointer')
          })
        })
      })
    })

    describe('minDate', function() {
      it('should disable dates beyond the date provided', function() {
        const minDate = new Date()
        const todaysDate = minDate.getDate()
        this.datepicker(singleDatepickerInput, {minDate})

        cy.get(singleDatepickerInput).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)

            if (i + 1 < todaysDate) {
              expect(square.classList.contains('qs-disabled')).to.equal(true)
              expect(opacity, 'disabled date opacity').to.equal('0.2')
              expect(cursor, 'disabled date cursor').to.equal('not-allowed')
            } else {
              expect(square.classList.contains('qs-disabled')).to.equal(false)
              expect(opacity, 'enabled date opacity').to.equal('1')
              expect(cursor, 'enabled date cursor').to.equal('pointer')
            }
          })
        })

        // Check the next month.
        cy.get(`${single.controls} .qs-arrow.qs-right`).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)

            expect(square.classList.contains('qs-disabled')).to.equal(false)
            expect(opacity, 'enabled date opacity').to.equal('1')
            expect(cursor, 'enabled date cursor').to.equal('pointer')
          })
        })

        // Check the month before.
        cy.get(`${single.controls} .qs-arrow.qs-left`).click()
        cy.get(`${single.controls} .qs-arrow.qs-left`).click()
        cy.get(common.squareWithNum).then($squares => {
          Array.from($squares).forEach((square, i) => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)

            expect(square.classList.contains('qs-disabled')).to.equal(true)
            expect(opacity, 'disabled date opacity').to.equal('0.2')
            expect(cursor, 'disabled date cursor').to.equal('not-allowed')
          })
        })
      })
    })

    describe('startDate', function() {
      it('should start the calendar in the month & year of the date provided', function() {
        const {months} = pickerProperties
        const startDate = new Date()
        const year = startDate.getFullYear()
        const currentMonthName = months[startDate.getMonth()]
        this.datepicker(singleDatepickerInput, {startDate})

        cy.get(`${single.controls} .qs-month`).should('have.text', currentMonthName)
        cy.get(`${single.controls} .qs-year`).should('have.text', year)
      })
    })

    describe('showAllDates', function() {
      it('should show numbers for dates outside the current month', function() {
        this.datepicker(singleDatepickerInput, {showAllDates: true})

        cy.get(`${single.squaresContainer} .qs-outside-current-month`).then($squares => {
          Array.from($squares).forEach(square => {
            const win = square.ownerDocument.defaultView
            const {opacity, cursor} = win.getComputedStyle(square)
            const num = +square.textContent

            const {dataset} = square
            expect(dataset.hasOwnProperty('direction'))
            expect(opacity, 'date outside current month - opacity').to.equal('0.2')
            expect(cursor, 'date outside current month - cursor').to.equal('pointer')
            expect(num, 'number inside square').to.be.greaterThan(0)
          })
        })
      })
    })

    describe('respectDisabledReadOnly', function() {
      it('should show a non-selectable calendar when the input has the `disabled` property', function() {
        cy.window().then(global => {
          const input = global.document.querySelector(singleDatepickerInput)
          input.setAttribute('disabled', '')

          // Using `alwaysShow` otherwise the calendar won't be able to be shown since the input is disabled.
          global.datepicker(singleDatepickerInput, {respectDisabledReadOnly: true, alwaysShow: true})

          // Selecting days should have no effect.
          cy.get(`${single.squaresContainer} .qs-active`).should('have.length', 0)
          cy.get(`${single.squaresContainer} .qs-num`).first().click()
          cy.get(`${single.squaresContainer} .qs-active`).should('have.length', 0)

          // You should be able to change months.
          const initialMonthName = global.document.querySelector('.qs-month').textContent
          cy.get(`${single.controls} .qs-arrow.qs-right`).click().then(() => {
            const nextMonthName = global.document.querySelector('.qs-month').textContent
            expect(initialMonthName).not.to.equal(nextMonthName)

            // You should be able to use the overlay.
            const initialYear = global.document.querySelector('.qs-year').textContent
            cy.get('.qs-month-year').click()
            cy.get(common.overlayYearInput).type('2099')
            cy.get(common.overlaySubmit).click().then(() => {
              const otherYear = global.document.querySelector('.qs-year').textContent
              expect(initialYear).not.to.equal(otherYear)
              cy.get('.qs-year').should('have.text', '2099')
            })
          })
        })
      })

      it('should show a non-selectable calendar when the input has the `readonly` property', function() {
        cy.window().then(global => {
          const input = global.document.querySelector(singleDatepickerInput)
          input.setAttribute('readonly', '')
          global.datepicker(singleDatepickerInput, {respectDisabledReadOnly: true})

          // Selecting days should have no effect.
          cy.get(singleDatepickerInput).click()
          cy.get(`${single.squaresContainer} .qs-active`).should('have.length', 0)
          cy.get(`${single.squaresContainer} .qs-num`).first().click()
          cy.get(`${single.squaresContainer} .qs-active`).should('have.length', 0)

          // You should be able to change months.
          const initialMonthName = global.document.querySelector('.qs-month').textContent
          cy.get(`${single.controls} .qs-arrow.qs-right`).click().then(() => {
            const nextMonthName = global.document.querySelector('.qs-month').textContent
            expect(initialMonthName).not.to.equal(nextMonthName)

            // You should be able to use the overlay.
            const initialYear = global.document.querySelector('.qs-year').textContent
            cy.get('.qs-month-year').click()
            cy.get(common.overlayYearInput).type('2099')
            cy.get(common.overlaySubmit).click().then(() => {
              const otherYear = global.document.querySelector('.qs-year').textContent
              expect(initialYear).not.to.equal(otherYear)
              cy.get('.qs-year').should('have.text', '2099')
            })
          })
        })
      })
    })
  })

  describe('Disabling Things', function() {
    describe('noWeekends', function() {
      it('should disable Saturday and Sunday', function() {
        const date = new Date()
        this.datepicker(singleDatepickerInput, {noWeekends: true})

        cy.get(common.squareWithNum).then($squares => {
          const newDate = new Date(date.getFullYear(), date.getMonth(), 1)
          let index = newDate.getDay()

          Array.from($squares).forEach(square => {
            if (index === 7) index = 0

            if ((index === 0 || index === 6) && !square.classList.contains('qs-outside-current-month')) {
              expect(square.classList.contains('qs-disabled'), square.textContent).to.equal(true)
            } else {
              expect(square.classList.contains('qs-disabled'), square.textContent).to.equal(false)
            }

            index++
          })
        })
      })

      it('should disable Saturday and Sunday even when Sunday is not the start day', function() {
        const date = new Date()
        this.datepicker(singleDatepickerInput, {noWeekends: true, startDay: 3})

        cy.get(common.squareWithNum).then($squares => {
          const newDate = new Date(date.getFullYear(), date.getMonth(), 1)
          let index = newDate.getDay()

          Array.from($squares).forEach(square => {
            if (index === 7) index = 0

            if ((index === 0 || index === 6) && !square.classList.contains('qs-outside-current-month')) {
              expect(square.classList.contains('qs-disabled'), square.textContent).to.equal(true)
            } else {
              expect(square.classList.contains('qs-disabled'), square.textContent).to.equal(false)
            }

            index++
          })
        })
      })

      it('should disable Saturday and Sunday even when `showAllDates` is true', function() {
        const date = new Date()
        this.datepicker(singleDatepickerInput, {noWeekends: true, showAllDates: true})

        cy.get(common.squareWithNum).then($squares => {
          const newDate = new Date(date.getFullYear(), date.getMonth(), 1)
          let index = 0

          Array.from($squares).forEach(square => {
            if (index === 7) index = 0

            if (index === 0 || index === 6) {
              expect(square.classList.contains('qs-disabled'), square.textContent).to.equal(true)
            } else {
              expect(square.classList.contains('qs-disabled'), square.textContent).to.equal(false)
            }

            index++
          })
        })
      })
    })

    describe('disabler', function() {
      it('should disable all odd days', function() {
        this.datepicker(singleDatepickerInput, {
          disabler: date => date.getDate() % 2,
        })

        cy.get(singleDatepickerInput).click()
        cy.get(common.squareWithNum).first().click()
        cy.get(singleDatepickerInput).should('have.value', '')
        cy.get(common.squareWithNum).eq(1).click()
        cy.get(singleDatepickerInput).should('not.have.value', '')
      })

      it('should disable days outside the calendar month as well', function() {
        this.datepicker(singleDatepickerInput, {
          disabler: date => true,
          showAllDates: true,
        })

        cy.get(singleDatepickerInput).click()
        cy.get(common.squareOutsideCurrentMonth).should($squares => {
          Array.from($squares).forEach(square => {
            expect(square.classList.contains('qs-disabled')).to.equal(true)
          })
        })
      })
    })

    describe('disabledDates', function() {
      it('should disable the dates provided', function() {
        const today = new Date()
        this.datepicker(singleDatepickerInput, {
          disabledDates: [
            new Date(today.getFullYear(), today.getMonth(), 1),
            new Date(today.getFullYear(), today.getMonth(), 17),
            new Date(today.getFullYear(), today.getMonth(), 25),
          ],
        })

        cy.get(`${single.squaresContainer} .qs-disabled`)
          .should('have.length', 3)
          .should($days => {
            expect($days.eq(0).text()).to.equal('1')
            expect($days.eq(1).text()).to.equal('17')
            expect($days.eq(2).text()).to.equal('25')
          })
      })
    })

    /*
      I don't know how to test `disableMobile` since there is logic with that option
      to check if the device is mobile or not.
    */

    describe('disableYearOverlay', function() {
      it('should disable showing the overlay', function() {
        this.datepicker(singleDatepickerInput, {disableYearOverlay: true})

        cy.get(singleDatepickerInput).click()
        cy.get(single.overlay).should('have.class', 'qs-hidden')
        cy.get(`${single.controls} .qs-month-year`).click()
        cy.get(single.overlay).should('have.class', 'qs-hidden')
      })
    })

    describe('disabled - an instance property, not an option property', function() {
      it('should disable the calendar from showing', function() {
        const instance = this.datepicker(singleDatepickerInput)
        instance.disabled = true

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('not.be.visible')
      })

      it('should disable all functionality for a calendar that is showing', function() {
        const instance = this.datepicker(singleDatepickerInput, {alwaysShow: true})
        instance.disabled = true
        const currentMonthName = pickerProperties.months[new Date().getMonth()]

        // Clicking a day.
        cy.get(common.squareWithNum).eq(0).click()
        cy.get(singleDatepickerInput).should('have.value', '')

        // Clicking the arrows.
        cy.get(`${single.controls} .qs-month`).should('have.text', currentMonthName)
        cy.get(`${single.controls} .qs-arrow.qs-left`).click()
        cy.get(`${single.controls} .qs-month`).should('have.text', currentMonthName)

        // Clicking to try to show the overlay.
        cy.get(`${single.controls} .qs-month-year`).click()
        cy.get(common.overlay).should('not.be.visible')
      })
    })

    describe('id - only for daterange pickers', function() {
      it('should create and link a daterange pair', function() {
        const id = 1
        const pickerStart = this.datepicker(daterangeInputStart, {id})
        const pickerEnd = this.datepicker(daterangeInputEnd, {id})
        const pickerSingle = this.datepicker(singleDatepickerInput)

        // `id` property.
        expect(pickerStart.id).to.equal(id)
        expect(pickerEnd.id).to.equal(id)
        expect(pickerSingle.id).to.equal(undefined)

        // Only ranges should have the `getRange` method.
        expect(typeof pickerStart.getRange, 'getRange - start').to.equal('function')
        expect(typeof pickerEnd.getRange, 'getRange - end').to.equal('function')
        expect(pickerSingle.getRange, `getRange shouldn't exist on a single picker`).to.equal(undefined)
      })
    })
  })
})
