import {
  Datepicker,
  DatepickerOptions,
  DaterangePickerOptions,
} from '../../src/types'
import {
  testElementIds,
  containers,
  containersCls,
  controlsCls,
  daysCls,
  overlayCls,
} from '../selectors'

describe('Calendar DOM Structure', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should have the correct DOM structure', () => {
    const options: DatepickerOptions = {startDate: new Date(2023, 1, 15)}
    const singlePicker = datepicker(testElementIds.singleInput, options)
    const rangeOptions: DaterangePickerOptions = {...options, id: 1}
    const rangePicker1 = datepicker(
      testElementIds.rangeInputStart,
      rangeOptions
    )
    const rangePicker2 = datepicker(testElementIds.rangeInputEnd, rangeOptions)
    const pickers = [singlePicker, rangePicker1, rangePicker2]

    cy.get(containers.calendarContainer).should('have.length', 3)

    pickers.forEach(({calendarContainer}) => {
      /**
       * 🚨 - you cannot reuse cy.wrap values. Just wrap it again.
       * ❌ const wrappedContainer = cy.wrap(calendarContainer)
       */

      ////////////////////
      // TOP CONTAINERS //
      ////////////////////

      cy.wrap(calendarContainer)
        .children()
        .should('have.length', 4)
        .first()
        .should('have.class', containersCls.controlsContainer)
        .next()
        .should('have.class', containersCls.weekdaysContainer)
        .next()
        .should('have.class', containersCls.daysContainer)
        .next()
        .should('have.class', containersCls.overlayContainer)

      //////////////
      // CONTROLS //
      //////////////

      cy.wrap(calendarContainer)
        .find(containers.controlsContainer)
        .children()
        .should('have.length', 3)
        .first()
        .should('have.class', controlsCls.leftArrow)
        .next()
        .should('have.class', containersCls.monthYearContainer)
        .next()
        .should('have.class', controlsCls.rightArrow)

      cy.wrap(calendarContainer)
        .find(containers.monthYearContainer)
        .children()
        .should('have.length', 2)
        .first()
        .should('have.class', controlsCls.monthName)
        .should('have.text', 'February')
        .next()
        .should('have.class', controlsCls.year)
        .should('have.text', '2023')

      //////////////
      // WEEKDAYS //
      //////////////

      cy.wrap(calendarContainer)
        .find(containers.weekdaysContainer)
        .children()
        .should('have.length', 7)
        .first()
        .should('have.text', 'Sun')
        .next()
        .should('have.text', 'Mon')
        .next()
        .should('have.text', 'Tue')
        .next()
        .should('have.text', 'Wed')
        .next()
        .should('have.text', 'Thu')
        .next()
        .should('have.text', 'Fri')
        .next()
        .should('have.text', 'Sat')

      //////////
      // DAYS //
      //////////
      cy.wrap(calendarContainer)
        .find(containers.daysContainer)
        .children()
        .should('have.length', 31)
        .should('have.class', daysCls.day)

      /////////////
      // OVERLAY //
      /////////////
      cy.wrap(calendarContainer)
        .find(containers.overlayContainer)
        .children()
        .should('have.length', 3)
        .first()
        .should('have.class', containersCls.overlayInputContainer)
        .next()
        .should('have.class', containersCls.overlayMonthsContainer)
        .next()
        .should('have.class', overlayCls.submit)

      cy.wrap(calendarContainer)
        .find(containers.overlayInputContainer)
        .children()
        .should('have.length', 2)
        .first()
        .should('have.class', overlayCls.input)
        .then($el => {
          expect($el[0].tagName).to.equal('INPUT')
        })
        .next()
        .should('have.class', overlayCls.close)

      cy.wrap(calendarContainer)
        .find(containers.overlayMonthsContainer)
        .children()
        .should('have.length', 12)
        .should('have.class', overlayCls.month)
        .first()
        .should('have.attr', 'data-num', '0')
        .should('have.text', 'Jan')
        .next()
        .should('have.attr', 'data-num', '1')
        .should('have.text', 'Feb')
        .next()
        .should('have.attr', 'data-num', '2')
        .should('have.text', 'Mar')
        .next()
        .should('have.attr', 'data-num', '3')
        .should('have.text', 'Apr')
        .next()
        .should('have.attr', 'data-num', '4')
        .should('have.text', 'May')
        .next()
        .should('have.attr', 'data-num', '5')
        .should('have.text', 'Jun')
        .next()
        .should('have.attr', 'data-num', '6')
        .should('have.text', 'Jul')
        .next()
        .should('have.attr', 'data-num', '7')
        .should('have.text', 'Aug')
        .next()
        .should('have.attr', 'data-num', '8')
        .should('have.text', 'Sep')
        .next()
        .should('have.attr', 'data-num', '9')
        .should('have.text', 'Oct')
        .next()
        .should('have.attr', 'data-num', '10')
        .should('have.text', 'Nov')
        .next()
        .should('have.attr', 'data-num', '11')
        .should('have.text', 'Dec')
    })
  })
})
