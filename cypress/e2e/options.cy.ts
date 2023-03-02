import {defaultOptions} from '../../src/constants'
import {Datepicker, DatepickerOptions, Position} from '../../src/types'
import {
  containers,
  controls,
  days,
  other,
  overlay,
  testElementIds,
} from '../selectors'

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

  describe('startDay', () => {
    it('should adjust the weekedays correctly', () => {
      const picker = datepicker(testElementIds.singleInput, {
        startDay: 4,
        alwaysShow: true,
      })

      cy.get(containers.weekdaysContainer).should(
        'have.text',
        'ThuFriSatSunMonTueWed'
      )
    })

    it('should have the correct value for the first weekday', () => {
      const {days} = defaultOptions
      function executeTest(startDay: number): void {
        const picker = datepicker(testElementIds.singleInput, {
          startDay,
          alwaysShow: true,
        })

        cy.get(other.weekday).then($weekdays => {
          // The 1st weekday should be the corresponding start day.
          expect($weekdays[0]).to.have.text(days[startDay])

          if (startDay < 6) {
            picker.remove(() => {
              executeTest(startDay + 1)
            })
          }
        })
      }

      executeTest(0)
    })

    it('should adjust the calendar days accordingly', () => {
      const optionsArr: (DatepickerOptions & {column: string})[] = [
        {startDay: 0, column: '4'},
        {startDay: 1, column: '3'},
        {startDay: 2, column: '2'},
        {startDay: 3, column: '1'},
        {startDay: 4, column: '7'},
        {startDay: 5, column: '6'},
        {startDay: 6, column: '5'},
      ].map(({startDay, column}) => {
        return {
          noWeekends: true,
          alwaysShow: true,
          startDate: new Date(2023, 1),
          startDay,
          column,
        }
      })

      function executTest(index: number) {
        const {column, ...options} = optionsArr[index]
        const picker = datepicker(testElementIds.singleInput, options)

        cy.get(days.day)
          .first()
          .should('have.text', '1')
          .should('have.css', 'grid-column-start', column)
          .then(() => {
            picker.remove(() => {
              if (index < optionsArr.length - 1) {
                executTest(index + 1)
              }
            })
          })
      }

      executTest(0)
    })

    it('should throw for values outside 0 - 6', () => {
      expect(() => {
        datepicker(testElementIds.singleInput, {startDay: -1})
      }).to.throw('`options.startDay` must be a number between 0 and 6.')
      expect(() => {
        datepicker(testElementIds.singleInput, {startDay: 7})
      }).to.throw('`options.startDay` must be a number between 0 and 6.')
    })
  })

  describe('customDays', () => {
    const customDays = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

    it('should replace the default weekday names', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customDays,
      })

      cy.get(other.weekday).should('have.text', customDays.join(''))
    })

    it("should throw if the array doens't have 7 values", () => {
      expect(() => {
        datepicker(testElementIds.singleInput, {
          customDays: customDays.slice(0, -1),
        })
      }).to.throw('`options.customDays` must be an array of 7 strings.')
      expect(() => {
        datepicker(testElementIds.singleInput, {
          customDays: customDays.concat('h'),
        })
      }).to.throw('`options.customDays` must be an array of 7 strings.')
    })
  })

  describe('customMonths', () => {
    const customMonths = 'abcedfghijkl'.split('')

    it('should replace the default month names at the top of the calendar', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customMonths,
        startDate: new Date(2023, 0),
      })

      function executeTest(index: number): void {
        cy.get(controls.monthName)
          .should('have.text', customMonths[index])
          .then(() => {
            if (index < 11) {
              cy.get(controls.rightArrow)
                .click()
                .then(() => {
                  executeTest(index + 1)
                })
            }
          })
      }

      executeTest(0)
    })

    it('should replace the default month names in the overlay', () => {
      datepicker(testElementIds.singleInput, {alwaysShow: true, customMonths})

      cy.get(containers.monthYearContainer)
        .click()
        .then(() => {
          cy.get(containers.overlayMonthsContainer).should(
            'have.text',
            customMonths.join('')
          )
        })
    })

    it("should throw if the array doens't have 12 values", () => {
      expect(() => {
        datepicker(testElementIds.singleInput, {
          customMonths: customMonths.slice(0, -1),
        })
      }).to.throw('`options.customMonths` must be an array of 12 strings.')
      expect(() => {
        datepicker(testElementIds.singleInput, {
          customMonths: customMonths.concat('z'),
        })
      }).to.throw('`options.customMonths` must be an array of 12 strings.')
    })
  })

  describe('customOverlayMonths', () => {
    const customOverlayMonthsLongNames = Array.from(
      {length: 12},
      (_, i) => `${101 + i}XXXXX`
    )
    // '101' => '112'
    const customOverlayMonths = customOverlayMonthsLongNames.map(val =>
      val.slice(0, 3)
    )

    it('should replace the default month names in the overlay', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customOverlayMonths,
      })

      cy.get(containers.monthYearContainer)
        .click()
        .then(() => {
          cy.get(containers.overlayMonthsContainer).should(
            'have.text',
            customOverlayMonths.join('')
          )
        })
    })

    it('should override `customMonths` for month names in the overlay', () => {
      const customMonths = 'abcdefghijkl'.split('')
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customMonths,
        customOverlayMonths,
        startDate: new Date(2023, 0),
      })

      cy.get(controls.monthName)
        .should('have.text', customMonths[0])
        .click()
        .then(() => {
          cy.get(containers.overlayMonthsContainer).should(
            'have.text',
            customOverlayMonths.join('')
          )
        })
    })

    it('should only use the first 3 characters provided', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customOverlayMonths: customOverlayMonthsLongNames,
      })

      cy.get(containers.monthYearContainer)
        .click()
        .then(() => {
          cy.get(containers.overlayMonthsContainer).should(
            'have.text',

            // Testing against the shortened names.
            customOverlayMonths.join('')
          )
        })
    })

    it("should throw if the array doens't have 12 values", () => {
      expect(() =>
        datepicker(testElementIds.singleInput, {
          alwaysShow: true,
          customOverlayMonths: customOverlayMonths.slice(0, -1),
        })
      ).to.throw(
        '`options.customOverlayMonths` must be an array of 12 strings.'
      )
      expect(() =>
        datepicker(testElementIds.singleInput, {
          alwaysShow: true,
          customOverlayMonths: customOverlayMonths.concat('113'),
        })
      ).to.throw(
        '`options.customOverlayMonths` must be an array of 12 strings.'
      )
    })
  })

  describe('defaultView', () => {
    it('should default to the calendar view', () => {
      datepicker(testElementIds.singleInput, {alwaysShow: true})
      datepicker(testElementIds.singleStandalone, {
        alwaysShow: true,
        defaultView: 'calendar',
      })

      cy.get(containers.overlayContainer)
        .should('not.be.visible')
        .should('have.length', 2)
    })

    it('should show the overlay for the proper value', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        defaultView: 'overlay',
      })
      cy.get(containers.overlayContainer)
        .should('be.visible')
        .should('have.length', 1)
    })
  })

  describe('overlayButton', () => {
    it('should have the default text', () => {
      datepicker(testElementIds.singleInput)
      cy.get(overlay.submit).should('have.text', 'Submit')
    })

    it('should set the text on the overlay submit button', () => {
      const overlayButton = 'Qodesmith'
      datepicker(testElementIds.singleInput, {overlayButton})
      cy.get(overlay.submit).should('have.text', overlayButton)
    })
  })

  describe('overlayPlaceholder', () => {
    it('should have the default placeholder', () => {
      datepicker(testElementIds.singleInput)
      cy.get(overlay.input).should('have.attr', 'placeholder', 'Enter a year')
    })

    it('should set the placeholder value', () => {
      const overlayPlaceholder = 'test'
      datepicker(testElementIds.singleInput, {overlayPlaceholder})
      cy.get(overlay.input).should(
        'have.attr',
        'placeholder',
        overlayPlaceholder
      )
    })
  })

  describe('events', () => {
    it('should put a blue dot on dates with events', () => {
      const events = [1, 5, 28].map(num => new Date(2023, 1, num))
      datepicker(testElementIds.singleInput, {
        events,
        startDate: new Date(2023, 1),
      })

      cy.get(days.event)
        .should('have.length', events.length)
        .then($els => {
          $els.each((i, el) => {
            expect(el.textContent).to.equal(`${events[i].getDate()}`)
          })
        })
    })
  })

  describe('alwaysShow', () => {
    it('should always show the calendar', () => {
      datepicker(testElementIds.singleInput, {alwaysShow: true})

      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(testElementIds.unfocus)
        .click()
        .then(() => {
          cy.get(containers.calendarContainer).should('be.visible')
        })
    })

    it('should display default behavior when set to `false`', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: false,
      })

      // Explicitly providing false.
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(testElementIds.unfocus).click()
      cy.get(containers.calendarContainer)
        .should('not.be.visible')
        .then(() => {
          picker.remove()
          cy.get(containers.calendarContainer)
            .should('have.length', 0)
            .then(() => {
              datepicker(testElementIds.singleInput)
            })
        })

      // Default behavior should be the same.
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(testElementIds.unfocus).click()
      cy.get(containers.calendarContainer).should('not.be.visible')
    })

    it('should ignore `.hide` when set to `true`', () => {
      const picker = datepicker(testElementIds.singleInput, {alwaysShow: true})

      cy.get(containers.calendarContainer)
        .should('be.visible')
        .then(() => {
          picker.hide()
        })
        .then(() => {
          cy.get(containers.calendarContainer).should('be.visible')
        })
    })
  })

  describe('selectedDate', () => {
    it('should start the calendar with a selected date', () => {
      const day = 28
      const options: DatepickerOptions = {
        selectedDate: new Date(2023, 1, day),
        startDate: new Date(2023, 1),
      }
      const picker = datepicker(testElementIds.singleInput, options)

      expect(picker.selectedDate).to.deep.equal(options.selectedDate)
      cy.get(days.selectedDate)
        .should('have.length', 1)
        .should('have.text', day)
      cy.get(testElementIds.singleInput).should(
        'have.value',
        options.selectedDate.toDateString()
      )
    })
  })

  describe('maxDate', () => {
    it('should disable selecting dates beyond the date provided', () => {
      const day = 15
      const maxDate = new Date(2023, 2, day)
      const daysInMarch = new Date(2023, 3, 0).getDate()
      const options: DatepickerOptions = {maxDate, alwaysShow: true}
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get(days.selectedDate).should('have.length', 0)
      cy.get(days.disabledDate).should('have.length', daysInMarch - day)

      cy.get(days.day)
        .contains(`${day + 1}`)
        .click()
      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
      cy.get(days.day).contains(`${day}`).click()
      cy.get(days.selectedDate)
        .should('have.length', 1)
        .then(() => {
          expect(picker.selectedDate).to.deep.equal(maxDate)
        })
    })

    it('should throw an error when set below `minDate`', () => {
      expect(() =>
        datepicker(testElementIds.singleInput, {
          minDate: new Date(2023, 2, 15),
          maxDate: new Date(2023, 2, 1),
        })
      ).to.throw('"options.minDate" cannot be greater than "options.maxDate"')
    })
  })

  describe('minDate', () => {
    it('should disable selecting dates prior to the date provided', () => {
      const day = 15
      const minDate = new Date(2023, 2, day)
      const daysInMarch = new Date(2023, 3, 0).getDate()
      const options: DatepickerOptions = {minDate, alwaysShow: true}
      const picker = datepicker(testElementIds.singleInput, options)

      cy.get(days.selectedDate).should('have.length', 0)
      cy.get(days.disabledDate).should('have.length', day - 1)
      cy.get(`${days.day}:not(${days.disabledDate})`).should(
        'have.length',
        daysInMarch - (day - 1)
      )

      cy.get(days.day)
        .contains(`${day - 1}`)
        .click()
      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
      cy.get(days.day).contains(`${day}`).click()
      cy.get(days.selectedDate)
        .should('have.length', 1)
        .then(() => {
          expect(picker.selectedDate).to.deep.equal(minDate)
        })
    })

    it('should throw an error when set above `maxDate`', () => {
      expect(() =>
        datepicker(testElementIds.singleInput, {
          minDate: new Date(2023, 2, 15),
          maxDate: new Date(2023, 2, 1),
        })
      ).to.throw('"options.minDate" cannot be greater than "options.maxDate"')
    })
  })

  describe('startDate', () => {
    it('should render the calendar month and year based on the date', () => {
      const startDate = new Date(1986, 5, 11) // <-- What movie released this day??? 😎
      const picker = datepicker(testElementIds.singleInput, {startDate})

      expect(picker.currentDate).to.deep.equal(new Date(1986, 5))
      cy.get(controls.monthName).should('have.text', 'June')
      cy.get(controls.year).should('have.text', '1986')
    })

    it('should set `currentDate` to the date provided but strip the day of the month', () => {
      const startDate = new Date(1986, 5, 11) // <-- What movie released this day??? 😎
      const picker = datepicker(testElementIds.singleInput, {startDate})

      expect(picker.currentDate).to.deep.equal(new Date(1986, 5, 1))
    })
  })

  describe('showAllDates', () => {})
  describe('respectDisabledReadOnly', () => {})
  describe('noWeekends', () => {})
  describe('disabler', () => {})
  describe('disabledDates', () => {})
  describe('disableMobile', () => {})
  describe('disableYearOverlay', () => {})
  describe('exemptIds', () => {})
})
