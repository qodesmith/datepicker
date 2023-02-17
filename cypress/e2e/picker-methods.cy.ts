import {Datepicker} from '../../src/types'
import {containers, testElements} from '../selectors'

describe('Picker Methods', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  describe('remove', () => {
    it('should remove the calendar from the DOM', () => {
      const picker = datepicker(testElements.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElements.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.remove).to.throw(
            "Unable to run a function from a picker that's already removed."
          )
        })
    })

    it('should call `removeEventListener` on the provided element`', () => {
      const picker = datepicker(testElements.singleInput)

      cy.get(testElements.singleInput).then(el => {
        cy.spy(el[0], 'removeEventListener').as('removeEventListener')
      })
      cy.get('@removeEventListener')
        .should('not.have.been.called')
        .then(() => {
          picker.remove()
        })
        .should('have.been.called')
    })

    it('should call `document.removeEventListener` twice after removing the last picker', () => {
      const picker1 = datepicker(testElements.singleInput)
      const picker2 = datepicker(testElements.singleStandalone)

      cy.document().then(doc => {
        cy.spy(doc, 'removeEventListener').as('removeEventListener')
      })
      cy.get('@removeEventListener')
        .should('not.have.been.called')
        .then(() => {
          picker1.remove()
        })
        .should('not.have.been.called')
        .then(() => {
          picker2.remove()
        })
        .should('have.been.calledTwice')
    })
  })
})
