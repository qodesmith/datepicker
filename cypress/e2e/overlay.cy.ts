import {Datepicker} from '../../src/types'
import {
  containers,
  controls,
  other,
  overlay,
  testElementIds,
} from '../selectors'

describe('Overlay', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should open when you click the month or year', () => {
    const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

    cy.get(containers.overlayContainer).should('not.be.visible')
    cy.get(controls.monthName).click()
    cy.get(containers.overlayContainer).should('be.visible')
  })

  it('should auto-focus the input when opened', () => {
    const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

    cy.get(controls.monthName).click()
    cy.get(overlay.input).should('be.focused')
  })

  it('should close when you hit escape in the input field', () => {
    const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

    cy.get(controls.monthName).click()
    cy.get(containers.overlayContainer).should('be.visible')
    cy.get(overlay.input).should('be.focused')
    cy.get('body').type('{esc}') // Simulate the user pressing escape.
    cy.get(containers.overlayContainer).should('not.be.visible')
  })

  it('should not close when you hit escape while the input is not focused', () => {
    const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

    cy.get(controls.monthName).click()
    cy.get(containers.overlayContainer).should('be.visible')
    cy.get(other.blur).click() // Remove the focus from the overlay input.
    cy.get(overlay.input).should('not.be.focused')
    cy.get('body').type('{esc}') // Simulate the user pressing escape.
    cy.get(containers.overlayContainer).should('be.visible')
  })

  it('should close when the overlay close button is clicked', () => {
    const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

    cy.get(controls.monthName).click()
    cy.get(containers.overlayContainer).should('be.visible')
    cy.get(overlay.close).click()
    cy.get(containers.overlayContainer).should('not.be.visible')
  })

  it('should navigate to a year and close the overlay when typing a year and pressing enter', () => {
    const startDate = new Date()
    const nextYear = startDate.getFullYear() + 1
    const picker = datepicker(testElementIds.singleInput, {
      alwaysShow: true,
      startDate,
    })

    cy.get(controls.year).should('have.text', `${startDate.getFullYear()}`)
    cy.get(controls.monthName).click()
    cy.get(overlay.input).type(`${nextYear}`).type('{enter}')
    cy.get(containers.overlayContainer).should('not.be.visible')
    cy.get(controls.year)
      .should('have.text', `${nextYear}`)
      .then(() => {
        expect(picker.currentDate.getFullYear()).to.equal(nextYear)
      })
  })

  it('should navigate to a year and close the overlay when typing a year and pressing the submit button', () => {
    const startDate = new Date()
    const nextYear = startDate.getFullYear() + 1
    const picker = datepicker(testElementIds.singleInput, {
      alwaysShow: true,
      startDate,
    })

    cy.get(controls.year).should('have.text', `${startDate.getFullYear()}`)
    cy.get(controls.monthName).click()
    cy.get(overlay.input).type(`${nextYear}`)
    cy.get(overlay.submit).click()
    cy.get(containers.overlayContainer).should('not.be.visible')
    cy.get(controls.year)
      .should('have.text', `${nextYear}`)
      .then(() => {
        expect(picker.currentDate.getFullYear()).to.equal(nextYear)
      })
  })

  it('should navigate to a new month and close the overlay when a month is clicked', () => {
    const startDate = new Date(2023, 3) // April
    const expectedDate = new Date(2023, 4) // May
    const picker = datepicker(testElementIds.singleInput, {
      alwaysShow: true,
      startDate,
    })

    cy.get(controls.monthName).should('have.text', 'April')
    cy.get(controls.monthName).click()
    cy.get(overlay.month).contains('May').click()
    cy.get(containers.overlayContainer).should('not.be.visible')
    cy.get(controls.monthName)
      .should('have.text', 'May')
      .then(() => {
        expect(picker.currentDate).to.deep.equal(expectedDate)
      })
  })

  it('should navigate to a new year and month and close the overlay when a year is inputted and a month is clicked', () => {
    const startDate = new Date(2023, 3) // April, 2023
    const expectedDate = new Date(2024, 4) // May, 2024
    const picker = datepicker(testElementIds.singleInput, {
      alwaysShow: true,
      startDate,
    })

    cy.get(controls.monthName).should('have.text', 'April')
    cy.get(controls.year).should('have.text', '2023')
    cy.get(controls.monthName).click()
    cy.get(overlay.input).type('2024')
    cy.get(overlay.month).contains('May').click()
    cy.get(containers.overlayContainer).should('not.be.visible')
    cy.get(controls.monthName).should('have.text', 'May')
    cy.get(controls.year)
      .should('have.text', '2024')
      .then(() => {
        expect(picker.currentDate).to.deep.equal(expectedDate)
      })
  })
})
