import {Datepicker} from '../../src/types'
import {days, testElementIds} from '../selectors'

describe('Options', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  describe('formatter', () => {
    const startDate = new Date(2023, 1)
    const dayNum = 5

    it('should sanitize the input field value when selecting a date', () => {
      const picker = datepicker(testElementIds.singleInput, {
        startDate,
        alwaysShow: true,
        formatter(date) {
          return `Year: ${date.getFullYear()} Month: ${date.getMonth()} Day: ${date.getDate()}`
        },
      })

      cy.get(testElementIds.singleInput).should('have.value', '')
      cy.get(days.day).contains(dayNum).click()
      cy.get(testElementIds.singleInput).should(
        'have.value',
        `Year: 2023 Month: 1 Day: ${dayNum}`
      )
    })

    it('should default to calling `date.toDateString()` if no formatter is provided', () => {
      const expectedDate = new Date(startDate)
      expectedDate.setDate(dayNum)
      const picker = datepicker(testElementIds.singleInput, {
        startDate,
        alwaysShow: true,
      })

      cy.get(testElementIds.singleInput).should('have.value', '')
      cy.get(days.day).contains(dayNum).click()
      cy.get(testElementIds.singleInput).should(
        'have.value',
        expectedDate.toDateString()
      )
    })
  })
})
