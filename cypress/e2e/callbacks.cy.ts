import {Datepicker, DatepickerOptions} from '../../src/types'
import {days, testElements} from '../selectors'

describe('Callbacks', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  describe('onSelect', () => {
    const startDate = new Date(2023, 1)
    const options: DatepickerOptions = {
      onSelect() {},
      alwaysShow: true,
      startDate,
    }

    beforeEach(() => {
      cy.spy(options, 'onSelect').as('onSelect')
    })

    it('should be called after a date has been selected (and also after deselecting)', () => {
      const picker = datepicker(testElements.singleInput, options)

      expect(options.onSelect).not.to.be.called

      cy.get(days.day).first().click()
      cy.get('@onSelect')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          newDate: startDate,
          prevDate: undefined,
          trigger: 'click',
          triggerType: 'user',
        })

      cy.get(days.day).first().click()
      cy.get('@onSelect')
        .should('have.been.calledTwice')
        .should('have.been.calledWith', {
          instance: picker,
          newDate: undefined,
          prevDate: startDate,
          trigger: 'click',
          triggerType: 'user',
        })
    })

    it('should be called after deselecting a date', () => {
      const picker = datepicker(testElements.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      expect(options.onSelect).not.to.be.called

      cy.get(days.day).first().click()
      cy.get('@onSelect')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          newDate: undefined,
          prevDate: startDate,
          trigger: 'click',
          triggerType: 'user',
        })
    })

    it('should be called after running the `selectDate` method', () => {
      const picker = datepicker(testElements.singleInput, options)

      expect(options.onSelect).not.to.be.called

      picker.selectDate({date: startDate})
      cy.get('@onSelect')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          newDate: startDate,
          prevDate: undefined,
          trigger: 'selectDate',
          triggerType: 'imperative',
        })
    })

    it('should be called after running the `setMin` method (if dates conflict)', () => {
      const picker = datepicker(testElements.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      expect(options.onSelect).not.to.be.called

      const unaffectedMinDate = new Date(startDate)
      unaffectedMinDate.setDate(unaffectedMinDate.getDate() - 1)
      const minDate = new Date(startDate)
      minDate.setDate(minDate.getDate() + 1)

      picker.setMin({date: unaffectedMinDate})
      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          picker.setMin({date: minDate})
        })

      cy.get('@onSelect')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          newDate: undefined,
          prevDate: startDate,
          trigger: 'setMin',
          triggerType: 'imperative',
        })
    })

    it('should be called after running the `setMax` method (if dates conflict)', () => {
      const picker = datepicker(testElements.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      expect(options.onSelect).not.to.be.called

      const unaffectedMaxDate = new Date(startDate)
      unaffectedMaxDate.setDate(unaffectedMaxDate.getDate() + 1)
      const maxDate = new Date(startDate)
      maxDate.setDate(maxDate.getDate() - 1)

      picker.setMax({date: unaffectedMaxDate})
      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          picker.setMax({date: maxDate})
        })

      cy.get('@onSelect')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          newDate: undefined,
          prevDate: startDate,
          trigger: 'setMax',
          triggerType: 'imperative',
        })
    })
  })
})
