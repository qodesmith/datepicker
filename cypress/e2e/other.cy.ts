import {Datepicker} from '../../src/types'
import {days, daysCls, testElementIds} from '../selectors'

describe('Other Tests', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  // TODO - refactor tests to only check for disabled class, not having to test for clicks.
  it('should ignore clicks on days with the disabled date class', () => {
    const startDate = new Date(2023, 2)
    const picker = datepicker(testElementIds.singleInput, {
      alwaysShow: true,
      startDate,
    })

    // Arbitrarily add it to a single day.
    cy.get(days.displayedDays)
      .contains('6')
      .should('not.have.class', daysCls.disabledDate)
      .then($day => {
        expect(picker.selectedDate).to.be.undefined
        $day.addClass(daysCls.disabledDate)
      })
      .should('have.class', daysCls.disabledDate)
      .click()
      .then(() => {
        expect(picker.selectedDate).to.be.undefined
      })
      .then($day => {
        $day.removeClass(daysCls.disabledDate)
      })
      .should('not.have.class', daysCls.disabledDate)
      .click()
      .then(() => {
        expect(picker.selectedDate).to.deep.equal(new Date(2023, 2, 6))
      })
  })

  it('should only add an event listener on the document once', () => {
    cy.document()
      .then(doc => {
        cy.spy(doc, 'addEventListener').as('globalListener')
      })
      .then(() => {
        datepicker(testElementIds.singleInput)
        datepicker(testElementIds.singleStandalone)
      })

    cy.get('@globalListener').should('have.been.calledOnce')
  })
})
