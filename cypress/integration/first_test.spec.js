function howManyDays(datepickerInstance) {
  return new Date(
    datepickerInstance.currentYear, // Year.
    datepickerInstance.currentMonth + 1, // Month + 1.
    0 // 0 sets it back to the last day of the previous month.
  ).getDate()
}

describe('Initial calendar load ewith default settings', () => {
  before(() => {
    cy.visit('http://localhost:9001')
    cy.window().then(x => console.log(x.testDatepicker))
  })

  describe('Top-level containers', () => {
    it('has two main containers', () => {
      // Outer container.
      cy.get('div.qs-datepicker-container')
        .should('be.visible')

      // Inner container
      cy.get('div.qs-datepicker')
        .should('be.visible')
    })
  })

  describe('Controls', () => {
    it('has a top-level container', () => {
      cy.get('div.qs-controls')
        .should('be.visible')
    })

    it('has a container for the month & year', () => {
      cy.get('div.qs-controls div.qs-month-year')
        .should('be.visible')
    })

    it('has a month and year', () => {
      // Month.
      cy.get('div.qs-controls div.qs-month-year span.qs-month')
        .should('be.visible')

      // Year.
      cy.get('div.qs-controls div.qs-month-year span.qs-year')
        .should('be.visible')
    })

    it('has two arrows for navigating months', () => {
      cy.get('div.qs-controls div.qs-arrow')
        .should('have.length', 2)

      // Left arrow.
      cy.get('div.qs-controls div.qs-arrow.qs-left')
        .should('be.visible')

      // Right arrow.
      cy.get('div.qs-controls div.qs-arrow.qs-right')
        .should('be.visible')
    })
  })

  describe('Calendar days', () => {
    it('shows the calendar days of the week', () => {
      cy.get('div.qs-squares div.qs-day')
        .should('have.length', 7)
    })

    it('shows the calendar days', () => {
      cy.get('div.qs-squares div.qs-num')
        .should('have.length.of.at.least', 28)
    })

    it('has the correct number of days on the calendar', () => {
      cy.window().then(win => {
        const numOfDays = howManyDays(win.testDatepicker)

        ;['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
          cy.get(`div.qs-squares div.qs-num.${day}`)
            .should('have.length.of.at.least', 4)

          cy.get(`div.qs-squares div.qs-num.${day}`)
            .should('have.length.of.at.most', 5)
        })

        cy.get('div.qs-square.qs-num:not(.qs-empty)')
          .should('have.length', numOfDays)
      })
    })
  })

  it(`doesn't show the overlay`, () => {
    // http://bit.ly/2r5CJo4 - This is a current workaround for `.should('be.visible')` on elements with 0 opacity.
    cy.get('.qs-overlay')
      .should('have.css', 'opacity', '0')
  })
})
