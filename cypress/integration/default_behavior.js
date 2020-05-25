import selectors from '../selectors'
import pickerProperties from '../pickerProperties'

const {
  singleDatepickerInput,
  daterangeInputEnd,
  daterangeInputStart,
} = selectors
const { singleDatepickerProperties, getDaterangeProperties } = pickerProperties

/*
  The tests need to be rethought so as to be independent.
  State should not persist from test to test.
  Each piece should be testable independently.

  TODO: Refactor / rethink / cleanup the sandbox folder.
  These files should truly reflect a separate sandbox for
  developing from the app that Cypress runs for E2E testing.

  TODO: update how we test for the correct number of days.
  Issue #86 (https://bit.ly/2XYVLKK) highlights this issue.

  TODO: add a test for the navigate method.
*/

// Temporary while writing new tests
const x = { describe: () => {} }

function checkPickerProperties(picker, isDaterange, id) {
  return function({ property, defaultValue, domElement, selector, deepEqual, isFunction, notOwnProperty }) {
    const value = picker[property]

    if (!notOwnProperty) {
      // The property should exist on the picker.
      expect(picker).to.haveOwnProperty(property)
    }

    // Special case for id.
    if (isDaterange && property === 'id') {
      expect(value).to.equal(id)

    // First get the dom element, then ensure it has the correct default value.
    } else if (domElement) {
      cy.get(selector).then(elements => {
        assert.equal(value, defaultValue(elements), property)
        expect(elements).to.have.lengthOf(1)
      })

    // Ensure the value is a function.
    } else if (isFunction) {
      assert.isFunction(value)

    // The property should have the correct default value.
    } else if (deepEqual) {
      assert.deepEqual(value, defaultValue, property)
    } else {
      assert.equal(value, defaultValue, property)
    }
  }
}


describe('Default properties and behavior', function() {
  beforeEach(function() {
    cy.visit('http://localhost:9001')

    /*
      We can't simply import the datepicker library up at the top because it will not
      be associated with the correct window object. Instead, we can use a Cypress alias
      that will expose what we want on `this`, so long as we avoid using arrow functions.
    */
    cy.window().then(global => cy.wrap(global.datepicker).as('datepicker'))
  })

  describe('Single instance', function() {
    it('should have the correct properties and values', function() {
      const picker = this.datepicker(singleDatepickerInput)

      singleDatepickerProperties.forEach(checkPickerProperties(picker))

      // Ensure that only and all the properties are in the picker instance.
      const pickerKeys = Object.keys(picker)
      const numOfPropertiesExpected = singleDatepickerProperties.length
      expect(pickerKeys).to.have.length(numOfPropertiesExpected)

      singleDatepickerProperties.forEach(({ property }) => {
        expect(picker).to.haveOwnProperty(property)
      })
    })
  })

  describe('Daterange pair', function() {
    it('(they) should have the correct properties and values', function() {
      const options = { id: Math.random() } // Using Math.random to showcase that the id just needs to be consistent between both instances.
      const startPicker = this.datepicker(daterangeInputStart, options)
      const endPicker = this.datepicker(daterangeInputEnd, options)

      ;['start', 'end'].forEach(type => {
        const pickerToCheck = type === 'start' ? startPicker : endPicker
        const pickerProperties = getDaterangeProperties(type, startPicker, endPicker)
        pickerProperties.forEach(checkPickerProperties(pickerToCheck, true, options.id))

        // Ensure that only and all the properties are in the picker instance.
        const pickerKeys = Object.keys(pickerToCheck)
        const numOfPropertiesExpected = pickerProperties.length

        expect(pickerKeys).to.have.length(numOfPropertiesExpected)

        pickerProperties.forEach(({ property }) => {
          expect(pickerToCheck).to.haveOwnProperty(property)
        })
      })
    })
  })
})


x.describe('Initial calendar load with default settings', () => {
  const today = new Date()
  const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let picker



  describe('Datepicker UI (& corresponding changes to instance object properties)', () => {
    describe('Basic visuals and behavior', () => {
      it('has the calendar in the DOM but not visible', () => {
        cy.get('.qs-datepicker-container')
          .should('exist')
          .should('not.be.visible')
      })

      it('should show the calendar when clicking into the input', () => {
        cy.get('[data-cy="input-1"]').click()
        cy.get('.qs-datepicker-container')
          .should('be.visible')
      })

      it('defaults to showing the current month and year', () => {
        cy.get('.qs-month').then($month => {
          const month = $month.text()
          const monthIndex = months.findIndex(m => m === month)

          expect(today.getMonth()).to.equal(monthIndex)

          cy.get('.qs-year').then($year => {
            const year = $year.text()
            expect(today.getFullYear()).to.equal(+year)
          })
        })
      })

      it('shows the calendar days of the week (top of calendar)', () => {
        cy.get('.qs-squares .qs-day')
          .should('have.length', 7)
          .each(($day, i) => {
            expect($day.text()).to.equal(days[i])
          })
      })

      it('shows the calendar days of the month', () => {
        cy.get('.qs-squares .qs-num')
          .should('have.length.of.at.least', 28)
      })

      it('has the correct number of days on the calendar', () => {
        const numOfDays = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

        cy.get('div.qs-num')
          .should('have.length', numOfDays)
      })

      it(`should show today's date in bold and underlined`, () => {
        cy.get('.qs-current')
          .should('have.text', `${today.getDate()}`)
          .should('have.css', 'font-weight', '700')

        cy.get('.qs-current .qs-num')
          .should('have.css', 'text-decoration', 'underline solid rgb(0, 0, 0)')
      })

      it('should not have bold & underline on other dates', () => {
        cy.get('div.qs-num:not(.qs-empty):not(.qs-current) span')
          .eq(0)
          .should('have.css', 'text-decoration', 'none solid rgb(0, 0, 0)')
      })

      it('should not be showing the overlay', () => {
        cy.get('.qs-overlay')
          .should('have.css', 'opacity', '0')
      })

      it('hides the calendar when clicking outside the calendar and input', () => {
        cy.get('body').click()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })

      it('should progress to the next month when the right arrow is clicked', () => {
        const startingMonth = months[picker.currentMonth]
        const nextMonthIndex = picker.currentMonth === 11 ? 0 : picker.currentMonth + 1
        const nextMonth = months[nextMonthIndex]

        cy.get('[data-cy="input-1"]').click()
        cy.get('.qs-controls .qs-month').should('have.text', startingMonth)
        cy.get('.qs-controls .qs-right').click().then(() => {
          cy.get('.qs-controls .qs-month').should('have.text', nextMonth)
          expect(picker.currentMonthName).to.equal(nextMonth)
          expect(picker.currentMonth).to.equal(nextMonthIndex)
        })
      })

      it('should navigate to the previous month when the left arrow is clicked', () => {
        const startingMonth = months[picker.currentMonth]
        const prevMonthIndex = picker.currentMonth === 0 ? 11 : picker.currentMonth - 1
        const prevMonth = months[prevMonthIndex]

        cy.get('.qs-controls .qs-month').should('have.text', startingMonth)
        cy.get('.qs-controls .qs-left').click().then(() => {
          cy.get('.qs-controls .qs-month').should('have.text', prevMonth)
          expect(picker.currentMonthName).to.equal(prevMonth)
          expect(picker.currentMonth).to.equal(prevMonthIndex)
        })
      })
    })

    describe('Overlay', () => {
      it('should show the overlay when month/year is clicked', () => {
        cy.get('.qs-month-year').click()
        cy.get('.qs-overlay')
          .should('have.css', 'opacity', '1')
      })

      it('should have the correct default placeholder for the overlay input', () => {
        cy.get('.qs-overlay-year')
          .should('have.attr', 'placeholder', '4-digit year')
      })

      it('should have the correct default submit button text', () => {
        cy.get('.qs-submit')
          .should('have.text', 'Submit')
      })

      it('should change the year & hide the overlay when using the input & pressing enter', () => {
        cy.get('.qs-month-year .qs-year').then($year => {
          const currentYear = +$year.text()
          const nextYear = currentYear + 1

          expect(picker.currentYear).to.equal(currentYear)
          cy.get('.qs-overlay-year')
            .type(`${nextYear}{enter}`)
            .then(() => {
              cy.get('.qs-month-year .qs-year')
                .should('have.text', `${nextYear}`)

              // http://bit.ly/2r5CJo4 - This is a current workaround for `.should('be.visible')` on elements with 0 opacity.
              cy.get('.qs-overlay')
                .should('have.css', 'opacity', '0')
              expect(picker.currentYear).to.equal(nextYear)
            })
        })
      })

      it('should change the year & hide the overlay via the submit button', () => {
        cy.get('.qs-month-year .qs-year').click().then($year => {
          const currentYear = +$year.text()
          const nextYear = currentYear + 1

          expect(picker.currentYear).to.equal(currentYear)
          cy.get('.qs-overlay-year')
            .type(`${nextYear}`)
          cy.get('.qs-overlay .qs-submit')
            .click()
            .then(() => {
              cy.get('.qs-month-year .qs-year')
                .should('have.text', `${nextYear}`)
              cy.get('.qs-overlay')
                .should('have.css', 'opacity', '0')
              expect(picker.currentYear).to.equal(nextYear)
            })
        })
      })

      it('should change the month & hide the overlay when the user clicks a month', () => {
        cy.get('.qs-month-year .qs-month').then($month => {
          const currentMonthName = $month.text()
          const currentMonthIndex = months.findIndex(month => month === currentMonthName)
          const monthIndexToClick = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1
          const nextMonthName = months[monthIndexToClick]

          expect(picker.currentMonthName).to.equal(currentMonthName)
          cy.get('.qs-month-year').click()
          cy.get('.qs-overlay-month-container .qs-overlay-month')
            .eq(monthIndexToClick)
            .click()
            .then(() => {
              cy.get('.qs-month-year .qs-month')
                .should('have.text', nextMonthName)
              cy.get('.qs-overlay')
                .should('have.css', 'opacity', '0')
              expect(picker.currentMonthName).to.equal(nextMonthName)
            })
        })
      })

      it('should close the overlay when clicking the close button', () => {
        cy.get('.qs-month-year').click().then(() => {
          cy.get('.qs-overlay')
            .should('have.css', 'opacity', '1')
          cy.get('.qs-close').click().then(() => {
            cy.get('.qs-overlay')
            .should('have.css', 'opacity', '0')
          })
        })
      })
    })

    describe('Date changes', () => {
      const dayToSelect = 15

      describe('Selecting a date', () => {
        it('should populate `dateSelected` on the instance object with the correct date', () => {
          const correctDate = +new Date(picker.currentYear, picker.currentMonth, dayToSelect)

          cy.get(`span.qs-num:contains('${dayToSelect}')`).click().then(() => {
            expect(+picker.dateSelected).to.equal(correctDate)
          })
        })

        it('should populate the input field using the `toDateString` method (default)', () => {
          const dateString = picker.dateSelected.toDateString()

          cy.get('[data-cy="input-1"]')
            .should('have.value', dateString)
        })

        it('should hide the calendar', () => {
          cy.get('.qs-datepicker-container')
            .should('be.hidden')
        })

        it('should show the date selected highlighted when re-opening the calendar', () => {
          cy.get('[data-cy="input-1"]').click()
          cy.get('.qs-active')
            .should('have.length.of', 1)
            .should('have.text', `${dayToSelect}`)
        })
      })

      describe('De-selecting a date', () => {
        it('should have a value of undefined for `dateSelected` on the instance object', () => {
          expect(picker.dateSelected).not.to.be.undefined
          cy.get(`span.qs-num:contains('${dayToSelect}')`).click().then(() => {
            expect(picker.dateSelected).to.be.undefined
          })
        })

        it('should not hide the caledar', () => {
          cy.get('.qs-datepicker-container')
            .should('be.visible')
        })

        it('it should un-highlight the date on the calendar', () => {
          cy.get('.qs-active')
            .should('have.length.of', 0)
        })

        it('should clear the input value', () => {
          cy.get('[data-cy="input-1"]')
            .should('have.value', '')
        })
      })
    })
  })

  describe('Datepicker HTML structure and element types', () => {
    // Ensure the calendar is open before these tests - it should already be open, but just in case.
    before(() => cy.get('[data-cy="input-1"]').click())

    describe('Top-level containers', () => {
      it('should have a div top-level container', () => {
        cy.get('div.qs-datepicker-container')
          .should('have.length', 1)
          .children()
          .should('have.length', 1) // The calendar container.
      })

      it('should have a div calendar container', () => {
        cy.get('div.qs-datepicker')
          .should('exist')
          .should('have.length', 1)
          .children()
          .should('have.length', 3)
      })
    })

    describe('Controls', () => {
      it('should have a div for the controls', () => {
        cy.get('div.qs-controls')
          .should('have.length', 1)
          .children()
          .should('have.length', 3)
      })

      it('should have a div for the arrows', () => {
        cy.get('div.qs-controls div.qs-arrow')
          .should('have.length', 2)
        cy.get('div.qs-arrow')
          .should('have.length', 2)

        cy.get('div.qs-controls div.qs-arrow.qs-left')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('div.qs-arrow.qs-left')
          .should('have.length', 1)

        cy.get('div.qs-controls div.qs-arrow.qs-right')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('div.qs-arrow.qs-right')
          .should('have.length', 1)
      })

      it('should have a div for the month/year', () => {
        cy.get('div.qs-controls div.qs-month-year')
          .should('have.length', 1)
          .children()
          .should('have.length', 2)
      })

      it('should have spans for the month and year', () => {
        cy.get('div.qs-controls div.qs-month-year span.qs-month')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('span.qs-month')
          .should('have.length', 1)

        cy.get('div.qs-controls div.qs-month-year span.qs-year')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('span.qs-year')
          .should('have.length', 1)
      })
    })

    describe('Calendar days', () => {
      it('should have a div container for the days', () => {
        cy.get('div.qs-squares')
          .should('have.length', 1)
          .children()
          .its('length')
          .should('be.gte', 35)
          .should('be.lte', 49)
      })

      it('should have divs for the days', () => {
        cy.get('div.qs-squares div.qs-square')
          .its('length')
          .should('be.gte', 35)
          .should('be.lte', 49)
        cy.get('div.qs-square')
          .its('length')
          .should('be.gte', 35)
          .should('be.lte', 49)
      })

      it('should have 7 top-level divs for the days of the week', () => {
        cy.get('div.qs-square.qs-day')
          .should('have.length', 7)
      })

      it('only contains <span> children on the numbered days', () => {
        cy.get('div.qs-squares div.qs-square').each($square => {
          if ($square.hasClass('qs-num')) {
            expect($square.children().length).to.equal(1)
            expect($square.find('span.qs-num').length).to.equal(1)
          } else {
            expect($square.children().length).to.equal(0)
          }
        })
      })
    })

    describe('Overlay', () => {
      it('should have a div for the overlay container', () => {
        cy.get('div.qs-overlay')
          .should('have.length', 1)
      })

      it('should have a div container for the year input and close button', () => {
        cy.get('div.qs-overlay div')
          .first()
          .children()
          .should('have.length', 2)
      })

      it('should have a div for the close button', () => {
        cy.get('div.qs-close')
          .should('have.length', 1)
      })

      it('should have a div for the months container', () => {
        cy.get('div.qs-overlay-month-container')
          .should('have.length', 1)
      })

      it('should have 12 divs for the months with a span in each', () => {
        cy.get('.qs-overlay-month')
          .should('have.length', 12)
          .each($month => {
            expect($month.find('span').length).to.equal(1)
          })

        cy.get('span[data-month-num]')
          .should('have.length', 12)
      })

      it('should have a div for the submit button', () => {
        cy.get('div.qs-submit')
          .should('have.length', 1)
      })
    })
  })

  describe('Instance methods', () => {
    const dayToSelect = 23

    describe('setDate', () => {
      before(() => {
        cy.get('body').click()
        cy.wait(100)
        cy.get('[data-cy="input-1"]').click()
        cy.wait(100)

        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-active')
          .should('have.length', 0)
          .then(() => {
            picker.setDate(new Date(picker.currentYear, picker.currentMonth, dayToSelect))
          })
      })

      it('should programmatically set a date', () => {
        cy.get('.qs-active')
          .should('have.length', 1)
          .should('have.text', `${dayToSelect}`)
      })

      it('should populate the input with that date', () => {
        const expectedInputText = new Date(picker.currentYear, picker.currentMonth, dayToSelect).toDateString()
        cy.get('[data-cy="input-1"]')
          .should('have.value', expectedInputText)
      })

      it('should populate `dateSelected` on the instance object', () => {
        expect(+picker.dateSelected).to.equal(+new Date(picker.currentYear, picker.currentMonth, dayToSelect))
      })

      it('should navigate the calendar to that date via the second argument', () => {
        cy.get('.qs-active').click().then(() => {
          const { currentMonthName, currentYear, currentMonth } = picker
          const nextMonthIndex = currentMonth === 0 ? 1 : 0
          const nextMonthName = months[nextMonthIndex]
          const nextYear = currentYear + 1
          const nextDate = 20

          expect(picker.dateSelected).to.be.undefined

          cy.get('.qs-active')
            .should('have.length', 0)
          cy.get('.qs-month')
            .should('have.text', currentMonthName)
          cy.get('.qs-year')
            .should('have.text', `${currentYear}`)
            .then(() => {
              picker.setDate(new Date(nextYear, nextMonthIndex, nextDate), true)

              cy.get('.qs-month')
                .should('have.text', nextMonthName)
              cy.get('.qs-year')
                .should('have.text', `${nextYear}`)
              cy.get('[data-cy="input-1"]')
                .should('have.value', new Date(nextYear, nextMonthIndex, 20).toDateString())
              cy.get('.qs-active')
                .should('have.text', `${nextDate}`)
            })
        })
      })

      it('should remove the selected date when called with no argument', () => {
        picker.setDate()

        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-active')
          .should('have.length', 0)

      })
    })

    describe('setMin', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
        cy.get('.qs-active')
          .should('have.length', 0)
        expect(picker.minDate).to.be.undefined
      })

      it('should set the `minDate` property on the instance', () => {
        const minDate = new Date(picker.currentYear, picker.currentMonth, dayToSelect)

        picker.setMin(minDate)
        expect(+picker.minDate).to.equal(+minDate)
      })

      it('should disable dates prior to the provided value (including prev months)', () => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', dayToSelect - 1)

        cy.get('.qs-arrow.qs-left').click().then(() => {
          const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

          cy.get('.qs-square.qs-disabled')
            .should('have.length', numOfDaysInMonth)
        })
      })

      it('should prevent disabled dates from being selected', () => {
        expect(picker.dateSelected).to.be.undefined

        cy.get('.qs-square.qs-disabled')
          .first()
          .should('have.text', '1')
          .click()
          .then(() => {
            expect(picker.dateSelected).to.be.undefined

            cy.get('.qs-active')
              .should('have.length', 0)
          })
      })

      it('should remove the min selectable date when called with no argument', () => {
        picker.setMin()

        expect(picker.minDate).to.be.undefined
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
      })
    })

    describe('setMax', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
          .then(() => {
            expect(picker.maxDate).to.be.undefined
            picker.setMax(new Date(picker.currentYear, picker.currentMonth, 1))
          })
      })

      it('should set the `maxDate` property on the instnace', () => {
        expect(+picker.maxDate).to.equal(+new Date(picker.currentYear, picker.currentMonth, 1))
      })

      it('should disabled dates after the provided value (including future months)', () => {
        const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()
        const numOfDaysNextMonth = new Date(picker.currentYear, picker.currentMonth + 2, 0).getDate()

        cy.get('.qs-square.qs-disabled')
          .should('have.length', numOfDaysInMonth - 1)
        cy.get('.qs-arrow.qs-right').click().then(() => {
          cy.get('.qs-square.qs-disabled')
            .should('have.length', numOfDaysNextMonth)
        })
      })

      it('should prevent disabled dates from being selected', () => {
        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-square.qs-disabled')
          .first()
          .should('have.text', '1')
          .click()
          .then(() => {
            expect(picker.dateSelected).to.be.undefined
          })
      })

      it('should remove the max selectable date when called with no argument', () => {
        const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

        cy.get('.qs-square.qs-disabled')
          .should('have.length', numOfDaysInMonth)
          .then(() => {
            expect(picker.maxDate).not.to.be.undefined
            picker.setMax()
            expect(picker.maxDate).to.be.undefined
            cy.get('.qs-square.qs-disabled')
              .should('have.length', 0)
          })
      })
    })

    describe('show', () => {
      before(() => {
        cy.get('body').click()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })

      it('should show the calendar when called', () => {
        picker.show()
        cy.get('.qs-datepicker-container')
          .should('be.visible')
      })
    })

    describe('hide', () => {
      it('should hide the calendar when called', () => {
        picker.hide()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })
    })

    describe('remove', () => {
      before(() => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 1)
      })

      it('should completely nuke the instance object', () => {
        const originalNumOfProps = Object.keys(picker).length
        picker.remove()
        const numOfProps = Object.keys(picker).length

        expect(originalNumOfProps).to.be.gt(0)
        expect(numOfProps).to.equal(0)
      })

      it('should remove the calendar from the DOM', () => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 0)
      })
    })
  })
})
