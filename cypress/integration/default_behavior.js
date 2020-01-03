const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/*
  Helper function to determine how many days the calendar should have.
  The calendar constantly changes since tests will run on a different date each time.
*/
function howManyDays(datepickerInstance) {
  const numOfDays = new Date(
    datepickerInstance.currentYear, // Year.
    datepickerInstance.currentMonth + 1, // Month + 1.
    0 // 0 sets it back to the last day of the previous month.
  ).getDate()

  return numOfDays
}

describe('Initial calendar load with default settings', () => {
  const today = new Date()
  const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let picker

  before(() => {
    cy.visit('http://localhost:9001')
    cy.window().then(win => {
      picker = win.dp('[data-cy="input-1"]')
    })
  })

  describe('Datepicker instance object properties', () => {
    it('el', () => {
      cy.get('[data-cy="input-1"]')
        .then($el => expect($el[0]).to.equal(picker.el))
    })

    it('parent', () => {
      cy.get('[data-cy="input-1"]')
        .then($el => expect($el.parent()[0]).to.equal(picker.parent))
    })

    it('nonInput', () => expect(picker.nonInput).to.be.false)

    it('noPosition', () => expect(picker.noPosition).to.be.false)

    it('position', () => expect(picker.position).to.deep.equal({ bottom: 1, left: 1 }))

    it('startDate', () => expect(+picker.startDate).to.equal(+todayNoTime))

    it('dateSelected', () => expect(picker.dateSelected).to.be.undefined)

    it('disabledDates', () => expect(picker.disabledDates).to.deep.equal([]))

    it('minDate', () => expect(picker.minDate).to.be.undefined)

    it('maxDate', () => expect(picker.maxDate).to.be.undefined)

    it('noWeekends', () => expect(picker.noWeekends).to.be.false)

    it('weekendIndices', () => expect(picker.weekendIndices).to.deep.equal([6, 0]))

    it('calendarContainer', () => {
      cy.get('[data-cy="input-1"]')
        .then($input => {
          const container = $input.parent().find('.qs-datepicker-container')[0]
          expect(picker.calendarContainer).to.equal(container)
        })
    })

    it('calendar', () => {
      cy.get('[data-cy="input-1"]')
        .then($input => {
          const calendar = $input.parent().find('.qs-datepicker-container .qs-datepicker')[0]
          expect(picker.calendar).to.equal(calendar)
        })
    })

    it('currentMonth', () => expect(picker.currentMonth).to.equal(today.getMonth()))

    it('currentMonthName', () => expect(picker.currentMonthName).to.equal(months[picker.currentMonth]))

    it('currentYear', () => expect(picker.currentYear).to.equal(today.getFullYear()))

    it('events', () => expect(picker.events).to.deep.equal({}))

    it('should have specific properties that are functions', () => {
      const functionProperties = [
        'setDate',
        'remove',
        'setMin',
        'setMax',
        'show',
        'hide',
        'onSelect',
        'onShow',
        'onHide',
        'onMonthChange',
        'formatter',
        'disabler'
      ]

      Object.keys(picker).forEach(prop => {
        if (functionProperties.includes(prop)) {
          expect(typeof picker[prop]).to.equal('function')
        } else {
          expect(typeof picker[prop]).not.to.equal('function')
        }
      })
    })

    it('months', () => expect(picker.months).to.deep.equal(months))

    it('days', () => expect(picker.days).to.deep.equal(days))

    it('startDay', () => expect(picker.startDay).to.equal(0))

    it('overlayMonths', () => expect(picker.overlayMonths).to.deep.equal(months.map(month => month.slice(0, 3))))

    it('overlayPlaceholder', () => expect(picker.overlayPlaceholder).to.equal('4-digit year'))

    it('overlayButton', () => expect(picker.overlayButton).to.equal('Submit'))

    it('disableYearOverlay', () => expect(picker.disableYearOverlay).to.be.false)

    it('disableMobile', () => expect(picker.disableMobile).to.be.false)

    it('isMobile', () => expect(picker.isMobile).to.be.false)

    it('alwaysShow', () => expect(picker.alwaysShow).to.be.false)

    it('id', () => expect(picker.id).to.be.undefined)

    it('showAllDates', () => expect(picker.showAllDates).to.be.false)

    it('respectDisabledReadOnly', () => expect(picker.respectDisabledReadOnly).to.be.false)

    it('first', () => expect(picker.first).to.be.undefined)

    it('second', () => expect(picker.second).to.be.undefined)

    it('inlinePosition', () => expect(picker.inlinePosition).to.be.true)
  })

  describe('Datepicker UI (& corresponding changes to instance object properties)', () => {
    describe('Basic visuals and behavior', () => {
      it('has the calendar in the DOM but not visible', () => {
        cy.get('.qs-datepicker-container')
          .should('exist')
          .should('not.be.visible')
      })

      it('should show the calendar when clicking into the input', () => {
        cy.get('[data-cy="input-1"]').click()
        cy.get('.qs-datepicker-container')
          .should('be.visible')
      })

      it('shows the calendar days of the week (top of calendar)', () => {
        cy.get('.qs-squares .qs-day')
          .should('have.length', 7)
          .each(($day, i) => {
            expect($day.text()).to.equal(days[i])
          })
      })

      it('shows the calendar days of the month', () => {
        cy.get('.qs-squares .qs-num')
          .should('have.length.of.at.least', 28)
      })

      it('has the correct number of days on the calendar', () => {
        const numOfDays = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

        cy.get('div.qs-num')
          .should('have.length', numOfDays)
      })

      it(`should show today's date in bold and underlined`, () => {
        cy.get('.qs-current')
          .should('have.text', `${today.getDate()}`)
          .should('have.css', 'font-weight', '700')

        cy.get('.qs-current .qs-num')
          .should('have.css', 'text-decoration', 'underline solid rgb(0, 0, 0)')
      })

      it('should not have bold & underline on other dates', () => {
        cy.get('div.qs-num:not(.qs-empty):not(.qs-current) span')
          .eq(0)
          .should('have.css', 'text-decoration', 'none solid rgb(0, 0, 0)')
      })

      it('should not be showing the overlay', () => {
        cy.get('.qs-overlay')
          .should('have.css', 'opacity', '0')
      })

      it('hides the calendar when clicking outside the calendar and input', () => {
        cy.get('body').click()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })

      it('should progress to the next month when the right arrow is clicked', () => {
        const startingMonth = months[picker.currentMonth]
        const nextMonthIndex = picker.currentMonth === 11 ? 0 : picker.currentMonth + 1
        const nextMonth = months[nextMonthIndex]

        cy.get('[data-cy="input-1"]').click()
        cy.get('.qs-controls .qs-month').should('have.text', startingMonth)
        cy.get('.qs-controls .qs-right').click().then(() => {
          cy.get('.qs-controls .qs-month').should('have.text', nextMonth)
          expect(picker.currentMonthName).to.equal(nextMonth)
          expect(picker.currentMonth).to.equal(nextMonthIndex)
        })
      })

      it('should navigate to the previous month when the left arrow is clicked', () => {
        const startingMonth = months[picker.currentMonth]
        const prevMonthIndex = picker.currentMonth === 0 ? 11 : picker.currentMonth - 1
        const prevMonth = months[prevMonthIndex]

        cy.get('.qs-controls .qs-month').should('have.text', startingMonth)
        cy.get('.qs-controls .qs-left').click().then(() => {
          cy.get('.qs-controls .qs-month').should('have.text', prevMonth)
          expect(picker.currentMonthName).to.equal(prevMonth)
          expect(picker.currentMonth).to.equal(prevMonthIndex)
        })
      })
    })

    describe('Overlay', () => {
      it('should show the overlay when month/year is clicked', () => {
        cy.get('.qs-month-year').click()
        cy.get('.qs-overlay')
          .should('have.css', 'opacity', '1')
      })

      it('should have the correct default placeholder for the overlay input', () => {
        cy.get('.qs-overlay-year')
          .should('have.attr', 'placeholder', '4-digit year')
      })

      it('should have the correct default submit button text', () => {
        cy.get('.qs-submit')
          .should('have.text', 'Submit')
      })

      it('should change the year when the user inputs one and hide the overlay', () => {
        cy.get('.qs-month-year .qs-year').then($year => {
          const currentYear = +$year.text()
          const nextYear = currentYear + 1

          expect(picker.currentYear).to.equal(currentYear)
          cy.get('.qs-overlay-year')
            .type(`${nextYear}{enter}`)
            .then(() => {
              cy.get('.qs-month-year .qs-year')
                .should('have.text', `${nextYear}`)

              // http://bit.ly/2r5CJo4 - This is a current workaround for `.should('be.visible')` on elements with 0 opacity.
              cy.get('.qs-overlay')
                .should('have.css', 'opacity', '0')
              expect(picker.currentYear).to.equal(nextYear)
            })
        })
      })

      it('should change the year via the submit button and hide the overlay', () => {
        cy.get('.qs-month-year .qs-year').click().then($year => {
          const currentYear = +$year.text()
          const nextYear = currentYear + 1

          expect(picker.currentYear).to.equal(currentYear)
          cy.get('.qs-overlay-year')
            .type(`${nextYear}`)
          cy.get('.qs-overlay .qs-submit')
            .click()
            .then(() => {
              cy.get('.qs-month-year .qs-year')
                .should('have.text', `${nextYear}`)
              cy.get('.qs-overlay')
                .should('have.css', 'opacity', '0')
              expect(picker.currentYear).to.equal(nextYear)
            })
        })
      })

      it('should change the month when the user clicks one and hide the overlay', () => {
        cy.get('.qs-month-year .qs-month').then($month => {
          const currentMonthName = $month.text()
          const currentMonthIndex = months.findIndex(month => month === currentMonthName)
          const monthIndexToClick = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1
          const nextMonthName = months[monthIndexToClick]

          expect(picker.currentMonthName).to.equal(currentMonthName)
          cy.get('.qs-month-year').click()
          cy.get('.qs-overlay-month-container .qs-overlay-month')
            .eq(monthIndexToClick)
            .click()
            .then(() => {
              cy.get('.qs-month-year .qs-month')
                .should('have.text', nextMonthName)
              cy.get('.qs-overlay')
                .should('have.css', 'opacity', '0')
              expect(picker.currentMonthName).to.equal(nextMonthName)
            })
        })
      })

      it('should close the overlay when clicking the close button', () => {
        cy.get('.qs-month-year').click().then(() => {
          cy.get('.qs-overlay')
            .should('have.css', 'opacity', '1')
          cy.get('.qs-close').click().then(() => {
            cy.get('.qs-overlay')
            .should('have.css', 'opacity', '0')
          })
        })
      })
    })

    describe('Date changes', () => {
      const dayToSelect = 15

      describe('Selecting a date', () => {
        it('should have a value of undefined for `dateSelected` on the instance object prior to selecting a date', () => {
          expect(picker.dateSelected).to.be.undefined
        })

        it('should populate `dateSelected` on the instance object with the correct date', () => {
          const correctDate = +new Date(picker.currentYear, picker.currentMonth, dayToSelect)

          cy.get(`span.qs-num:contains('${dayToSelect}')`).click().then(() => {
            expect(+picker.dateSelected).to.equal(correctDate)
          })
        })

        it('should populate the input field using the `toDateString` method (default)', () => {
          const dateString = picker.dateSelected.toDateString()

          cy.get('[data-cy="input-1"]')
            .should('have.value', dateString)
        })

        it('should hide the calendar', () => {
          cy.get('.qs-datepicker-container')
            .should('be.hidden')
        })

        it('should show the date selected highlighted when re-opening the calendar', () => {
          cy.get('[data-cy="input-1"]').click()
          cy.get('.qs-active')
            .should('have.length.of', 1)
            .should('have.text', `${dayToSelect}`)
        })
      })

      describe('De-selecting a date', () => {
        it('should have a value of undefined for `dateSelected` on the instance object', () => {
          expect(picker.dateSelected).not.to.be.undefined
          cy.get(`span.qs-num:contains('${dayToSelect}')`).click().then(() => {
            expect(picker.dateSelected).to.be.undefined
          })
        })

        it('should not hide the caledar', () => {
          cy.get('.qs-datepicker-container')
            .should('be.visible')
        })

        it('it should un-highlight the date on the calendar', () => {
          cy.get('.qs-active')
            .should('have.length.of', 0)
        })

        it('should clear the input value', () => {
          cy.get('[data-cy="input-1"]')
            .should('have.value', '')
        })
      })
    })
  })

  describe('Datepicker HTML structure and element types', () => {
    // Ensure the calendar is open before these tests - it should already be open, but just in case.
    before(() => cy.get('[data-cy="input-1"]').click())

    describe('Top-level containers', () => {
      it('should have a div top-level container', () => {
        cy.get('div.qs-datepicker-container')
          .should('have.length', 1)
          .children()
          .should('have.length', 1) // The calendar container.
      })

      it('should have a div calendar container', () => {
        cy.get('div.qs-datepicker')
          .should('exist')
          .should('have.length', 1)
          .children()
          .should('have.length', 3)
      })
    })

    describe('Controls', () => {
      it('should have a div for the controls', () => {
        cy.get('div.qs-controls')
          .should('have.length', 1)
          .children()
          .should('have.length', 3)
      })

      it('should have a div for the arrows', () => {
        cy.get('div.qs-controls div.qs-arrow')
          .should('have.length', 2)
        cy.get('div.qs-arrow')
          .should('have.length', 2)

        cy.get('div.qs-controls div.qs-arrow.qs-left')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('div.qs-arrow.qs-left')
          .should('have.length', 1)

        cy.get('div.qs-controls div.qs-arrow.qs-right')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('div.qs-arrow.qs-right')
          .should('have.length', 1)
      })

      it('should have a div for the month/year', () => {
        cy.get('div.qs-controls div.qs-month-year')
          .should('have.length', 1)
          .children()
          .should('have.length', 2)
      })

      it('should have spans for the month and year', () => {
        cy.get('div.qs-controls div.qs-month-year span.qs-month')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('span.qs-month')
          .should('have.length', 1)

        cy.get('div.qs-controls div.qs-month-year span.qs-year')
          .should('have.length', 1)
          .children()
          .should('have.length', 0)
        cy.get('span.qs-year')
          .should('have.length', 1)
      })
    })

    describe('Calendar days', () => {
      it('should have a div container for the days', () => {
        cy.get('div.qs-squares')
          .should('have.length', 1)
          .children()
          .its('length')
          .should('be.gte', 35)
          .should('be.lte', 49)
      })

      it('should have divs for the days', () => {
        cy.get('div.qs-squares div.qs-square')
          .its('length')
          .should('be.gte', 35)
          .should('be.lte', 49)
        cy.get('div.qs-square')
          .its('length')
          .should('be.gte', 35)
          .should('be.lte', 49)
      })

      it('should have 7 top-level divs for the days of the week', () => {
        cy.get('div.qs-square.qs-day')
          .should('have.length', 7)
      })

      it('only contains <span> children on the numbered days', () => {
        cy.get('div.qs-squares div.qs-square').each($square => {
          if ($square.hasClass('qs-num')) {
            expect($square.children().length).to.equal(1)
            expect($square.find('span.qs-num').length).to.equal(1)
          } else {
            expect($square.children().length).to.equal(0)
          }
        })
      })
    })

    describe('Overlay', () => {
      it('should have a div for the overlay container', () => {
        cy.get('div.qs-overlay')
          .should('have.length', 1)
      })

      it('should have a div container for the year input and close button', () => {
        cy.get('div.qs-overlay div')
          .first()
          .children()
          .should('have.length', 2)
      })

      it('should have a div for the close button', () => {
        cy.get('div.qs-close')
          .should('have.length', 1)
      })

      it('should have a div for the months container', () => {
        cy.get('div.qs-overlay-month-container')
          .should('have.length', 1)
      })

      it('should have 12 divs for the months with a span in each', () => {
        cy.get('.qs-overlay-month')
          .should('have.length', 12)
          .each($month => {
            expect($month.find('span').length).to.equal(1)
          })

        cy.get('span[data-month-num]')
          .should('have.length', 12)
      })

      it('should have a div for the submit button', () => {
        cy.get('div.qs-submit')
          .should('have.length', 1)
      })
    })
  })
})
