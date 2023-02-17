import {Datepicker} from '../../src/types'
import {containers, controls, days, testElements} from '../selectors'

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

  describe('navigate', () => {
    it('should navigate the calendar to a new date (not select it)', () => {
      const startDate = new Date(2023, 1)
      const picker = datepicker(testElements.singleInput, {
        alwaysShow: true,
        startDate,
      })

      cy.get(controls.monthName).should('have.text', 'February')
      cy.get(controls.year)
        .should('have.text', '2023')
        .then(() => {
          picker.navigate({date: new Date(2024, 0)})
        })
      cy.get(controls.monthName).should('have.text', 'January')
      cy.get(controls.year)
        .should('have.text', '2024')
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
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
          expect(picker.navigate).to.throw(
            "Unable to run a function from a picker that's already removed."
          )
        })
    })
  })

  describe('selectDate', () => {
    const startDate = new Date(2023, 1)
    const options = {startDate, alwaysShow: true}

    it('should select a date on the calendar and set `selectedDate` on the picker', () => {
      const picker = datepicker(testElements.singleInput, options)
      const dateToSelect = new Date(startDate)
      dateToSelect.setDate(5)

      expect(picker.selectedDate).to.be.undefined

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          picker.selectDate({date: dateToSelect})
          expect(picker.selectedDate).to.deep.equal(dateToSelect)
        })

      cy.get(days.selectedDate)
        .should('have.length', 1)
        .should('have.text', '5')
    })

    it('should not select a date below `minDate`', () => {
      const minDate = new Date(startDate)
      minDate.setDate(5)
      const picker = datepicker(testElements.singleInput, {...options, minDate})

      expect(picker.selectedDate).to.be.undefined

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          picker.selectDate({date: startDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })

    it('should not select a date above `maxDate`', () => {
      const maxDate = new Date(startDate)
      maxDate.setMonth(maxDate.getMonth() - 1)
      const picker = datepicker(testElements.singleInput, {...options, maxDate})

      expect(picker.selectedDate).to.be.undefined

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          picker.selectDate({date: startDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })

    it('should not select a date that is disabled', () => {
      const disabledDate = new Date(startDate)
      disabledDate.setDate(disabledDate.getDate() + 1)
      const picker = datepicker(testElements.singleInput, {
        ...options,
        disabledDates: [startDate, disabledDate],
      })

      expect(picker.selectedDate).to.be.undefined

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          picker.selectDate({date: startDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
          picker.selectDate({date: disabledDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })

    it('should not change the calender by default', () => {
      const picker = datepicker(testElements.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setMonth(newDate.getMonth() - 2)

      expect(picker.selectedDate).to.be.undefined

      cy.get(controls.monthName).should('have.text', 'February')
      cy.get(controls.year)
        .should('have.text', '2023')
        .then(() => {
          picker.selectDate({date: newDate})
          expect(picker.selectedDate).to.deep.equal(newDate)
        })

      cy.get(controls.monthName).should('have.text', 'February')
      cy.get(controls.year).should('have.text', '2023')
    })

    it('should change the calender with `changeCalendar: true`', () => {
      const picker = datepicker(testElements.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setMonth(newDate.getMonth() - 2)

      expect(picker.selectedDate).to.be.undefined

      cy.get(controls.monthName).should('have.text', 'February')
      cy.get(controls.year)
        .should('have.text', '2023')
        .then(() => {
          picker.selectDate({date: newDate, changeCalendar: true})
          expect(picker.selectedDate).to.deep.equal(newDate)
        })

      cy.get(controls.monthName).should('have.text', 'December')
      cy.get(controls.year).should('have.text', '2022')
    })

    it('should select a date outside of the current month', () => {
      const picker = datepicker(testElements.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setMonth(newDate.getMonth() - 2)

      expect(picker.selectedDate).to.be.undefined

      cy.get(controls.monthName).should('have.text', 'February')
      cy.get(controls.year)
        .should('have.text', '2023')
        .then(() => {
          picker.selectDate({date: newDate})
          expect(picker.selectedDate).to.deep.equal(newDate)
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          picker.navigate({date: newDate})
        })

      cy.get(controls.monthName).should('have.text', 'December')
      cy.get(controls.year).should('have.text', '2022')
      cy.get(days.selectedDate).should('have.length', 1)
    })
  })

  describe('setMin', () => {})
  describe('setMax', () => {})
  describe('show', () => {})
  describe('hide', () => {})
  describe('toggleCalendar', () => {})
  describe('toggleOverlay', () => {})
})
