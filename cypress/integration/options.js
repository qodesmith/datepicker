import selectors from '../selectors'

const {
  singleDatepickerInput,
  single,
  range,
  common,
  singleDatepickerInputParent,
} = selectors

describe('User options', function() {
  beforeEach(function() {
    cy.visit('http://localhost:9001')

    /*
      We can't simply import the datepicker library up at the top because it will not
      be associated with the correct window object. Instead, we can use a Cypress alias
      that will expose what we want on `this`, so long as we avoid using arrow functions.
      This is possible because datepicker is assigned a value on the window object in `sandbox.js`.
    */
    cy.window().then(global => cy.wrap(global.datepicker).as('datepicker'))
  })

  describe('Customizations', function() {
    describe('formatter', function() {
      it('should customize the input value when a date is selected', function() {
        const expectedValue = 'datepicker rulez'
        const options = {
          formatter: (input, date, instance) => {
            input.value = expectedValue
          }
        }
        this.datepicker(singleDatepickerInput, options)

        cy.get(singleDatepickerInput).should('have.value', '').click()
        cy.get(`${single.calendarContainer} [data-direction="0"]`).first().click()
        cy.get(singleDatepickerInput).should('have.value', expectedValue)
      })

      it('should be called with the correct arguments', function() {
        let picker
        const today = new Date()
        const selectedDate = new Date(today.getFullYear(), today.getMonth(), 1)
        const options = {
          formatter: (input, date, instance) => {
            expect(input, '1st arg to `formatter` should be the input').to.eq(instance.el)

            /*
              We can't use `instanceof Date` because `Date` is a different constructor
              than the one on the window object that Cypress uses. Essentially,
              we're dealing with 2 different window object. So it's easier to just do
              the whole toString thingy.
            */
            expect(({}).toString.call(date), '2nd arg to `formatter` should be the date selected').to.eq('[object Date]')
            expect(+instance.dateSelected, 'the date should === instance.dateSelected').to.eq(+date)
            expect(+selectedDate, 'the selected date should have the correct value').to.eq(+date)
            expect(instance, '3rd arg to `formatter` should be the instance').to.eq(picker)
          }
        }

        picker = this.datepicker(singleDatepickerInput, options)
        cy.get(singleDatepickerInput).click()
        cy.get(`${single.calendarContainer} [data-direction="0"]`).first().click()
      })

      it(`should not be called if the picker doesn't have an associated input`, function() {
        const options = { formatter: () => {} }
        const spy = cy.spy(options, 'formatter')
        this.datepicker(singleDatepickerInputParent, options)

        cy.get(singleDatepickerInputParent).click({ force: true })
        cy.get(`${common.squaresContainer} [data-direction="0"]`).first().click().then(() => {
          expect(spy).not.to.be.called
        })
      })
    })

    describe('position', function() {
      it('should position the calendar relative to the input - default (bottom left)', function() {
        this.datepicker(singleDatepickerInput)

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.greaterThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(left).to.equal('0px')
        })
      })

      it('should position the calendar relative to the input - bottom left', function() {
        this.datepicker(singleDatepickerInput, {position: 'bl'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.greaterThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(left).to.equal('0px')
        })
      })

      it('should position the calendar relative to the input - bottom right', function() {
        this.datepicker(singleDatepickerInput, {position: 'br'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.greaterThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(+left.replace('px', '')).to.be.greaterThan(0)
        })
      })

      it('should position the calendar relative to the input - top left', function() {
        this.datepicker(singleDatepickerInput, {position: 'tl'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.lessThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(left).to.equal('0px')
        })
      })

      it('should position the calendar relative to the input - top right', function() {
        this.datepicker(singleDatepickerInput, {position: 'tr'})

        cy.get(singleDatepickerInput).click()
        cy.get(single.calendarContainer).should('have.attr', 'style')
        cy.get(single.calendarContainer).then($calendarContainer => {
          const {top, right, bottom, left} = $calendarContainer[0].style

          expect(+top.replace('px', '')).to.be.lessThan(0)
          expect(right).to.equal('')
          expect(bottom).to.equal('')
          expect(+left.replace('px', '')).to.be.greaterThan(0)
        })
      })
    })
  })
})
