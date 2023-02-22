import type {Datepicker, DaterangePickerOptions} from '../../src/types'
import {containers, testElementIds} from '../selectors'

describe('Attaching to the DOM', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should have datepicker available on the window for the test environment', () => {
    expect(typeof datepicker).to.equal('function')
  })

  describe('single calendar', () => {
    it('should attach datepicker to an input', () => {
      datepicker(testElementIds.singleInput)
      cy.get(containers.calendarContainer).should('have.length', 1)
      cy.get(
        `${testElementIds.inputSection} ${containers.calendarContainer}`
      ).should('exist')
    })

    it('should attach a datepicker to a non-input DOM element', () => {
      datepicker(testElementIds.singleStandalone)
      cy.get(containers.calendarContainer).should('have.length', 1)
      cy.get(
        `${testElementIds.singleStandalone} ${containers.calendarContainer}`
      ).should('exist')
    })
  })

  describe('daterange', () => {
    it('should attached to inputs', () => {
      const options: DaterangePickerOptions = {id: 1}
      datepicker(testElementIds.rangeInputStart, options)
      datepicker(testElementIds.rangeInputEnd, options)

      cy.get(containers.calendarContainer).should('have.length', 2)
      cy.get(
        `${testElementIds.rangeInputSection} ${containers.calendarContainer}`
      ).should('have.length', 2)
    })

    it('should attach to a non-input DOM elements', () => {
      const options: DaterangePickerOptions = {id: 1, alwaysShow: true}
      datepicker(testElementIds.rangeStandalone1, options)
      datepicker(testElementIds.rangeStandalone2, options)

      cy.get(containers.calendarContainer).should('have.length', 2)
      cy.get(
        `${testElementIds.rangeStandaloneSection} ${containers.calendarContainer}`
      ).should('have.length', 2)
    })
  })
})
