describe('Callback functions', () => {
  let dp

  before(() => {
    cy.visit('http://localhost:9001')
    cy.window().then(win => {
      dp = win.dp
    })
  })

  describe('Single instance callbacks', () => {
    describe('onSelect', () => {
      let onSelect
      let picker

      after(() => picker.remove())

      it('should run the provided callback function after selecting a date', () => {
        onSelect = cy.stub()
        picker = dp('[data-cy="input-1"]', { onSelect })

        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onSelect).not.to.be.called

          cy.get('.qs-num').first().click().then(() => {
            expect(onSelect).to.be.calledOnce
          })
        })
      })

      it('should be called with the instance and date when being selected', () => {
        expect(onSelect).to.be.calledOnce
        expect(onSelect).to.be.calledWith(picker, new Date(picker.currentYear, picker.currentMonth, 1))
      })

      it('should run the provided callback function after de-selecting a date', () => {
        cy.get('[data-cy="input-1"]').click().then(() => {
          cy.get('.qs-num').first().click().then(() => {
            expect(onSelect).to.be.calledTwice
          })
        })
      })

      it('should be called with the instance and undefined when un-selecting a date', () => {
        expect(onSelect).to.be.calledTwice
        expect(onSelect).to.be.calledWith(picker, undefined)
      })

      it('should not be called when using instance methods to manually select / un-select a date', () => {
        picker.setDate(new Date(picker.currentYear, picker.currentMonth, 15))
        expect(onSelect).to.be.calledTwice

        picker.setDate()
        expect(onSelect).to.be.calledTwice
      })
    })

    describe('onShow', () => {
      let onShow
      let picker

      after(() => picker.remove())

      it('should run when the calendar is shown', () => {
        onShow = cy.stub()
        picker = dp('[data-cy="input-1"]', { onShow })

        expect(onShow).not.to.be.called
        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onShow).to.be.calledOnce
        })
      })

      it('should be called with the instance as the argument', () => {
        expect(onShow).to.be.calledWith(picker)
      })

      it('should not be called when the calendar is hidden', () => {
        cy.get('body').click().then(() => {
          expect(onShow).to.be.calledOnce
        })
      })

      it('should be called when using the `show` instance method', () => {
        picker.show()
        expect(onShow).to.be.calledTwice
        expect(onShow).to.be.calledWith(picker)
      })
    })

    describe('onHide', () => {
      let onHide
      let picker

      after(() => picker.remove())

      it('should not run when the calendar is shown', () => {
        onHide = cy.stub()
        picker = dp('[data-cy="input-1"]', { onHide })

        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onHide).not.to.be.called
        })
      })

      it('should run when the calendar is hidden', () => {
        cy.get('body').click().then(() => {
          expect(onHide).to.be.calledOnce
        })
      })

      it('should be called with the instance as an argument', () => {
        expect(onHide).to.be.calledWith(picker)
      })

      it('should run when the `hide` method is called', () => {
        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onHide).to.be.calledOnce
          picker.hide()
          expect(onHide).to.be.calledTwice
          expect(onHide).to.be.calledWith(picker)
        })
      })
    })

    describe('onMonthChange', () => {
      let onMonthChange
      let picker

      before(() => cy.get('body').click())
      after(() => picker.remove())

      it('should run when the month arrows are used to change the month', () => {
        onMonthChange = cy.stub()
        picker = dp('[data-cy="input-1"]', { onMonthChange })

        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onMonthChange).not.to.be.called

          cy.get('.qs-arrow.qs-left').click().then(() => {
            expect(onMonthChange).to.have.callCount(1)

            cy.get('.qs-arrow.qs-right').click().then(() => {
              expect(onMonthChange).to.have.callCount(2)
            })
          })
        })
      })

      it('should be called with the instance as an argument', () => {
        expect(onMonthChange).to.be.calledWith(picker)
      })

      it('should not be called when the `setDate` instance method is called', () => {
        picker.setDate(new Date(picker.currentYear + 1, picker.currentMonth + 1, 1), true)
        expect(onMonthChange).to.have.callCount(2)
      })
    })
  })

  describe('Daterange callbacks', () => {
    describe('onSelect', () => {})

    describe('onShow', () => {})

    describe('onHide', () => {})

    describe('onMonthChange', () => {})
  })
})
