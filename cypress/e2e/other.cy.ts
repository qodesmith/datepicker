import {Datepicker} from '../../src/types'
import {testElements} from '../selectors'

describe('Other Tests', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should only add an event listener on the document once', () => {
    cy.document()
      .then(doc => {
        cy.spy(doc, 'addEventListener').as('globalListener')
      })
      .then(() => {
        datepicker(testElements.singleInput)
        datepicker(testElements.singleStandalone)
      })

    cy.get('@globalListener').should('have.been.calledOnce')
  })
})
