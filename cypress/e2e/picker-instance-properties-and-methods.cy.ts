import {Datepicker} from '../../src/types'
import {containers, controls, days, overlay, testElementIds} from '../selectors'

describe('Picker Instance Properties', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should have the correct set of properties', () => {
    const picker = datepicker(testElementIds.singleInput, {
      selectedDate: new Date(),
    })
    const expectedPropertiesData = [
      {propertyName: 'calendarContainer', type: '[object HTMLDivElement]'},
      {propertyName: 'currentDate', type: '[object Date]'},
      {propertyName: 'selectedDate', type: '[object Date]'},
      {propertyName: 'remove', type: '[object Function]'},
      {propertyName: 'navigate', type: '[object Function]'},
      {propertyName: 'selectDate', type: '[object Function]'},
      {propertyName: 'setMin', type: '[object Function]'},
      {propertyName: 'setMax', type: '[object Function]'},
      {propertyName: 'show', type: '[object Function]'},
      {propertyName: 'hide', type: '[object Function]'},
      {propertyName: 'toggleCalendar', type: '[object Function]'},
      {propertyName: 'toggleOverlay', type: '[object Function]'},
    ]
    const expectedPropertyNames = expectedPropertiesData.map(
      ({propertyName}) => propertyName
    )

    expect(Object.keys(picker)).to.have.members(expectedPropertyNames)

    expectedPropertiesData.forEach(({propertyName, type}) => {
      const property = picker[propertyName]
      expect({}.toString.call(property)).to.equal(type)
    })
  })

  describe('After being removed', () => {
    it('should throw if trying to access one of the properties (non-methods)', () => {
      const propertyNames = ['calendarContainer', 'currentDate', 'selectedDate']
      const picker = datepicker(testElementIds.singleInput)

      propertyNames.forEach(prop => {
        expect(() => picker[prop]).not.to.throw
      })

      picker.remove()

      propertyNames.forEach(prop => {
        expect(() => picker[prop]).to.throw(
          "Unable to run a function or access properties from a picker that's already removed."
        )
      })
    })
  })

  describe('calendarContainer', () => {
    it('should have a `calendarcontainer` property matching the element found in the DOM', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer).then($el => {
        expect($el[0]).to.equal(picker.calendarContainer)
      })
    })
  })

  describe('currentDate', () => {
    it('should match the month and year of the initialized date', () => {
      const startDate = new Date(2023, 2, 25)
      const expectedCurrentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      )
      const picker = datepicker(testElementIds.singleInput, {startDate})

      expect(picker.currentDate).to.deep.equal(expectedCurrentDate)
    })
  })

  describe('selectedDate', () => {
    it('should be undefined when starting a vanilla calendar', () => {
      const picker = datepicker(testElementIds.singleInput)
      expect(picker.selectedDate).to.be.undefined
    })

    it('should match the `selectedDate` initialization option', () => {
      const selectedDate = new Date(2023, 2, 25)
      const picker = datepicker(testElementIds.singleInput, {selectedDate})

      expect(picker.selectedDate).to.deep.equal(selectedDate)
    })
  })

  describe('remove', () => {
    it('should remove the calendar from the DOM', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.remove).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })

    it('should call `removeEventListener` on a number of elements', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.document().then(doc => {
        cy.spy(doc, 'removeEventListener').as('globalListener')
      })
      cy.get(testElementIds.singleInput).then(el => {
        cy.spy(el[0], 'removeEventListener').as('inputClickListener')
      })
      cy.get(controls.leftArrow).then(el => {
        cy.spy(el[0], 'removeEventListener').as('leftArrowListener')
      })
      cy.get(controls.rightArrow).then(el => {
        cy.spy(el[0], 'removeEventListener').as('rightArrowListener')
      })
      cy.get(containers.monthYearContainer).then(el => {
        cy.spy(el[0], 'removeEventListener').as('monthYearListener')
      })
      cy.get(containers.daysContainer).then(el => {
        cy.spy(el[0], 'removeEventListener').as('daysContainerListener')
      })
      cy.get(containers.overlayMonthsContainer).then(el => {
        cy.spy(el[0], 'removeEventListener').as('monthsContainerListener')
      })
      cy.get(overlay.close).then(el => {
        cy.spy(el[0], 'removeEventListener').as('overlayCloseListner')
      })
      cy.get(overlay.submit).then(el => {
        cy.spy(el[0], 'removeEventListener').as('overlaySubmitListener')
      })
      cy.get(overlay.input)
        .then(el => {
          cy.spy(el[0], 'removeEventListener').as('overlayInputOnInputListener')
        })
        .then(() => {
          picker.remove()
        })

      cy.get('@globalListener').should('have.been.calledOnce')
      cy.get('@inputClickListener').should('have.been.calledOnce')
      cy.get('@leftArrowListener').should('have.been.calledOnce')
      cy.get('@rightArrowListener').should('have.been.calledOnce')
      cy.get('@monthYearListener').should('have.been.calledOnce')
      cy.get('@daysContainerListener').should('have.been.calledOnce')
      cy.get('@monthsContainerListener').should('have.been.calledOnce')
      cy.get('@overlayCloseListner').should('have.been.calledOnce')
      cy.get('@overlaySubmitListener').should('have.been.calledOnce')
      cy.get('@overlayInputOnInputListener').should('have.been.calledTwice')
    })

    it('should not call `removeEventListener` on the document if more pickers are left', () => {
      datepicker(testElementIds.singleStandalone)
      const picker = datepicker(testElementIds.singleInput)

      cy.document()
        .then(doc => {
          cy.spy(doc, 'removeEventListener').as('globalListener')
        })
        .then(() => {
          picker.remove()
        })

      cy.get('@globalListener').should('not.have.been.called')
    })

    it('should call `document.removeEventListener` after removing the last picker', () => {
      const picker1 = datepicker(testElementIds.singleInput)
      const picker2 = datepicker(testElementIds.singleStandalone)

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
        .should('have.been.calledOnce')
    })

    it('should execute an optional callback function', () => {
      const picker1 = datepicker(testElementIds.singleInput)
      const cb = cy.stub()

      expect(cb).not.to.be.called

      picker1.remove(cb)
      expect(cb).to.be.calledOnce
    })
  })

  describe('navigate', () => {
    it('should navigate the calendar to a new date (not select it)', () => {
      const startDate = new Date(2023, 1)
      const picker = datepicker(testElementIds.singleInput, {
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
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.navigate).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('selectDate', () => {
    const startDate = new Date(2023, 1)
    const options = {startDate, alwaysShow: true}

    it('should select a date on the calendar and set `selectedDate` on the picker', () => {
      const picker = datepicker(testElementIds.singleInput, options)
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
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        minDate,
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
        })
    })

    it('should not select a date above `maxDate`', () => {
      const maxDate = new Date(startDate)
      maxDate.setMonth(maxDate.getMonth() - 1)
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        maxDate,
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
        })
    })

    it('should not select a date that is disabled', () => {
      const disabledDate = new Date(startDate)
      disabledDate.setDate(disabledDate.getDate() + 1)
      const picker = datepicker(testElementIds.singleInput, {
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

    it('should not select a weekend date if `noWeekends` is true', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        noWeekends: true,
      })

      const weekendDate = new Date(startDate)
      while (weekendDate.getDay() !== 6 && weekendDate.getDay() !== 0) {
        weekendDate.setDate(weekendDate.getDate() + 1)
      }

      expect(picker.selectedDate).to.be.undefined

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          picker.selectDate({date: weekendDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })

    it('should not change the calender by default', () => {
      const picker = datepicker(testElementIds.singleInput, options)
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
      const picker = datepicker(testElementIds.singleInput, options)
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
      const picker = datepicker(testElementIds.singleInput, options)
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

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectDate).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('setMin', () => {
    const startDate = new Date(2023, 1)
    const minDate = new Date(startDate)
    minDate.setMonth(minDate.getMonth() + 1)
    const daysInMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate()
    const options = {startDate, alwaysShow: true}

    it('should set a minimum selectable date on the calendar', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get(days.disabledDate)
        .should('have.length', 0)
        .then(() => {
          picker.setMin({date: minDate})
        })

      cy.get(days.disabledDate).should('have.length', daysInMonth)
    })

    it('should unset a minimum selectable date', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        minDate,
      })

      cy.get(days.disabledDate)
        .should('have.length', daysInMonth)
        .then(() => {
          picker.setMin()
        })

      cy.get(days.disabledDate).should('have.length', 0)
    })

    it('should deselect a date if it is out of range', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: startDate,
      })

      expect(picker.selectedDate).to.deep.equal(startDate)

      cy.get(days.selectedDate)
        .should('have.length', 1)
        .then(() => {
          picker.setMin({date: minDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })

    it('should throw an error if setting a date > `maxDate`', () => {
      const picker = datepicker(testElementIds.singleInput, {
        maxDate: new Date(2023, 2, 1),
      })

      expect(() => picker.setMin({date: new Date(2023, 2, 15)})).to.throw(
        '`minDate` cannot be > `maxDate`'
      )
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.setMin).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('setMax', () => {
    const startDate = new Date(2023, 1)
    const maxDateDay = 5
    const maxDate = new Date(startDate)
    maxDate.setDate(maxDateDay)
    const options = {startDate, alwaysShow: true}

    it('should set a maximum selectable date on the calendar', () => {
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get(days.disabledDate)
        .should('have.length', 0)
        .then(() => {
          picker.setMax({date: maxDate})
        })

      cy.get(`${days.day}:not(${days.disabledDate})`).should(
        'have.length',
        maxDateDay
      )
    })

    it('should unset a maximum selectable date', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        maxDate,
      })

      cy.get(`${days.day}:not(${days.disabledDate})`)
        .should('have.length', maxDateDay)
        .then(() => {
          picker.setMax()
        })

      cy.get(days.disabledDate).should('have.length', 0)
    })

    it('should deselect a date if it is out of range', () => {
      const picker = datepicker(testElementIds.singleInput, {
        ...options,
        selectedDate: maxDate,
      })

      expect(picker.selectedDate).to.deep.equal(maxDate)

      cy.get(days.selectedDate)
        .should('have.length', 1)
        .then(() => {
          picker.setMax({date: startDate})
        })

      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })

    it('should throw an error if setting a date < `minDate`', () => {
      const picker = datepicker(testElementIds.singleInput, {
        minDate: new Date(2023, 2, 15),
      })

      expect(() => picker.setMax({date: new Date(2023, 2, 1)})).to.throw(
        '`maxDate` cannot be < `minDate`'
      )
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.setMax).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('show', () => {
    it('shows the calendar when called (default calendar view)', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.show()
        })
        .should('be.visible')

      cy.get(containers.overlayContainer).should('not.be.visible')
    })

    it('shows the calendar when called (default overlay view)', () => {
      const picker = datepicker(testElementIds.singleInput, {
        defaultView: 'overlay',
      })

      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.show()
        })
        .should('be.visible')

      cy.get(containers.overlayContainer).should('be.visible')
      cy.get(overlay.close).click()
      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(containers.overlayContainer).should('not.be.visible')
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.show).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('hide', () => {
    it('hides the calendar when called', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer)
        .should('be.visible')
        .then(() => {
          picker.hide()
        })
        .should('not.be.visible')
    })

    it('has no effect when `alwayShow: true` is set', () => {
      const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

      cy.get(containers.calendarContainer)
        .should('be.visible')
        .then(() => {
          picker.hide()
        })
        .should('be.visible')
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.hide).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('toggleCalendar', () => {
    it('should toggle showing the calendar', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.toggleCalendar()
        })
        .should('be.visible')
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.toggleCalendar).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })

  describe('toggleOverlay', () => {
    it('should toggle showing the overlay', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.toggleCalendar()
        })

      cy.get(containers.overlayContainer)
        .should('not.be.visible')
        .then(() => {
          picker.toggleOverlay()
        })

      cy.get(containers.overlayContainer)
        .should('be.visible')
        .then(() => {
          picker.toggleOverlay()
        })

      cy.get(containers.overlayContainer).should('not.be.visible')
    })

    it('should have no effect on an already hidden calendar', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.toggleOverlay()
        })

      cy.get(testElementIds.singleInput).click()
      cy.get(containers.overlayContainer).should('not.be.visible')
    })

    it('should throw an error if called on an already removed instance', () => {
      const picker = datepicker(testElementIds.singleInput)

      cy.get(containers.calendarContainer)
        .should('have.length', 1)
        .then(() => {
          picker.remove()
        })
        .should('have.length', 0)
        .then(() => {
          expect(picker.toggleOverlay).to.throw(
            "Unable to run a function or access properties from a picker that's already removed."
          )
        })
    })
  })
})
