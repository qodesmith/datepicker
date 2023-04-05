import {defaultOptions} from '../../src/constants'
import {
  Datepicker,
  DatepickerInstance,
  DatepickerOptions,
  Position,
} from '../../src/types'
import {
  containers,
  controls,
  days,
  daysCls,
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

      cy.get(containers.overlayMonthsContainer).should(
        'have.text',
        customMonths.join('')
      )
    })

    it('should populate the overlay with a truncated version (1st 3 characters) when no `customOverlayMonths` is provided', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customMonths: 'abcdefg '.repeat(12).trim().split(' '),
      })

      cy.get(containers.overlayMonthsContainer).should(
        'have.text',
        'abc'.repeat(12)
      )
    })

    it('should have no effect on `customOverlayMonths` if that option is provided', () => {
      datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        customMonths,
        customOverlayMonths: 'a'.repeat(12).split(''),
      })

      cy.get(containers.overlayMonthsContainer).should(
        'have.text',
        'a'.repeat(12)
      )
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

    it('should use all characters provided (i.e. not just the 1st 3)', () => {
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
            customOverlayMonthsLongNames.join('')
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

  describe('overlayButtonText', () => {
    it('should have the default text', () => {
      datepicker(testElementIds.singleInput)
      cy.get(overlay.submit).should('have.text', 'Submit')
    })

    it('should set the text on the overlay submit button', () => {
      const overlayButtonText = 'Qodesmith'
      datepicker(testElementIds.singleInput, {overlayButtonText})
      cy.get(overlay.submit).should('have.text', overlayButtonText)
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

  describe('showAllDates', () => {
    // Create dates from 2 years ago to now.
    const today = new Date()
    const thisYear = today.getFullYear()
    const thisMonth = today.getMonth()
    const datesData = Array.from({length: 24}).map((_, i) => {
      /**
       * - (-23)
       *   - because we're dealing with 0-index based months.
       *   - so the array can be in ascending-date order.
       * - (+ thisMonth) so we can iterate up to the current month, not January.
       */
      const month = -23 + i + thisMonth
      const startDate = new Date(thisYear, month)
      return {startDate, expectedColumnStart: startDate.getDay() + 1}
    })

    describe('when `false` or `undefined`', () => {
      it('should not show dates before or after the current month', () => {
        const startDate = new Date(2023, 2)
        const expectedDays = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0
        ).getDate()
        datepicker(testElementIds.singleInput, {alwaysShow: true, startDate})

        cy.get(days.displayedDays).should('have.length', expectedDays)
        cy.get(days.displayedDays).first().should('have.text', '1')
      })

      describe('initializing with new date', () => {
        datesData.forEach(({startDate, expectedColumnStart}) => {
          const options: DatepickerOptions = {startDate, alwaysShow: true}
          const localeDateStr = startDate.toLocaleDateString()

          it(`${localeDateStr} starts the 1st of the month on the correct day`, () => {
            datepicker(testElementIds.singleInput, options)

            cy.get(days.day)
              .contains('1')
              .should('have.css', 'grid-column-start', `${expectedColumnStart}`)
          })

          it(`${localeDateStr} should have the correct number of DOM nodes for days`, () => {
            datepicker(testElementIds.singleInput, options)
            const expectedNumberOfDomNodes = new Date(
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              0
            ).getDate()

            cy.get(days.displayedDays).should(
              'have.length',
              expectedNumberOfDomNodes
            )
          })
        })
      })

      describe('navigating from current date', () => {
        it('starts the 1st of the month on the correct day & has the correct number of DOM nodes for days', () => {
          const picker = datepicker(testElementIds.singleInput, {
            alwaysShow: true,
          })

          datesData
            .slice()
            .reverse()
            .forEach(({expectedColumnStart}) => {
              cy.get(days.day)
                .contains('1')
                .should(
                  'have.css',
                  'grid-column-start',
                  `${expectedColumnStart}`
                )
                .then(() => {
                  /**
                   * This needs to be in a .then because we need to check the
                   * picker's current date at this point in time, not before.
                   */
                  const expectedNumberOfDomNodes = new Date(
                    picker.currentDate.getFullYear(),
                    picker.currentDate.getMonth() + 1,
                    0
                  ).getDate()
                  cy.get(days.displayedDays).should(
                    'have.length',
                    expectedNumberOfDomNodes
                  )
                })
              cy.get(controls.leftArrow).click()
            })
        })
      })
    })

    describe('when `true`', () => {
      it('should show background for a selected date', () => {
        const startDate = new Date(2023, 2, 1)
        const selectedDate = new Date(2023, 2, 0)
        datepicker(testElementIds.singleInput, {
          showAllDates: true,
          selectedDate,
          startDate,
          alwaysShow: true,
        })

        cy.get(days.selectedDate)
          .should('have.length', 1)
          .should('not.have.css', 'backgroundColor', 'rgba(0, 0, 0, 0)')
      })

      it('should show events in other month days', () => {
        datepicker(testElementIds.singleInput, {
          showAllDates: true,
          alwaysShow: true,
          startDate: new Date(2023, 2),
          events: [new Date(2023, 1, 28)],
        })

        cy.get(days.event)
          .should('have.length', 1)
          .should('have.text', '28')
          .should('have.class', daysCls.otherMonthDay)
          .should('have.css', 'opacity', '0.5')
      })

      it('should show today in other month days as bold and highlighted', () => {
        const today = new Date(2023, 1, 28)

        cy.clock(+today).then(() => {
          datepicker(testElementIds.singleInput, {
            startDate: new Date(2023, 2),
            alwaysShow: true,
            showAllDates: true,
          })
        })
        cy.get(days.today)
          .should('have.length', 1)
          .should('have.class', daysCls.otherMonthDay)
      })

      describe('initializing with new date', () => {
        // Iterate through 2 years worth of dates and assert the starting date.
        // This will ensure we don't have off-by-1 errors.
        datesData.forEach(({startDate, expectedColumnStart}, i) => {
          const localeDateStr = startDate.toLocaleDateString()
          const options: DatepickerOptions = {
            startDate,
            alwaysShow: true,
            showAllDates: true,
          }

          it(`${localeDateStr} starts the 1st of the month on the correct day`, () => {
            datepicker(testElementIds.singleInput, options)

            cy.get(days.displayedDays).then($days => {
              const day = $days[expectedColumnStart - 1]
              const gridStyle = day.style.getPropertyValue('grid-column-start')

              expect(day.textContent).to.equal('1')
              expect(gridStyle).to.equal('')
            })
          })

          it('should have the correct number of DOM nodes for days', () => {
            datepicker(testElementIds.singleInput, options)

            cy.get(days.displayedDays).then($days => {
              // We should always have a multiple of 7 when all days are shown.
              const results = $days.length % 7
              expect(results).to.equal(0)
            })
          })
        })
      })

      describe('navigating from current date', () => {
        it('starts the 1st of the month on the correct day & has the correct number of DOM nodes for days', () => {
          datepicker(testElementIds.singleInput, {
            alwaysShow: true,
            showAllDates: true,
          })

          datesData
            .slice()
            .reverse()
            .forEach(({expectedColumnStart}) => {
              cy.get(days.displayedDays).then($days => {
                const results = $days.length % 7
                const day = $days[expectedColumnStart - 1]
                const gridStyle =
                  day.style.getPropertyValue('grid-column-start')

                expect(day.textContent).to.equal('1')
                expect(gridStyle).to.equal('')
                expect(results).to.equal(0)
              })

              cy.get(controls.leftArrow).click()
            })
        })
      })
    })
  })

  describe('showAllDatesClickable', () => {
    describe('when `false` or `undefined`', () => {
      it('should disable dates shown outside the current month (i.e. not-clickable)', () => {
        const picker = datepicker(testElementIds.singleInput, {
          showAllDates: true,
          showAllDatesClickable: false,
          startDate: new Date(2023, 2),
          alwaysShow: true,
        })

        cy.get(days.selectedDate)
          .should('have.length', 0)
          .then(() => {
            expect(picker.selectedDate).to.be.undefined
          })

        cy.get(days.displayedDays)
          .first()
          .should('have.text', '26')
          .should('have.class', daysCls.disabledDate)
          .click()
        cy.get(days.selectedDate)
          .should('have.length', 0)
          .then(() => {
            expect(picker.selectedDate).to.be.undefined
          })
      })
    })

    describe('when `true`', () => {
      it('should enable dates shown outside the current month (i.e. clickable)', () => {
        const dateToSelect = new Date(2023, 1, 26)
        const picker = datepicker(testElementIds.singleInput, {
          showAllDates: true,
          showAllDatesClickable: true,
          startDate: new Date(2023, 2),
          alwaysShow: true,
        })

        cy.get(testElementIds.singleInput).should('have.value', '')
        cy.get(days.selectedDate)
          .should('have.length', 0)
          .then(() => {
            expect(picker.selectedDate).to.be.undefined
          })

        cy.get(days.displayedDays)
          .first()
          .should('have.text', dateToSelect.getDate().toString())
          .click()
        cy.get(days.selectedDate)
          .should('have.length', 1)
          .then(() => {
            expect(picker.selectedDate).to.deep.equal(dateToSelect)
          })
        cy.get(testElementIds.singleInput).should(
          'have.value',
          dateToSelect.toDateString()
        )
      })
    })
  })

  describe('respectDisabledReadOnly', () => {
    describe('has no effect if the selector is not an input', () => {
      let picker: DatepickerInstance
      const startDate = new Date(2023, 2)

      beforeEach(() => {
        picker = datepicker(testElementIds.singleStandalone, {
          respectDisabledReadOnly: true,
          alwaysShow: true,
          startDate,
          disabledDates: [
            new Date(startDate.getFullYear(), startDate.getMonth(), 2),
          ],
        })
      })

      it('can select / deselect dates', () => {
        cy.get(days.selectedDate)
          .should('have.length', 0)
          .then(() => {
            expect(picker.selectedDate).to.be.undefined
          })

        cy.get(days.day).contains('1').click()
        cy.get(days.selectedDate)
          .should('have.length', 1)
          .then(() => {
            expect(picker.selectedDate).not.to.be.undefined
          })

        cy.get(days.day).contains('1').click()
        cy.get(days.selectedDate)
          .should('have.length', 0)
          .then(() => {
            expect(picker.selectedDate).to.be.undefined
          })
      })

      it('shows different opacity for enabled / disabled dates', () => {
        cy.get(days.day).contains('1').should('have.css', 'opacity', '1')
        cy.get(days.day).contains('2').should('have.css', 'opacity', '0.5')
      })

      it('has no effect on navigating the calendar', () => {
        // Calendar can be controlled via controls.
        cy.get(controls.monthName).should('have.text', 'March')
        cy.get(controls.rightArrow).click()
        cy.get(controls.monthName).should('have.text', 'April')

        // Navigate method works.
        cy.then(() => {
          picker.navigate(new Date(2023, 4))
        })
        cy.get(controls.monthName).should('have.text', 'May')
      })
    })

    describe('used with an input selector', () => {
      describe('disabled', () => {
        beforeEach(() => {
          cy.get(testElementIds.singleInput).then($input => {
            const input = $input[0] as HTMLInputElement
            input.disabled = true
          })
        })

        it("sets the input's initial value", () => {
          const selectedDate = new Date()
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate: selectedDate,
            selectedDate,
          })

          cy.get(testElementIds.singleInput).should(
            'have.value',
            selectedDate.toDateString()
          )
        })

        it('prevents dates from being selected via click', () => {
          const startDate = new Date()
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          // Sanity check.
          expect(picker.selectedDate).to.be.undefined

          // Clicking a date does not select it.
          cy.get(days.selectedDate).should('have.length', 0)
          cy.get(days.day).first().click()
          cy.get(days.selectedDate).should('have.length', 0)
          expect(picker.selectedDate).to.be.undefined
        })

        it('prevents dates from being unselected via click', () => {
          const selectedDate = new Date()
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate: selectedDate,
            selectedDate,
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          // Sanity check.
          expect(picker.selectedDate).to.deep.equal(
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            )
          )

          // Clicking a date did not unselect it.
          cy.get(days.selectedDate).should('have.length', 1).click()
          cy.get(days.selectedDate).should('have.length', 1)
          expect(picker.selectedDate).to.deep.equal(
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            )
          )
        })

        it("doesn't affect opacity (i.e. same visuals for enabled / disabled dates", () => {
          const startDate = new Date()
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            disabledDates: [
              new Date(startDate.getFullYear(), startDate.getMonth(), 2),
            ],
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          cy.get(days.day).contains('1').should('have.css', 'opacity', '1')
          cy.get(days.day).contains('2').should('have.css', 'opacity', '0.5')
        })

        it('allows the calendar to navigate via controls', () => {
          const startDate = new Date(2023, 2)
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          // Sanity check.
          cy.get(controls.monthName).should('have.text', 'March')

          // Clicking control arrows.
          cy.get(controls.leftArrow).click()
          cy.get(controls.monthName).should('have.text', 'February')
          cy.get(controls.rightArrow).click()
          cy.get(controls.monthName).should('have.text', 'March')

          // Using the overlay year.
          cy.get(controls.year).should('have.text', '2023')
          cy.get(controls.year).click()
          cy.get(overlay.input).type('2022')
          cy.get(overlay.submit).click()
          cy.get(controls.year).should('have.text', '2022')

          // Using the overlay month.
          cy.get(controls.monthName).click()
          cy.get(overlay.month).last().click()
          cy.get(controls.monthName).should('have.text', 'December')
        })

        it('allows the calendar to navigate via the navigate method', () => {
          const startDate = new Date(2023, 2)
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          // Sanity check.
          cy.get(controls.monthName).should('have.text', 'March')
          cy.get(controls.year).should('have.text', '2023')

          cy.then(() => {
            picker.navigate(new Date(2024, 10, 15))
          })
          cy.get(controls.monthName).should('have.text', 'November')
          cy.get(controls.year).should('have.text', '2024')
        })

        it("doesn't affect the setMin and setMax methods", () => {
          const startDate = new Date(2023, 2)
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          // Sanity check.
          cy.get(days.disabledDate)
            .should('have.length', 0)
            .then(() => {
              picker.setMin(
                new Date(startDate.getFullYear(), startDate.getMonth(), 5)
              )
              picker.setMax(
                new Date(startDate.getFullYear(), startDate.getMonth(), 10)
              )
            })

          // Test opacity and class names.
          cy.get(days.displayedDays).each($day => {
            const num = +$day.text()

            if (num < 5 || num > 10) {
              expect($day).to.have.class(daysCls.disabledDate)
              expect($day).to.have.css('opacity', '0.5')
            } else {
              expect($day).not.to.have.class(daysCls.disabledDate)
              expect($day).to.have.css('opacity', '1')
            }
          })
        })

        it('disables the selectDate method', () => {
          const startDate = new Date(2023, 2)
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
          })

          // Sanity check.
          expect(picker.selectedDate).to.be.undefined
          cy.get(days.selectedDate).should('have.length', 0)

          // Set the date with the `selectDate` method.
          cy.then(() => {
            picker.selectDate(startDate)
            expect(picker.selectedDate).to.be.undefined
          })
          cy.get(days.selectedDate).should('have.length', 0)
        })
      })

      describe('readOnly', () => {
        beforeEach(() => {
          cy.get(testElementIds.singleInput).then($input => {
            const input = $input[0] as HTMLInputElement
            input.readOnly = true
          })
        })

        it('allows the calendar to be shown and hidden', () => {
          const startDate = new Date(2023, 2)
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
          })

          cy.get(containers.calendarContainer).should('not.be.visible')
          cy.get(testElementIds.singleInput).click()
          cy.get(containers.calendarContainer).should('be.visible')
        })

        it("sets the input's initial value", () => {
          const selectedDate = new Date()
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate: selectedDate,
            selectedDate,
          })

          cy.get(testElementIds.singleInput).should(
            'have.value',
            selectedDate.toDateString()
          )
        })

        it('prevents dates from being selected via click', () => {
          const startDate = new Date()
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
          })

          // Sanity check.
          expect(picker.selectedDate).to.be.undefined

          // Clicking a date does not select it.
          cy.get(testElementIds.singleInput).click()
          cy.get(days.selectedDate).should('have.length', 0)
          cy.get(days.day).first().click()
          cy.get(days.selectedDate).should('have.length', 0)
          expect(picker.selectedDate).to.be.undefined
        })

        it('prevents dates from being unselected via click', () => {
          const selectedDate = new Date()
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate: selectedDate,
            selectedDate,
          })

          // Sanity check.
          expect(picker.selectedDate).to.deep.equal(
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            )
          )

          // Clicking a date did not unselect it.
          cy.get(testElementIds.singleInput).click()
          cy.get(days.selectedDate).should('have.length', 1).click()
          cy.get(days.selectedDate).should('have.length', 1)
          expect(picker.selectedDate).to.deep.equal(
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            )
          )
        })

        it("doesn't affect opacity (i.e. same visuals for enabled / disabled dates", () => {
          const startDate = new Date()
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            disabledDates: [
              new Date(startDate.getFullYear(), startDate.getMonth(), 2),
            ],
            alwaysShow: true,
          })

          cy.get(days.day).contains('1').should('have.css', 'opacity', '1')
          cy.get(days.day).contains('2').should('have.css', 'opacity', '0.5')
        })

        it('allows the calendar to navigate via controls', () => {
          const startDate = new Date(2023, 2)
          datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true,
          })

          // Sanity check.
          cy.get(controls.monthName).should('have.text', 'March')

          // Clicking control arrows.
          cy.get(controls.leftArrow).click()
          cy.get(controls.monthName).should('have.text', 'February')
          cy.get(controls.rightArrow).click()
          cy.get(controls.monthName).should('have.text', 'March')

          // Using the overlay year.
          cy.get(controls.year).should('have.text', '2023')
          cy.get(controls.year).click()
          cy.get(overlay.input).type('2022')
          cy.get(overlay.submit).click()
          cy.get(controls.year).should('have.text', '2022')

          // Using the overlay month.
          cy.get(controls.monthName).click()
          cy.get(overlay.month).last().click()
          cy.get(controls.monthName).should('have.text', 'December')
        })

        it('allows the calendar to navigate via the navigate method', () => {
          const startDate = new Date(2023, 2)
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true,
          })

          // Sanity check.
          cy.get(controls.monthName).should('have.text', 'March')
          cy.get(controls.year).should('have.text', '2023')

          cy.then(() => {
            picker.navigate(new Date(2024, 10, 15))
          })
          cy.get(controls.monthName).should('have.text', 'November')
          cy.get(controls.year).should('have.text', '2024')
        })

        it("doesn't affect the setMin and setMax methods", () => {
          const startDate = new Date(2023, 2)
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true,
          })

          // Sanity check.
          cy.get(days.disabledDate)
            .should('have.length', 0)
            .then(() => {
              picker.setMin(
                new Date(startDate.getFullYear(), startDate.getMonth(), 5)
              )
              picker.setMax(
                new Date(startDate.getFullYear(), startDate.getMonth(), 10)
              )
            })

          // Test opacity and class names.
          cy.get(days.displayedDays).each($day => {
            const num = +$day.text()

            if (num < 5 || num > 10) {
              expect($day).to.have.class(daysCls.disabledDate)
              expect($day).to.have.css('opacity', '0.5')
            } else {
              expect($day).not.to.have.class(daysCls.disabledDate)
              expect($day).to.have.css('opacity', '1')
            }
          })
        })

        it('disables the selectDate method', () => {
          const startDate = new Date(2023, 2)
          const picker = datepicker(testElementIds.singleInput, {
            respectDisabledReadOnly: true,
            startDate,
            alwaysShow: true,
          })

          // Sanity check.
          expect(picker.selectedDate).to.be.undefined
          cy.get(days.selectedDate).should('have.length', 0)

          // Set the date with the `selectDate` method.
          cy.then(() => {
            picker.selectDate(startDate)
            expect(picker.selectedDate).to.be.undefined
          })
          cy.get(days.selectedDate).should('have.length', 0)
        })
      })

      describe('adding input attributes after initial activity', () => {
        // We won't test all scenario's here, but just a few to indicate that
        // Datepicker actively checks for `disabled` and `readOnly` attributes
        // prior to acting.

        describe('disabled', () => {
          it('should not update the text input value', () => {
            const startDate = new Date(2023, 2)
            const picker = datepicker(testElementIds.singleInput, {
              respectDisabledReadOnly: true,
              startDate,
              alwaysShow: true, // Because `disabled` inputs refuse clicks and focus.
            })

            cy.get(testElementIds.singleInput)
              .should('have.value', '')
              .then(() => {
                expect(picker.selectedDate).to.be.undefined
                picker.selectDate(startDate)
              })
            cy.get(testElementIds.singleInput)
              .should('have.value', startDate.toDateString())
              .then($input => {
                const input = $input[0] as HTMLInputElement
                input.disabled = true
                expect(picker.selectedDate).to.deep.equal(startDate)
              })
            cy.get(days.day).contains('5').click()
            cy.get(testElementIds.singleInput)
              .should('have.value', startDate.toDateString())
              .then(() => {
                expect(picker.selectedDate).to.deep.equal(startDate)
              })
          })
        })

        describe('readOnly', () => {
          it('should not update the text input value', () => {
            const startDate = new Date(2023, 2)
            const picker = datepicker(testElementIds.singleInput, {
              respectDisabledReadOnly: true,
              startDate,
              alwaysShow: true,
            })

            cy.get(testElementIds.singleInput)
              .should('have.value', '')
              .then(() => {
                expect(picker.selectedDate).to.be.undefined
                picker.selectDate(startDate)
              })
            cy.get(testElementIds.singleInput)
              .should('have.value', startDate.toDateString())
              .then($input => {
                const input = $input[0] as HTMLInputElement
                input.readOnly = true
                expect(picker.selectedDate).to.deep.equal(startDate)
              })
            cy.get(days.day).contains('5').click()
            cy.get(testElementIds.singleInput)
              .should('have.value', startDate.toDateString())
              .then(() => {
                expect(picker.selectedDate).to.deep.equal(startDate)
              })
          })
        })
      })
    })
  })

  describe('noWeekends', () => {
    it('should disable Sundays and Saturdays', () => {
      const weekendDays = ['4', '5', '11', '12', '18', '19', '25', '26']
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        noWeekends: true,
        startDate: new Date(2023, 2),
      })

      // Click all the weekend days.
      weekendDays.forEach(dayNum => {
        cy.get(days.day)
          .contains(dayNum)
          .should('have.class', daysCls.disabledDate)
          .click()
          .then(() => {
            expect(picker.selectedDate).to.be.undefined
            cy.get(days.selectedDate).should('have.length', 0)
          })
      })

      // Sanity check.
      cy.get(days.day)
        .contains('3')
        .click()
        .then(() => {
          expect(picker.selectedDate).to.deep.equal(new Date(2023, 2, 3))
          cy.get(days.selectedDate).should('have.length', 1)
        })
    })

    it('should disabled Sundays and Saturdays in other month days', () => {
      const weekendDays = ['4', '5', '11', '12', '18', '19', '25', '26']
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        noWeekends: true,
        startDate: new Date(2023, 2),
        showAllDates: true,
        showAllDatesClickable: true,
      })

      // Sanity check.
      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })

      // Click Sunday in other month.
      cy.get(days.displayedDays)
        .first()
        .should('have.text', '26')
        .should('have.class', daysCls.disabledDate)
        .click()
      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })

      // Click Saturday in other month.
      cy.get(days.displayedDays)
        .last()
        .should('have.text', '1')
        .should('have.class', daysCls.disabledDate)
        .click()
      cy.get(days.selectedDate)
        .should('have.length', 0)
        .then(() => {
          expect(picker.selectedDate).to.be.undefined
        })
    })
  })

  describe('disabler', () => {
    it("should disable every day that's not the 15th", () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        disabler(date) {
          return date.getDate() !== 15
        },
      })

      cy.get(days.displayedDays).each($day => {
        if ($day.text() === '15') {
          cy.wrap($day).should('not.have.class', daysCls.disabledDate)
        } else {
          cy.wrap($day).should('have.class', daysCls.disabledDate)
        }
      })

      cy.get(controls.rightArrow).click()
      cy.get(days.displayedDays).each($day => {
        if ($day.text() === '15') {
          cy.wrap($day).should('not.have.class', daysCls.disabledDate)
        } else {
          cy.wrap($day).should('have.class', daysCls.disabledDate)
        }
      })
    })

    it('should disabled only the 15th of each month', () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        disabler(date) {
          return date.getDate() === 15
        },
      })

      cy.get(days.displayedDays).each($day => {
        if ($day.text() === '15') {
          cy.wrap($day).should('have.class', daysCls.disabledDate)
        } else {
          cy.wrap($day).should('not.have.class', daysCls.disabledDate)
        }
      })

      cy.get(controls.rightArrow).click()
      cy.get(days.displayedDays).each($day => {
        if ($day.text() === '15') {
          cy.wrap($day).should('have.class', daysCls.disabledDate)
        } else {
          cy.wrap($day).should('not.have.class', daysCls.disabledDate)
        }
      })
    })
  })

  describe('disabledDates', () => {
    it('should disable any dates provided', () => {
      const startDate = new Date(2023, 2)
      const disabledDays = [1, 5, 8, 9, 16, 20]
      const disabledDates = disabledDays.map(day => {
        return new Date(2023, 2, day)
      })
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        disabledDates,
        startDate,
      })

      cy.get(days.displayedDays).each($day => {
        const dayNum = +$day.text()

        if (disabledDays.includes(dayNum)) {
          cy.wrap($day).should('have.class', daysCls.disabledDate)
        } else {
          cy.wrap($day).should('not.have.class', daysCls.disabledDate)
        }
      })
    })
  })

  describe('disableYearOverlay', () => {
    it("should disable opening the overlay and force the default view to 'calendar'", () => {
      const picker = datepicker(testElementIds.singleInput, {
        alwaysShow: true,
        disableYearOverlay: true,
        defaultView: 'overlay',
      })

      cy.get(containers.monthYearContainer).should('have.class', 'dp-disabled')
      cy.get(containers.overlayContainer).should('not.be.visible')
      cy.get(controls.year).click()
      cy.get(containers.overlayContainer)
        .should('not.be.visible')
        .then(() => {
          picker.toggleOverlay()
        })
      cy.get(containers.overlayContainer).should('not.be.visible')
    })
  })

  describe('exemptIds', () => {
    it('should not prevent un-associated pickers from closing when clicked', () => {
      cy.get(testElementIds.unfocus)
        .then($el => {
          $el.attr('data-exempt-id', 'exempt')
        })
        .then(() => {
          datepicker(testElementIds.singleInput)
        })

      // Clicking an element that's not exempt closes the picker.
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(testElementIds.unfocus).click()
      cy.get(containers.calendarContainer).should('not.be.visible')
    })

    it('should prevent an associated picker from closing when clicked', () => {
      const id = 'exempt'

      cy.get(testElementIds.unfocus)
        .then($el => {
          $el.attr('data-exempt-id', id)
        })
        .then(() => {
          datepicker(testElementIds.singleInput, {exemptIds: [id]})
        })

      // Clicking the exempted element doesn't close the picker.
      cy.get(containers.calendarContainer).should('not.be.visible')
      cy.get(testElementIds.singleInput).click()
      cy.get(containers.calendarContainer).should('be.visible')
      cy.get(testElementIds.unfocus).click()
      cy.get(containers.calendarContainer).should('be.visible')

      // Clicking an element that's not exempt closes the picker.
      cy.get(testElementIds.singleStandalone).click()
      cy.get(containers.calendarContainer).should('not.be.visible')
    })
  })

  describe('formatDay', () => {
    it('should customize the calendar day numbers', () => {
      const picker = datepicker(testElementIds.singleInput, {
        formatDay(num) {
          if (num === 1 || num === 15) return '!'
          return num.toString()
        },
      })

      cy.get(days.day)
        .filter(':contains("!")')
        .should('have.length', 2)
        .each(($day, i) => {
          expect($day.attr('data-num')).to.equal(i === 0 ? '1' : '15')
        })
    })
  })

  describe('formatYear', () => {
    it('should customize the calendar year', () => {
      const startDate = new Date()
      const expectedYear = startDate
        .getFullYear()
        .toString()
        .split('')
        .reverse()
        .join('')
      const picker = datepicker(testElementIds.singleInput, {
        startDate,
        alwaysShow: true,
        formatYear(num) {
          return num.toString().split('').reverse().join('')
        },
      })

      cy.get(controls.year).should('have.text', expectedYear).click()
      cy.get(overlay.input).type('1234')
      cy.get(overlay.month).last().click()
      cy.get(controls.year).should('have.text', '4321')
      cy.get(controls.rightArrow).click()
      cy.get(controls.year).should('have.text', '5321')
    })
  })
})
