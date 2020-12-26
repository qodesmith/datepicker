import selectors from '../selectors'

const {
  singleDatepickerInput,
  single,
  range,
  common,
  singleDatepickerInputParent,
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
      it.only('should show a blue dot next to each day for the dates provided', function() {
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
})
