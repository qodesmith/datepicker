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

      it('should be called with the instance and undefined when de-selecting a date', () => {
        expect(onSelect).to.be.calledTwice
        expect(onSelect).to.be.calledWith(picker, undefined)
      })

      it('should not be called when using instance methods to manually select / de-select a date', () => {
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
    describe('onSelect', () => {
      let picker1
      let picker2
      let onSelect1
      let onSelect2

      after(() => {
        picker1.remove()
        picker2.remove()
      })

      it('should run the provided callback function from the correct calendar after selecting a date', () => {
        onSelect1 = cy.stub()
        onSelect2 = cy.stub()

        picker1 = dp('[data-cy="input-1"]', { id: 1, alwaysShow: 1, onSelect: onSelect1 })
        picker2 = dp('[data-cy="input-2"]', { id: 1, alwaysShow: 1, onSelect: onSelect2 })

        cy.get('[data-cy="section-1"] div.qs-num:contains("15")').click().then(() => {
          expect(onSelect1).to.have.callCount(1)
          expect(onSelect2).to.have.callCount(0)

          cy.get('[data-cy="section-2"] div.qs-num:contains("20")').click().then(() => {
            expect(onSelect1).to.have.callCount(1)
            expect(onSelect2).to.have.callCount(1)
          })
        })
      })

      it('should be called with the instance and date when being selected', () => {
        expect(onSelect1).to.be.calledWith(picker1, new Date(picker1.currentYear, picker1.currentMonth, 15))
        expect(onSelect2).to.be.calledWith(picker2, new Date(picker2.currentYear, picker2.currentMonth, 20))
      })

      it('should run the provided callback function from the correct calendar after de-selecting a date', () => {
        cy.get('[data-cy="section-1"] div.qs-num:contains("15")').click().then(() => {
          expect(onSelect1).to.have.callCount(2)
          expect(onSelect2).to.have.callCount(1)

          cy.get('[data-cy="section-2"] div.qs-num:contains("20")').click().then(() => {
            expect(onSelect1).to.have.callCount(2)
            expect(onSelect2).to.have.callCount(2)
          })
        })
      })

      it('should be called with the instance and undefined when de-selecting a date', () => {
        expect(onSelect1).to.be.calledWith(picker1, undefined)
        expect(onSelect2).to.be.calledWith(picker2, undefined)
      })

      it('should not be called when using instance methods to manually select / de-select a date', () => {
        picker1.setDate(new Date(picker1.currentYear, picker1.currentMonth, 11))
        picker2.setDate(new Date(picker2.currentYear, picker1.currentMonth, 18))
        picker1.setDate()
        picker2.setDate()
        expect(onSelect1).to.have.callCount(2)
        expect(onSelect2).to.have.callCount(2)
      })
    })

    describe('onShow', () => {
      let picker1
      let picker2
      let onShow1
      let onShow2

      after(() => {
        picker1.remove()
        picker2.remove()
      })

      it('should run the provided callback function from the correct calendar after showing the calendar', () => {
        onShow1 = cy.stub()
        onShow2 = cy.stub()

        picker1 = dp('[data-cy="input-1"]', { id: 1, onShow: onShow1 })
        picker2 = dp('[data-cy="input-2"]', { id: 1, onShow: onShow2 })

        expect(onShow1).to.have.callCount(0)
        expect(onShow2).to.have.callCount(0)

        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onShow1).to.have.callCount(1)
          expect(onShow2).to.have.callCount(0)

          cy.get('[data-cy="input-2"]').click().then(() => {
            expect(onShow1).to.have.callCount(1)
            expect(onShow2).to.have.callCount(1)
          })
        })
      })

      it('should be called with the instance', () => {
        expect(onShow1).to.be.calledWith(picker1)
        expect(onShow2).to.be.calledWith(picker2)
      })

      it('should be called when using the `show` instance method', () => {
        cy.get('body').click().then(() => {
          picker1.show()
          picker2.show()

          expect(onShow1).to.be.calledWith(picker1)
          expect(onShow2).to.be.calledWith(picker2)
          expect(onShow1).to.have.callCount(2)
          expect(onShow2).to.have.callCount(2)
        })
      })
    })

    describe('onHide', () => {
      let picker1
      let picker2
      let onHide1
      let onHide2

      after(() => {
        picker1.remove()
        picker2.remove()
      })

      it('should run the provided callback function from the correct calendar after hiding the calendar', () => {
        onHide1 = cy.stub()
        onHide2 = cy.stub()

        picker1 = dp('[data-cy="input-1"]', { id: 1, onHide: onHide1 })
        picker2 = dp('[data-cy="input-2"]', { id: 1, onHide: onHide2 })

        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onHide1).to.have.callCount(0)
          expect(onHide2).to.have.callCount(0)

          cy.get('[data-cy="input-2"]').click().then(() => {
            expect(onHide1).to.have.callCount(1)
            expect(onHide2).to.have.callCount(0)

            cy.get('body').click().then(() => {
              expect(onHide1).to.have.callCount(1)
              expect(onHide2).to.have.callCount(1)
            })
          })
        })
      })

      it('should be called with the instance', () => {
        expect(onHide1).to.be.calledWith(picker1)
        expect(onHide2).to.be.calledWith(picker2)
      })

      it('should be called when using the `hide` instance method', () => {
        cy.get('[data-cy="input-1"]').click().then(() => {
          expect(onHide1).to.have.callCount(1)
          picker1.hide()
          expect(onHide1).to.have.callCount(2)
          expect(onHide1).to.be.calledWith(picker1)

          cy.get('[data-cy="input-2"]').click().then(() => {
            expect(onHide2).to.have.callCount(1)
            picker2.hide()
            expect(onHide2).to.have.callCount(2)
            expect(onHide2).to.be.calledWith(picker2)
          })
        })
      })
    })

    describe('onMonthChange', () => {
      let picker1
      let picker2
      let onMonthChange1
      let onMonthChange2

      after(() => {
        picker1.remove()
        picker2.remove()
      })

      it('should run the provided callback function from the correct calendar after changing the month', () => {
        onMonthChange1 = cy.stub()
        onMonthChange2 = cy.stub()

        picker1 = dp('[data-cy="input-1"]', { id: 1, alwaysShow: 1, onMonthChange: onMonthChange1 })
        picker2 = dp('[data-cy="input-2"]', { id: 1, alwaysShow: 1, onMonthChange: onMonthChange2 })

        expect(onMonthChange1).to.have.callCount(0)
        expect(onMonthChange2).to.have.callCount(0)

        cy.get('[data-cy="section-1"] .qs-arrow.qs-left').click().then(() => {
          expect(onMonthChange1).to.have.callCount(1)
          expect(onMonthChange2).to.have.callCount(0)

          cy.get('[data-cy="section-2"] .qs-arrow.qs-left').click().then(() => {
            expect(onMonthChange1).to.have.callCount(1)
            expect(onMonthChange2).to.have.callCount(1)
          })
        })
      })

      it('should be called with the instance', () => {
        expect(onMonthChange1).to.be.calledWith(picker1)
        expect(onMonthChange2).to.be.calledWith(picker2)
      })

      it('should not be called when using the `setDate` instance method', () => {
        picker1.setDate(new Date(picker1.currentYear, picker1.currentMonth - 1, 5))
        picker1.setDate(new Date(picker1.currentYear, picker1.currentMonth - 1, 5, true))
        expect(onMonthChange1).to.have.callCount(1)

        picker2.setDate(new Date(picker2.currentYear, picker2.currentMonth, 15))
        picker2.setDate(new Date(picker2.currentYear, picker2.currentMonth, 16, true))
        expect(onMonthChange2).to.have.callCount(1)
      })
    })
  })
})
