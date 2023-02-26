import {Datepicker, Position} from '../../src/types'
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

    it('should be called with a single date object argument', () => {
      const expectedDate = new Date(startDate)
      expectedDate.setDate(dayNum)
      const options = {
        startDate,
        alwaysShow: true,
        formatter(...args) {
          expect(args[0]).to.deep.equal(expectedDate)
          expect(args.length).to.equal(1)
          return ''
        },
      }
      const spy = cy.spy(options, 'formatter')
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get(testElementIds.singleInput).should('have.value', '')
      cy.get(days.day)
        .contains(dayNum)
        .click()
        .then(() => {
          expect(spy).to.be.calledOnce
        })
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

  describe('position', () => {
    let inputRect: DOMRect
    beforeEach(() => {
      cy.get(testElementIds.singleInput).then($el => {
        inputRect = $el[0].getBoundingClientRect()
      })
    })

    it('should not effect pickers not attached to an input', () => {
      const initialPicker = datepicker(testElementIds.singleStandalone, {
        alwaysShow: true,
      })
      const initialPickerRectValues =
        initialPicker.calendarContainer.getBoundingClientRect()
      initialPicker.remove()

      const positions: Position[] = ['tl', 'tr', 'bl', 'br', 'mc']
      positions.forEach(position => {
        const picker = datepicker(testElementIds.singleStandalone, {
          alwaysShow: true,
          position,
        })
        const pickerRectValues =
          picker.calendarContainer.getBoundingClientRect()
        picker.remove()

        expect(pickerRectValues).to.deep.equal(initialPickerRectValues)
      })
    })

    it('should default to top-left', () => {
      const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})
      const pickerRect = picker.calendarContainer.getBoundingClientRect()

      expect(pickerRect.left).to.equal(inputRect.left)

      /**
       * In a perfect world the top of the input would be just a hair (1px?)
       * greater than the bottom of the calendar for `position: 'tl'`.
       * To account for sub-pixel weirdness where the calendar bottom is
       * slightly below the input top, we simply get ballpark guage that the
       * position is right by ensuring they aren't more than 1px apart.
       */
      const distance = Math.abs(inputRect.top - pickerRect.bottom)
      expect(distance).to.be.lessThan(1)
    })

    it('should position the calendar relative to the top-left of the input', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        position: 'tl',
      })
      const pickerRect = picker.calendarContainer.getBoundingClientRect()
      const distance = Math.abs(inputRect.top - pickerRect.bottom)

      expect(pickerRect.left).to.equal(inputRect.left)
      expect(distance).to.be.lessThan(1)
    })

    it('should position the calendar relative to the top-right of the input', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        position: 'tr',
      })
      const pickerRect = picker.calendarContainer.getBoundingClientRect()
      const distance = Math.abs(inputRect.top - pickerRect.bottom)

      expect(pickerRect.right).to.equal(inputRect.right)
      expect(distance).to.be.lessThan(1)
    })

    it('should position the calendar relative to the bottom-left of the input', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        position: 'bl',
      })
      const pickerRect = picker.calendarContainer.getBoundingClientRect()
      const distance = Math.abs(inputRect.bottom - pickerRect.top)

      expect(pickerRect.left).to.equal(inputRect.left)
      expect(distance).to.be.lessThan(1)
    })

    it('should position the calendar relative to the bottom-right of the input', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        position: 'br',
      })
      const pickerRect = picker.calendarContainer.getBoundingClientRect()
      const distance = Math.abs(inputRect.bottom - pickerRect.top)

      expect(pickerRect.right).to.equal(inputRect.right)
      expect(distance).to.be.lessThan(1)
    })

    it('should position the calendar centered and fixed on the screen', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        position: 'mc',
      })

      cy.window().then(win => {
        const {innerWidth, innerHeight} = win
        const pickerRect1 = picker.calendarContainer.getBoundingClientRect()

        expect(pickerRect1.top).to.equal(
          innerHeight - pickerRect1.height - pickerRect1.top
        )
        expect(pickerRect1.left).to.equal(
          innerWidth - pickerRect1.width - pickerRect1.left
        )

        cy.scrollTo('bottom').then(() => {
          const pickerRect2 = picker.calendarContainer.getBoundingClientRect()

          expect(pickerRect2.top).to.equal(
            innerHeight - pickerRect2.height - pickerRect2.top
          )
          expect(pickerRect2.left).to.equal(
            innerWidth - pickerRect2.width - pickerRect2.left
          )
        })
      })
    })
  })
})
