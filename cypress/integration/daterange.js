describe('Daterange Pair', () => {
  let win
  let picker1
  let picker2

  before(() => {
    cy.visit('http://localhost:9001')
    cy.window().then(global => {
      win = global
      picker1 = win.dp('[data-cy="input-1"]', { id: 1 })
      picker2 = win.dp('[data-cy="input-2"]', { id: 1 })
    })
  })

  describe('Daterange instance object properties', () => {
    before(() => cy.get('[data-cy="input-1"]').click())

    it('id', () => {
      expect(picker1.id).to.equal(1)
      expect(picker2.id).to.equal(1)
    })

    it('sibling', () => {
      expect(picker1.sibling).to.deep.equal(picker2)
      expect(picker2.sibling).to.deep.equal(picker1)
    })

    it('first', () => {
      expect(picker1.first).to.be.true
      expect(picker2.first).to.be.undefined
    })

    it('second', () => {
      expect(picker2.second).to.be.true
      expect(picker1.second).to.be.undefined
    })
  })

  describe('Daterange UI (& corresponding changes to instance object properties)', () => {

    describe('Basic visuals and behavior', () => {
      it('should only change months on the calendar being navigated', () => {
        cy.get('[data-cy="section-1"] span.qs-month').then($month => {
          // Get the current month name.
          const currentStartMonthName = $month.text()

          // Change the month on the 1st calendar.
          cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {
            cy.get('[data-cy="section-1"] span.qs-month').then($month => {
              // Get the new month name.
              const nextStartMonthName = $month.text()

              expect(nextStartMonthName).not.to.equal(currentStartMonthName)
              cy.get('[data-cy="section-1"] span.qs-month')
                .should('have.text', nextStartMonthName)
                .should('not.have.text', currentStartMonthName)
              cy.get('[data-cy="section-2"] span.qs-month')
                .should('not.have.text', nextStartMonthName)
                .should('have.text', currentStartMonthName)
            })
          })
        })
      })
    })

    describe('Date changes', () => {
      const dayToSelect = 15

      before(() => {
        picker1.remove()
        picker2.remove()
        picker1 = win.dp('[data-cy="input-1"]', { id: 1 })
        picker2 = win.dp('[data-cy="input-2"]', { id: 1 })
        cy.get('[data-cy="input-1"]').click()
      })

      describe('Selecting a date', () => {
        describe('1st instance', () => {
          it('should disable any prior dates on the 2nd instance', () => {
            cy.get(`[data-cy="section-1"] span.qs-num:contains(${dayToSelect})`).click().then(() => {
              cy.get('[data-cy="input-2"]').click().then(() => {
                cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                  .should('have.length', dayToSelect - 1)
              })
            })
          })

          it('should not have any disabled dates on the first instance', () => {
            cy.get('[data-cy="input-1"]').click().then(() => {
              cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                .should('have.length', 0)
            })
          })

          it('should only set `minDate` on the 2nd instance', () => {
            expect(picker1.minDate).to.be.undefined
            expect(picker1.maxDate).to.be.undefined
            expect(+picker2.minDate).to.equal(+new Date(picker1.currentYear, picker1.currentMonth, dayToSelect))
            expect(picker2.maxDate).to.be.undefined
          })
        })
      })
    })
  })

  describe('Instance methods', () => {
    const today = new Date()
    const thisYear = today.getFullYear()
    const thisMonth = today.getMonth()
    const startDayToSelect = 5
    const endDayToSelect = 20

    describe('setDate', () => {
      before(() => cy.get('[data-cy="input-1"]').click())

      // Reset both calendars to the current month & year after all these tests.
      after(() => {
        picker1.setDate(today, true)
        picker2.setDate(today, true)
        picker1.setDate()
        picker2.setDate()
      })

      describe('Start instance', () => {
        it('should programmatically set a date on the start calendar', () => {
          picker1.setDate(new Date(thisYear, thisMonth, startDayToSelect))

          cy.get('[data-cy="section-1"] .qs-active')
            .should('have.length', 1)
            .should('have.text', `${startDayToSelect}`)

          cy.get('[data-cy="section-2"] .qs-active')
            .should('have.length', 0)
        })

        it('should disable previous dates on the end calendar', () => {
          cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
            .should('have.length', startDayToSelect - 1)

          cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
            .should('have.length', 0)
        })

        it('should populate the start input with that date', () => {
          const expectedInputText = new Date(picker1.currentYear, picker1.currentMonth, startDayToSelect).toDateString()

          cy.get('[data-cy="input-1"]')
            .should('have.value', expectedInputText)
          cy.get('[data-cy="input-2"]')
            .should('have.value', '')
        })

        it('should populate `dateSelected` on the start instance object', () => {
          expect(+picker1.dateSelected).to.equal(+new Date(picker1.currentYear, picker1.currentMonth, startDayToSelect))
        })

        it('should navigate the calendar to that date via the second argument', () => {
          const previousMonthName = picker1.currentMonthName
          const previousYear = picker1.currentYear

          picker1.setDate(new Date(picker1.currentYear - 1, picker1.currentMonth - 1, startDayToSelect), true)

          cy.get('[data-cy="section-1"] .qs-month')
            .should('not.have.text', previousMonthName)
          cy.get('[data-cy="section-1"] .qs-year')
            .should('have.text', `${previousYear - 1}`)
          cy.get('[data-cy="section-1"] .qs-active')
            .should('have.text', `${startDayToSelect}`)
          cy.get('.qs-active')
            .should('have.length', 1)
        })

        it('should remove the selected date when called with no argument', () => {
          picker1.setDate()

          expect(picker1.dateSelected).to.be.undefined
          cy.get('.qs-active')
            .should('have.length', 0)
        })

        it('should clear the input when called with no argument', () => {
          cy.get('[data-cy="input-1"]')
            .should('have.text', '')
        })
      })

      describe('End instance', () => {
        // Reset the start calendar to the current month & year.
        before(() => {
          picker1.setDate(today, true) // Navigate back to the current year and month.
          picker1.setDate() // Remove the selected date from the above line.
        })

        it('should programmatically set a date on the end calendar', () => {
          picker2.setDate(new Date(thisYear, thisMonth, endDayToSelect))

          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-active')
              .should('have.length', 1)
              .should('have.text', `${endDayToSelect}`)

            cy.get('[data-cy="section-1"] .qs-active')
              .should('have.length', 0)
          })
        })

        it('should disable future dates on the start calendar', () => {
          const daysInCurrentMonth = new Date(picker2.currentYear, picker2.currentMonth + 1, 0).getDate()
          const daysDisabled = daysInCurrentMonth - endDayToSelect

          cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
            .should('have.length', 0)

          cy.get('[data-cy="input-1"]').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .should('have.length', daysDisabled)
          })
        })

        it('should populate the end input with that date', () => {
          const expectedInputText = new Date(picker2.currentYear, picker2.currentMonth, endDayToSelect).toDateString()

          cy.get('[data-cy="input-2"]')
            .should('have.value', expectedInputText)
          cy.get('[data-cy="input-1"]')
            .should('have.value', '')
        })

        it('should populate `dateSelected` on the end instance object', () => {
          expect(+picker2.dateSelected).to.equal(+new Date(picker2.currentYear, picker2.currentMonth, endDayToSelect))
        })

        it('should navigate the calendar to that date via the second argument', () => {
          const previousMonthName = picker2.currentMonthName
          const previousYear = picker2.currentYear

          picker2.setDate(new Date(picker2.currentYear - 1, picker2.currentMonth - 1, endDayToSelect), true)

          cy.get('[data-cy="section-2"] .qs-month')
            .should('not.have.text', previousMonthName)
          cy.get('[data-cy="section-2"] .qs-year')
            .should('have.text', `${previousYear - 1}`)
          cy.get('[data-cy="section-2"] .qs-active')
            .should('have.text', `${endDayToSelect}`)
          cy.get('.qs-active')
            .should('have.length', 1)
        })

        it('should remove the selected date when called with no argument', () => {
          picker2.setDate()

          expect(picker2.dateSelected).to.be.undefined
          cy.get('.qs-active')
            .should('have.length', 0)
        })

        it('should clear the input when called with no argument', () => {
          cy.get('[data-cy="input-2"]')
            .should('have.text', '')
        })
      })
    })

    describe('setMin', () => {
      before(() => {
        // Ensure the start calendar is open.
        cy.get('[data-cy="input-1"]').click()

        // None of the calendars should have any disabled or active dates at this point.
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
        cy.get('.qs-active')
          .should('have.length', 0)
        expect(picker1.minDate).to.be.undefined
        expect(picker1.maxDate).to.be.undefined
        expect(picker2.minDate).to.be.undefined
        expect(picker2.maxDate).to.be.undefined
      })

      describe('Start instance', () => {
        it('should set the `minDate` property on both instances', () => {
          const minDate = new Date(picker1.currentYear, picker1.currentMonth, startDayToSelect)

          picker1.setMin(minDate)
          expect(+picker1.minDate).to.equal(+minDate)
          expect(+picker2.minDate).to.equal(+minDate)
        })

        it('should disable dates prior to the provided value (including prev months) on the start calendar', () => {
          cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
            .should('have.length', startDayToSelect - 1)

          cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {
            const numOfDaysInMonth = new Date(picker1.currentYear, picker1.currentMonth + 1, 0).getDate()

            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .should('have.length', numOfDaysInMonth)
          })
        })

        it('should disable dates prior to the provided value (including prev months) on the end calendar', () => {
          // Bring up the end calendar since the start calendar was previously showing.
          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
              .should('have.length', startDayToSelect - 1)

            cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {
              const numOfDaysInMonth = new Date(picker2.currentYear, picker2.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInMonth)
            })
          })
        })

        it('should not disable dates on either calendar in future months', () => {
          cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click().then(() => {

              // Check next month on the end calendar.
              cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                .should('have.length', 0)

              // Reset the end calendar.
              cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click()

              // Bring up the start calendar.
              cy.get('[data-cy="input-1"]').click().then(() => {
                cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {
                  cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {

                    // Check next month on the start calendar.
                    cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                      .should('have.length', 0)

                    // Reset the start calendar.
                    cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click()
                  })
                })
              })
            })
          })
        })

        it('should prevent disabled dates from being selected on start calendar', () => {
          // The start calendar is open from the previous test.
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
            .first()
            .should('have.text', '1')
            .click()
            .then(() => {
              expect(picker1.dateSelected).to.be.undefined

              cy.get('[data-cy="section-1"] .qs-active')
                .should('have.length', 0)
            })
        })

        it('should prevent disabled dates from being selected on end calendar', () => {
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          // Open the end calendar.
          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
              .first()
              .should('have.text', '1')
              .click()
              .then(() => {
                expect(picker2.dateSelected).to.be.undefined

                cy.get('[data-cy="section-2"] .qs-active')
                  .should('have.length', 0)
              })
          })
        })

        it('should remove the min selectable date from both instances when called with no argument', () => {
          expect(picker1.minDate).not.to.be.undefined
          expect(picker2.minDate).not.to.be.undefined

          picker1.setMin()

          expect(picker1.minDate).to.be.undefined
          expect(picker2.minDate).to.be.undefined
          cy.get('.qs-square.qs-disabled')
            .should('have.length', 0)
        })
      })

      describe('End instance', () => {
        it('should set the `minDate` property on both instances', () => {
          const minDate = new Date(picker2.currentYear, picker2.currentMonth, startDayToSelect)

          // Both instances should not have anything set at this point.
          expect(picker1.minDate).to.be.undefined
          expect(picker2.minDate).to.be.undefined

          picker2.setMin(minDate)
          expect(+picker1.minDate).to.equal(+minDate)
          expect(+picker2.minDate).to.equal(+minDate)
        })

        it('should disable dates prior to the provided value (including prev months) on the end calendar', () => {
          // Ensure the end calendar is showing.
          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
              .should('have.length', startDayToSelect - 1)

            cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {
              const numOfDaysInMonth = new Date(picker2.currentYear, picker2.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInMonth)
            })
          })
        })

        it('should disable dates prior to the provided value (including prev months) on the start calendar', () => {
          // Bring up the start calendar since the end calendar was previously showing.
          cy.get('[data-cy="input-1"]').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .should('have.length', startDayToSelect - 1)

            cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {
              const numOfDaysInMonth = new Date(picker1.currentYear, picker1.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInMonth)
            })
          })
        })

        it('should not disable dates on either calendar in future months', () => {
          cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {

              // Check next month on the start calendar.
              cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                .should('have.length', 0)

              // Reset the start calendar.
              cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click()

              // Bring up the end calendar.
              cy.get('[data-cy="input-2"]').click().then(() => {
                cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click().then(() => {
                  cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click().then(() => {

                    // Check next month on the end calendar.
                    cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                      .should('have.length', 0)

                    // Reset the end calendar.
                    cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click()
                  })
                })
              })
            })
          })
        })

        it('should prevent disabled dates from being selected on end calendar', () => {
          // The end calendar is open from the previous test.
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
            .first()
            .should('have.text', '1')
            .click()
            .then(() => {
              expect(picker2.dateSelected).to.be.undefined

              cy.get('[data-cy="section-2"] .qs-active')
                .should('have.length', 0)
            })
        })

        it('should prevent disabled dates from being selected on start calendar', () => {
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          // Open the start calendar.
          cy.get('[data-cy="input-1"]').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .first()
              .should('have.text', '1')
              .click()
              .then(() => {
                expect(picker1.dateSelected).to.be.undefined

                cy.get('[data-cy="section-1"] .qs-active')
                  .should('have.length', 0)
              })
          })
        })

        it('should remove the min selectable date from both instances when called with no argument', () => {
          expect(picker1.minDate).not.to.be.undefined
          expect(picker2.minDate).not.to.be.undefined

          picker2.setMin()

          expect(picker1.minDate).to.be.undefined
          expect(picker2.minDate).to.be.undefined
          cy.get('.qs-square.qs-disabled')
            .should('have.length', 0)
        })
      })
    })

    describe('setMax', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
          .then(() => {
            expect(picker1.maxDate).to.be.undefined
            expect(picker2.maxDate).to.be.undefined
          })
      })

      let numOfDaysInMonth

      describe('Start instance', () => {
        it('should set the `maxDate` property on both instances', () => {
          numOfDaysInMonth = new Date(picker1.currentYear, picker1.currentMonth + 1, 0).getDate()
          const maxDate = new Date(picker1.currentYear, picker1.currentMonth, endDayToSelect)

          picker1.setMax(maxDate)
          expect(+picker1.maxDate).to.equal(+maxDate)
          expect(+picker2.maxDate).to.equal(+maxDate)
        })

        it('should disable dates after the provided value (including following months) on the start calendar', () => {
          // Ensure the start calendar is showing.
          cy.get('[data-cy="input-1"]').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .should('have.length', numOfDaysInMonth - endDayToSelect)

            cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {
              const numOfDaysInNextMonth = new Date(picker1.currentYear, picker1.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInNextMonth)
            })
          })
        })

        it('should disable dates after the provided value (including following months) on the end calendar', () => {
          // Bring up the end calendar since the start calendar was previously showing.
          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
              .should('have.length', numOfDaysInMonth - endDayToSelect)

            cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click().then(() => {
              const numOfDaysInNextMonth = new Date(picker2.currentYear, picker2.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInNextMonth)
            })
          })
        })

        it('should not disable dates on either calendar in past months', () => {
          cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {

              // Check previous month on the end calendar.
              cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                .should('have.length', 0)

              // Reset the end calendar.
              cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click()

              // Bring up the start calendar.
              cy.get('[data-cy="input-1"]').click().then(() => {
                cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {
                  cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {

                    // Check previous month on the start calendar.
                    cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                      .should('have.length', 0)

                    // Reset the start calendar.
                    cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click()
                  })
                })
              })
            })
          })
        })

        it('should prevent disabled dates from being selected on start calendar', () => {
          // The start calendar is open from the previous test.
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
            .first()
            .should('have.text', `${endDayToSelect + 1}`)
            .click()
            .then(() => {
              expect(picker1.dateSelected).to.be.undefined

              cy.get('[data-cy="section-1"] .qs-active')
                .should('have.length', 0)
            })
        })

        it('should prevent disabled dates from being selected on end calendar', () => {
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          // Open the end calendar.
          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
              .first()
              .should('have.text', `${endDayToSelect + 1}`)
              .click()
              .then(() => {
                expect(picker2.dateSelected).to.be.undefined

                cy.get('[data-cy="section-2"] .qs-active')
                  .should('have.length', 0)
              })
          })
        })

        it('should remove the max selectable date from both instances when called with no argument', () => {
          expect(picker1.maxDate).not.to.be.undefined
          expect(picker2.maxDate).not.to.be.undefined

          picker1.setMax()

          expect(picker1.maxDate).to.be.undefined
          expect(picker2.maxDate).to.be.undefined
          cy.get('.qs-square.qs-disabled')
            .should('have.length', 0)
        })
      })

      describe('End instance', () => {
        before(() => {
          expect(picker1.maxDate).to.be.undefined
          expect(picker2.maxDate).to.be.undefined
        })

        it('should set the `maxDate` property on both instances', () => {
          const maxDate = new Date(picker2.currentYear, picker2.currentMonth, endDayToSelect)

          picker2.setMax(maxDate)
          expect(+picker1.maxDate).to.equal(+maxDate)
          expect(+picker2.maxDate).to.equal(+maxDate)
        })

        it('should disable dates after the provided value (including following months) on the end calendar', () => {
          // Bring up the end calendar since the start calendar was previously showing.
          cy.get('[data-cy="input-2"]').click().then(() => {
            cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
              .should('have.length', numOfDaysInMonth - endDayToSelect)

            cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click().then(() => {
              const numOfDaysInNextMonth = new Date(picker2.currentYear, picker2.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInNextMonth)
            })
          })
        })

        it('should disable dates after the provided value (including following months) on the start calendar', () => {
          // Ensure the start calendar is showing.
          cy.get('[data-cy="input-1"]').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .should('have.length', numOfDaysInMonth - endDayToSelect)

            cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click().then(() => {
              const numOfDaysInNextMonth = new Date(picker1.currentYear, picker1.currentMonth + 1, 0).getDate()

              cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                .should('have.length', numOfDaysInNextMonth)
            })
          })
        })

        it('should not disable dates on either calendar in past months', () => {
          cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {

              // Check previous month on the start calendar.
              cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
                .should('have.length', 0)

              // Reset the start calendar.
              cy.get('[data-cy="section-1"] .qs-arrow.qs-right').click()

              // Bring up the end calendar.
              cy.get('[data-cy="input-2"]').click().then(() => {
                cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {
                  cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {

                    // Check previous month on the end calendar.
                    cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
                      .should('have.length', 0)

                    // Reset the end calendar.
                    cy.get('[data-cy="section-2"] .qs-arrow.qs-right').click()
                  })
                })
              })
            })
          })
        })

        it('should prevent disabled dates from being selected on end calendar', () => {
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          cy.get('[data-cy="section-2"] .qs-square.qs-disabled')
            .first()
            .should('have.text', `${endDayToSelect + 1}`)
            .click()
            .then(() => {
              expect(picker2.dateSelected).to.be.undefined

              cy.get('[data-cy="section-2"] .qs-active')
                .should('have.length', 0)
            })
        })

        it('should prevent disabled dates from being selected on start calendar', () => {
          // The start calendar is open from the previous test.
          expect(picker1.dateSelected).to.be.undefined
          expect(picker2.dateSelected).to.be.undefined

          cy.get('[data-cy="input-1"]').click().then(() => {
            cy.get('[data-cy="section-1"] .qs-square.qs-disabled')
              .first()
              .should('have.text', `${endDayToSelect + 1}`)
              .click()
              .then(() => {
                expect(picker1.dateSelected).to.be.undefined

                cy.get('[data-cy="section-1"] .qs-active')
                  .should('have.length', 0)
              })
          })
        })

        it('should remove the max selectable date from both instances when called with no argument', () => {
          expect(picker1.maxDate).not.to.be.undefined
          expect(picker2.maxDate).not.to.be.undefined

          picker2.setMax()

          expect(picker1.maxDate).to.be.undefined
          expect(picker2.maxDate).to.be.undefined
          cy.get('.qs-square.qs-disabled')
            .should('have.length', 0)
        })
      })
    })

    describe('show', () => {
      before(() => {
        cy.get('body').click().then(() => {
          cy.get('[data-cy="section-1"] .qs-datepicker-container')
            .should('not.be.visible')
          cy.get('[data-cy="section-2"] .qs-datepicker-container')
            .should('not.be.visible')
        })
      })

      it('Start instance - should show the calendar when called', () => {
        picker1.show()
        cy.get('[data-cy="section-1"] .qs-datepicker-container')
          .should('be.visible')
      })

      it('End instance - should show the calendar when called', () => {
        picker2.show()
        cy.get('[data-cy="section-2"] .qs-datepicker-container')
          .should('be.visible')
      })
    })

    describe('hide', () => {
      it('Start instance - should hide the calendar when called', () => {
        picker1.hide()
        cy.get('[data-cy="section-1"] .qs-datepicker-container')
          .should('not.be.visible')
      })

      it('End instance - should hide the calendar when called', () => {
        picker2.hide()
        cy.get('[data-cy="section-2"] .qs-datepicker-container')
          .should('not.be.visible')
      })
    })

    describe('remove', () => {
      before(() => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 2)
      })

      describe('Start instance', () => {
        it('should completely nuke the instance object', () => {
          const originalNumOfProps = Object.keys(picker1).length
          picker1.remove()
          const numOfProps = Object.keys(picker1).length

          expect(originalNumOfProps).to.be.gt(0)
          expect(numOfProps).to.equal(0)
        })

        it('should remove the calendar from the DOM', () => {
          cy.get('[data-cy="section-1"] .qs-datepicker-container')
            .should('have.length', 0)
        })
      })

      describe('End instance', () => {
        it('should completely nuke the instance object', () => {
          const originalNumOfProps = Object.keys(picker2).length
          picker2.remove()
          const numOfProps = Object.keys(picker2).length

          expect(originalNumOfProps).to.be.gt(0)
          expect(numOfProps).to.equal(0)
        })

        it('should remove the calendar from the DOM', () => {
          cy.get('[data-cy="section-2"] .qs-datepicker-container')
            .should('have.length', 0)
        })
      })
    })
  })
})
