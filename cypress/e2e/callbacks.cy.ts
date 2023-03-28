import {Datepicker, DatepickerOptions} from '../../src/types'
import {days, testElementIds, controls, containers} from '../selectors'

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
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get('@onSelect').should('not.have.been.called')
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
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      cy.get('@onSelect').should('not.have.been.called')
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

    it('should be called after calling the `selectDate` method', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          picker.selectDate(startDate)
        })
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

    it('should be called after calling the `setMin` method (if dates conflict)', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          const unaffectedMinDate = new Date(startDate)
          unaffectedMinDate.setDate(unaffectedMinDate.getDate() - 1)
          picker.setMin({date: unaffectedMinDate})
        })

      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          const minDate = new Date(startDate)
          minDate.setDate(minDate.getDate() + 1)
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

    it('should be called after calling the `setMax` method (if dates conflict)', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          const unaffectedMaxDate = new Date(startDate)
          unaffectedMaxDate.setDate(unaffectedMaxDate.getDate() + 1)
          picker.setMax({date: unaffectedMaxDate})
        })

      cy.get('@onSelect')
        .should('not.have.been.called')
        .then(() => {
          const maxDate = new Date(startDate)
          maxDate.setDate(maxDate.getDate() - 1)
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

  describe('onMonthChange', () => {
    const startDate = new Date(2023, 1)
    const options: DatepickerOptions = {
      onMonthChange() {},
      alwaysShow: true,
      startDate,
    }

    beforeEach(() => {
      cy.spy(options, 'onMonthChange').as('onMonthChange')
    })

    it('should be called when clicking the arrow buttons', () => {
      const picker = datepicker(testElementIds.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setMonth(newDate.getMonth() - 1)

      cy.get('@onMonthChange').should('not.have.been.called')
      cy.get(controls.leftArrow).click()
      cy.get('@onMonthChange')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'click',
          triggerType: 'user',
          prevDate: startDate,
          newDate,
        })

      cy.get(controls.rightArrow).click()
      cy.get('@onMonthChange')
        .should('have.been.calledTwice')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'click',
          triggerType: 'user',
          prevDate: newDate,
          newDate: startDate,
        })
    })

    it('should be called after running the `navigate` method', () => {
      const picker = datepicker(testElementIds.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setFullYear(newDate.getFullYear() + 1)

      cy.get('@onMonthChange')
        .should('not.have.been.called')
        .then(() => {
          picker.navigate(newDate)
        })

      cy.get('@onMonthChange')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'navigate',
          triggerType: 'imperative',
          prevDate: startDate,
          newDate,
        })
    })

    it('should be called after running `selectDate` with `changeCalendar: true`', () => {
      const picker = datepicker(testElementIds.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setFullYear(newDate.getFullYear() + 1)

      cy.get('@onMonthChange')
        .should('not.have.been.called')
        .then(() => {
          picker.selectDate(newDate, true)
        })

      cy.get('@onMonthChange')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'selectDate',
          triggerType: 'imperative',
          prevDate: startDate,
          newDate,
        })
    })

    it('should not be called after running `selectDate` with `changeCalendar: false`', () => {
      const picker = datepicker(testElementIds.singleInput, options)
      const newDate = new Date(startDate)
      newDate.setFullYear(newDate.getFullYear() + 1)

      cy.get('@onMonthChange')
        .should('not.have.been.called')
        .then(() => {
          picker.selectDate(newDate, false)
        })

      cy.get('@onMonthChange').should('not.have.been.called')
    })

    it('should not be called after running `selectDate` with `changeCalendar: true` and no date', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      picker.selectDate(undefined, true)
      cy.get('@onMonthChange').should('not.have.been.called')
    })
  })

  describe('onShow', () => {
    const options: DatepickerOptions = {onShow() {}}

    beforeEach(() => {
      cy.spy(options, 'onShow').as('onShow')
    })

    it('should be called when the input is clicked', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get('@onShow').should('not.have.been.called')
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get('@onShow')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'click',
          triggerType: 'user',
        })
    })

    it('should be called when the `show` method is called', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get('@onShow').should('not.have.been.called')
      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.show()
        })

      cy.get('@onShow')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'show',
          triggerType: 'imperative',
        })
    })
  })

  describe('onHide', () => {
    const options: DatepickerOptions = {onHide() {}}

    beforeEach(() => {
      cy.spy(options, 'onHide').as('onHide')
    })

    it('should be called when a click happens outside the input', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get('@onHide').should('not.have.been.called')
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(testElementIds.unfocus).click()
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get('@onHide')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'click',
          triggerType: 'user',
        })
    })

    it('should be called when the `hide` method is called', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get('@onHide').should('not.have.been.called')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer)
        .should('be.visible')
        .then(() => {
          picker.hide()
        })

      cy.get('@onHide')
        .should('have.been.calledOnce')
        .should('have.been.calledWith', {
          instance: picker,
          trigger: 'hide',
          triggerType: 'imperative',
        })
    })
  })
})
