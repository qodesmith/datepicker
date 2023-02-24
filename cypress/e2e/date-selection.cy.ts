import {Datepicker} from '../../src/types'
import {containers, days, testElementIds} from '../selectors'

describe('Date Selection', () => {
  let datepicker: Datepicker
  const startDate = new Date(2023, 1)
  const options = {startDate}

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should select a date', () => {
    const picker = datepicker(testElementIds.singleInput, options)
    const dayNum = 5
    const expectedDate = new Date(startDate)
    expectedDate.setDate(dayNum)

    cy.get(containers.calendarContainer).should('not.be.visible')
    cy.get(testElementIds.singleInput).click()
    cy.get(containers.calendarContainer).should('be.visible')
    cy.get(days.day)
      .contains(dayNum)
      .click()
      .then(() => {
        expect(picker.selectedDate).to.deep.equal(expectedDate)
      })
    cy.get(containers.calendarContainer).should('not.be.visible')
    cy.get(testElementIds.singleInput).click()
    cy.get(days.selectedDate)
      .should('be.visible')
      .should('have.length', 1)
      .should('have.text', dayNum)
  })

  it('should deselect a date', () => {
    const dayNum = 5
    const selectedDate = new Date(startDate)
    selectedDate.setDate(dayNum)
    const picker = datepicker(testElementIds.singleInput, {
      ...options,
      selectedDate,
    })

    expect(picker.selectedDate).to.deep.equal(selectedDate)
    cy.get(testElementIds.singleInput).click()
    cy.get(days.selectedDate).should('be.visible').should('have.length', 1)
    cy.get(days.day).contains(dayNum).click()
    cy.get(testElementIds.singleInput).click()
    cy.get(days.selectedDate)
      .should('have.length', 0)
      .then(() => {
        expect(picker.selectedDate).to.be.undefined
      })
  })

  describe('with input field', () => {
    it('should populate the input field with the selected date', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get(testElementIds.singleInput).should('have.value', '').click()
      cy.get(days.day).contains(1).click()
      cy.get(testElementIds.singleInput).should(
        'have.value',
        startDate.toDateString()
      )
    })

    it('should clear the input field when deselecting a date', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      cy.get(testElementIds.singleInput).should(
        'have.value',
        startDate.toDateString()
      )
      cy.get(testElementIds.singleInput).click()
      cy.get(days.day).contains(1).click()
      cy.get(testElementIds.singleInput).should('have.value', '').click()
    })
  })
})
