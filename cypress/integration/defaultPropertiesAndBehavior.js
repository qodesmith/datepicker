import selectors from '../selectors'
import pickerProperties from '../pickerProperties'

const {
  singleDatepickerInput,
  daterangeInputStart,
  daterangeInputEnd,
} = selectors
const { singleDatepickerProperties, getDaterangeProperties } = pickerProperties

/*
  TODO: add a test for the navigate method.
*/

// Temporary while writing new tests
const x = { describe: () => {} }

function checkPickerProperties(picker, isDaterange, id) {
  return function({ property, defaultValue, domElement, selector, deepEqual, isFunction, notOwnProperty }) {
    const value = picker[property]

    if (!notOwnProperty) {
      // The property should exist on the picker.
      expect(picker, `(checkPickerProperties) isDaterange<${isDaterange}>`).to.haveOwnProperty(property)
    }

    // Special case for id.
    if (isDaterange && property === 'id') {
      expect(value, 'id').to.equal(id)

    // First get the dom element, then ensure it has the correct default value.
    } else if (domElement) {
      cy.get(selector).then(elements => {
        expect(value, property).to.equal(defaultValue(elements))
        expect(elements, selector).to.have.lengthOf(1)
      })

    // Ensure the value is a function.
    } else if (isFunction) {
      expect(value, property).to.be.a('function')

    // The property should have the correct default value.
    } else if (deepEqual) {
      expect(value, property).to.deep.equal(defaultValue)
    } else {
      expect(value, property).to.equal(defaultValue)
    }
  }
}

function testDomStructure(pickerType, selectorObj) {
  const date = new Date()
  const multiplier = pickerType === 'single' ? 1 : 2

  cy.get(selectorObj.calendarContainer).as('calendarContainer')
  cy.get(selectorObj.calendar).as('calendar')
  cy.get(selectorObj.controls).as('controls')
  cy.get(`${selectorObj.controls} .qs-arrow`).as('arrows')
  cy.get(`${selectorObj.controls} .qs-month-year`).as('monthYear')
  cy.get(`${selectorObj.controls} .qs-month`).as('month')
  cy.get(`${selectorObj.controls} .qs-year`).as('year')
  cy.get(selectorObj.squaresContainer).as('squaresContainer')
  cy.get(`${selectorObj.squaresContainer} ${selectors.common.everySquare}`).as('squares')
  cy.get(selectorObj.overlay).as('overlay')
  cy.get(selectorObj.overlayInputContainer).as('overlayInputContainer')
  cy.get(`${selectorObj.overlayInputContainer} .qs-overlay-year`).as('overlayYearInput')
  cy.get(`${selectorObj.overlayInputContainer} .qs-close`).as('overlayClose')
  cy.get(selectorObj.overlayMonthContainer).as('overlayMonthContainer')


  // calendarContainer
  cy.get(selectors.common.container).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@calendarContainer').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@calendarContainer').children().should('have.length', 1)
  cy.get('@calendarContainer').should('have.attr', 'class', 'qs-datepicker-container qs-hidden')

  // calendar
  cy.get(selectors.common.calendar).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@calendar').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@calendar').children().should('have.length', 3)
  cy.get('@calendar').should('have.attr', 'class', 'qs-datepicker')

  // calendar => controls
  cy.get(selectors.common.controls).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@controls').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@controls').children().should('have.length', 3)
  cy.get('@controls').should('have.attr', 'class', 'qs-controls')

  // calendar => controls => arrows
  cy.get(`${selectors.common.controls} .qs-arrow`).should('have.length', 2 * multiplier) // Searching the whole document.
  cy.get('@arrows').should('have.length', 2) // Searching within the specified section of the document.
  cy.get('@arrows').then($arrows => {
    cy.get($arrows[0]).children().should('have.length', 0)
    cy.get($arrows[1]).children().should('have.length', 0)

    expect($arrows[0], '@arrows - left').to.have.attr('class', 'qs-arrow qs-left')
    expect($arrows[1], '@arrows - right').to.have.attr('class', 'qs-arrow qs-right')
  })

  // calendar => controls => month/year
  cy.get(`${selectors.common.controls} .qs-month-year`).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@monthYear').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@monthYear').children().should('have.length', 2)
  cy.get('@monthYear').should('have.attr', 'class', 'qs-month-year')

  // calendar => controls => month/year => month
  cy.get(`${selectors.common.controls} .qs-month`).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@month').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@month').children().should('have.length', 0)
  cy.get('@month').should('have.text', pickerProperties.months[date.getMonth()])
  cy.get('@month').should('have.attr', 'class', 'qs-month')

  // calendar => controls => month/year => year
  cy.get(`${selectors.common.controls} .qs-year`).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@year').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@year').children().should('have.length', 0)
  cy.get('@year').should('have.text', date.getFullYear())
  cy.get('@year').should('have.attr', 'class', 'qs-year')

  // calendar => squares
  cy.get(selectors.common.squaresContainer).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@squaresContainer').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@squaresContainer').should('have.attr', 'class', 'qs-squares')

  // calendar => squares => various types of squares
  cy.get('@squaresContainer').children().then($allSquares => {
    cy.get(selectors.common.everySquare).should('have.length', $allSquares.length * multiplier)

    /*
      It's a little hard to test the correct number of total squares since there's a lot
      of logic involved. I don't want to simply repeat the logic in the library, defeating the
      purpose of testing.

      https://github.com/qodesmith/datepicker/issues/86
      One thing we can do to guage if we have extra days is to test the 1st 7 and last 7 calendar days.
      If any one of those sets are completely empty, we've got an extra row that shouldn't be there.
    */

    const arrayOfSquares = Array.from($allSquares)

    // 1st 7 days - NOT the days of the week header.
    const firstWeekHasContent = arrayOfSquares.slice(7, 14).some(square => square.textContent === '1')

    // Last 7 days.
    const lastWeekHasContent = arrayOfSquares.slice(-7).some(square => {
      // The last day of any month will be on of these numbers. One of them should be found in the last week.
      return ['28', '29', '30', '31'].some(num => square.textContent === num)
    })

    expect(firstWeekHasContent, '@squaresContainer - First week has content').to.equal(true)
    expect(lastWeekHasContent, '@squaresContainer - Last week has content').to.equal(true)
  })
  cy.get('@squares').filter('.qs-day')
    .should('have.length', 7)
    .should('have.attr', 'class', 'qs-square qs-day')
    .then($qsDays => {
      const message = '@squaresContainer/.qs-day'
      $qsDays.each((i, qsDay) => {
        pickerProperties.days.forEach(day => {
          expect(qsDay.classList.contains(day), `${message} (day of week class: ${day})`).to.equal(false)
        })
        expect(qsDay.textContent, message).to.be.oneOf(pickerProperties.days)
        expect(qsDay, message).to.not.have.attr('data-direction')
      })
    })
  cy.get('@squares').filter('.qs-outside-current-month').then($outsides => {
    $outsides.each((_, outside) => {
      const message = '@squaresContainer/.qs-outside-current-month'
      const hasDayClass = pickerProperties.days.reduce((found, day) => {
        return found || outside.classList.contains(day)
      }, false)

      expect(hasDayClass, `${message} (has day of week class)`).to.equal(true)
      expect(outside, message).to.have.text('')
      expect(outside, message).to.have.class('qs-empty')
      expect(outside, message).to.have.attr('data-direction')
      expect(outside.dataset.direction, message).to.be.oneOf(['-1', '1'])
    })
  })
  cy.get('@squares').filter('.qs-num').then($qsNums => {
    const numOfDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const message = '@squaresContainer/.qs-num'

    expect($qsNums.length, message).to.equal(numOfDays)

    $qsNums.each((i, qsNum) => {
      const hasDayClass = pickerProperties.days.reduce((found, day) => {
        return found || qsNum.classList.contains(day)
      }, false)

      expect(hasDayClass, `${message} (has day of week class)`).to.equal(true)
      expect(qsNum.dataset.direction, message).to.equal('0')
      expect(qsNum.textContent, message).to.equal(`${i + 1}`)
    })
  })
  cy.get('@squares').filter('.qs-current').then($qsCurrent => {
    const message = '@squaresContainer/.qs-num/.qs-current'
    const hasDayClass = pickerProperties.days.reduce((found, day) => {
      return found || $qsCurrent[0].classList.contains(day)
    }, false)

    expect(hasDayClass, `${message} (has day of week class)`).to.equal(true)

    expect($qsCurrent, message).to.have.length(1)
    expect($qsCurrent.text(), message).to.equal(`${date.getDate()}`)
  })

  // calendar => overlay
  cy.get(selectors.common.overlay).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@overlay').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@overlay').should('have.attr', 'class', 'qs-overlay qs-hidden')
  cy.get('@overlay').children().should('have.length', 3)

  // calendar => overlay => overlayInputContainer
  cy.get(selectors.common.overlayInputContainer).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@overlayInputContainer').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@overlayInputContainer').children().should('have.length', 2)
  cy.get('@overlayInputContainer').should('not.have.attr', 'class')
  cy.get('@overlayInputContainer').then($overlayInputContainer => {
    expect($overlayInputContainer[0].getAttributeNames(), '@overlayInputContainer - getAttributeNames()').to.deep.equal([])
  })

  // calendar => overlay => overlayInputContainer => year input
  cy.get(selectors.common.overlayYearInput).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@overlayYearInput').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@overlayYearInput').should('have.prop', 'tagName').should('eq', 'INPUT')
  cy.get('@overlayYearInput').should('have.attr', 'class', 'qs-overlay-year')
  cy.get('@overlayYearInput').should('have.attr', 'placeholder', '4-digit year')
  cy.get('@overlayYearInput').should('have.prop', 'value', '')

  // calendar => overlay => overlayInputContainer => close
  cy.get(selectors.common.overlayClose).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@overlayClose').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@overlayClose').should('have.attr', 'class', 'qs-close')
  cy.get('@overlayClose').should('have.text', '✕')

  // calendar => overlay => overlayMonthContainer
  cy.get(selectors.common.overlayMonthContainer).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@overlayMonthContainer').should('have.length', 1) // Searching within the specified section of the document.
  cy.get('@overlayMonthContainer').children().should('have.length', 12)
  cy.get('@overlayMonthContainer').should('have.attr', 'class', 'qs-overlay-month-container')

  // calendar => overlay => overlayMonthContainer => overlayMonth
  cy.get(selectors.common.overlayMonth).should('have.length', 12 * multiplier) // Searching the whole document.
  cy.get('@overlayMonthContainer').children().then($qsOverlayMonths => {
    $qsOverlayMonths.each((i, overlayMonth) => {
      const message = `.qs-overlay-month [${i}]`

      expect(overlayMonth.textContent, message).to.have.length(3)
      expect(overlayMonth.textContent, message).to.equal(pickerProperties.months[i].slice(0, 3))
      expect(overlayMonth, message).to.have.attr('class', 'qs-overlay-month')
      expect(overlayMonth, message).to.have.attr('data-month-num', `${i}`)
    })
  })

  // calendar => overlay => overlaySubmit
  cy.get(selectors.common.overlaySubmit).should('have.length', 1 * multiplier) // Searching the whole document.
  cy.get('@overlay').find(selectors.common.overlaySubmit) // Searching within the specified section of the document.
    .should('have.length', 1)
    .should('have.text', 'Submit')
    .should('have.attr', 'class', 'qs-submit qs-disabled')
    .should('have.prop', 'tagName').should('eq', 'DIV') // This element is not a <button> or <input type="submit"/>.
}

describe('Default properties and behavior', function() {
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

  describe('Single instance', function() {
    it('should have the correct properties and values', function() {
      const picker = this.datepicker(singleDatepickerInput)

      singleDatepickerProperties.forEach(checkPickerProperties(picker))

      // Ensure that only and all the properties are in the picker instance.
      const pickerKeys = Object.keys(picker)
      const numOfPropertiesExpected = singleDatepickerProperties.length
      expect(pickerKeys).to.have.length(numOfPropertiesExpected)

      singleDatepickerProperties.forEach(({ property }) => {
        expect(picker, property).to.haveOwnProperty(property)
      })
    })

    it('should have the correct DOM structure', function() {
      this.datepicker(singleDatepickerInput)
      testDomStructure('single', selectors.single)
    })

    describe('Basic visuals, behavior, and property changes', function() {
      it('is initially hidden in the DOM', function() {
        this.datepicker(singleDatepickerInput)
        cy.get(selectors.single.calendarContainer).should('not.be.visible')
      })

      it('should show the calendar when clicking into the input (and not show the overlay)', function() {
        this.datepicker(singleDatepickerInput)

        cy.get(singleDatepickerInput).click()
        cy.get(selectors.single.calendarContainer).should('be.visible')
        cy.get(selectors.single.overlay).then($overlay => {
          const message = '.qs-overlay styles'
          const styles = getComputedStyle($overlay[0])

          expect(styles.opacity, message).to.equal('0')
          expect(styles.zIndex, message).to.equal('-1')
        })
      })

      it('should show todays date bold and underlined, all others regular', function() {
        const today = new Date()
        this.datepicker(singleDatepickerInput)

        cy.get(singleDatepickerInput).click()
        cy.get(`${selectors.single.squaresContainer} .qs-current`)
          .should('have.text', today.getDate())
          .then($qsCurrent => {
            const message = '.qs-current styles'
            const styles = getComputedStyle($qsCurrent[0])

            expect(styles.fontWeight, message).to.equal('700')
            expect(styles.textDecoration, message).to.equal('underline solid rgb(0, 0, 0)')
            expect(styles.backgroundColor, message).to.equal('rgba(0, 0, 0, 0)')
          })

        cy.get(`${selectors.single.squaresContainer} [data-direction="0"]:not(.qs-current)`)
          .should('have.length', new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - 1)
          .then($allDaysButCurrentDay => {
            const message = 'calendar day styles (not .qs-current)'

            Array.from($allDaysButCurrentDay).forEach(el => {
              const styles = getComputedStyle(el)

              expect(styles.fontWeight, message).to.equal('400')
              expect(styles.textDecoration, message).to.equal('none solid rgb(0, 0, 0)')
              expect(styles.backgroundColor, message).to.equal('rgba(0, 0, 0, 0)')
            })
          })
      })

      it('hides the calendar when clicking outside the calendar and input', function() {
        this.datepicker(singleDatepickerInput)

        cy.get(singleDatepickerInput).click()
        cy.get(selectors.single.calendarContainer).should('be.visible')
        cy.get('body').click()
        cy.get(selectors.single.calendarContainer).should('not.be.visible')
      })

      it('should change months when the arrows are clicked', function() {
        const today = new Date()
        const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        this.datepicker(singleDatepickerInput)

        cy.get(singleDatepickerInput).click()
        cy.get(`${selectors.single.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.single.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)

        cy.get(`${selectors.single.controls} .qs-arrow.qs-left`).click()
        cy.get(`${selectors.single.controls} .qs-month`).should('have.text', pickerProperties.months[previousMonthDate.getMonth()])
        cy.get(`${selectors.single.controls} .qs-year`).should('have.text', `${previousMonthDate.getFullYear()}`)

        cy.get(`${selectors.single.controls} .qs-arrow.qs-right`).click()
        cy.get(`${selectors.single.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.single.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)
      })

      describe('Overlay', function() {
        it('should show the overlay when the month/year is clicked', function() {
          this.datepicker(singleDatepickerInput)

          cy.get(singleDatepickerInput).click()
          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.get(selectors.single.controls).then($controls => {
            const message = '.qs-controls blurred when overlay is open'
            const styles = getComputedStyle($controls[0])

            expect(styles.filter, message).to.equal('blur(5px)')
          })
          cy.get(selectors.single.squaresContainer).then($squaresContainer => {
            const message = '.qs-squares (container) blurred when overlay is open'
            const styles = getComputedStyle($squaresContainer[0])

            expect(styles.filter, message).to.equal('blur(5px)')
          })
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay styles when open'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })
        })

        it('should focus the overlay year input', function() {
          this.datepicker(singleDatepickerInput)

          cy.get(singleDatepickerInput).click()
          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.focused().should('have.attr', 'class', 'qs-overlay-year')
        })

        it('should change the year when using the input and hitting enter or clicking the submit button', function() {
          const today = new Date()
          const nextYear = today.getFullYear() + 1
          this.datepicker(singleDatepickerInput)

          cy.get(singleDatepickerInput).click()
          cy.get(`${selectors.single.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
          cy.get(`${selectors.single.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)
          cy.get(`${selectors.single.overlay} .qs-submit`).should('have.attr', 'class', 'qs-submit qs-disabled')

          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.get(`${selectors.single.overlayInputContainer} .qs-overlay-year`).type(`${nextYear}`)
          cy.get(`${selectors.single.overlay} .qs-submit`).should('have.attr', 'class', 'qs-submit')
          cy.get(`${selectors.single.overlayInputContainer} .qs-overlay-year`).focus().type('{enter}')
          cy.wait(400)

          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay styles after entering year'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('0')
            expect(styles.zIndex, message).to.equal('-1')
          })
          cy.get(`${selectors.single.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
          cy.get(`${selectors.single.controls} .qs-year`).should('have.text', `${nextYear}`)

          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.get(`${selectors.single.overlayInputContainer} .qs-overlay-year`).type(`${today.getFullYear()}`)
          cy.get(`${selectors.single.overlay} .qs-submit`)
            .should('have.attr', 'class', 'qs-submit')
            .click()
          cy.wait(400)
          cy.get(`${selectors.single.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
          cy.get(`${selectors.single.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)
        })

        it('should not allow leading zeros or change the year if 4 digits have not been entered', function() {
          this.datepicker(singleDatepickerInput)

          cy.get(selectors.single.overlay).as('overlay')
          cy.get(`${selectors.single.overlay} .qs-submit`).as('submit')
          cy.get(`${selectors.single.overlayInputContainer} .qs-overlay-year`).as('yearInput')

          cy.get(singleDatepickerInput).click()
          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)

          cy.get('@overlay').then($overlay => {
            const message = '.qs-overlay'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })
          cy.get('@submit').click()
          cy.wait(400)
          cy.get('@overlay').then($overlay => {
            const message = '.qs-overlay'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })
          cy.get('@yearInput').type('{enter')
          cy.wait(400)
          cy.get('@overlay').then($overlay => {
            const message = '.qs-overlay'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })

          cy.get('@yearInput')
            .should('have.value', '')
            .type('0000')
            .should('have.value', '')

          cy.get('@submit').should('have.attr', 'class', 'qs-submit qs-disabled')
          cy.get('@yearInput').type('1').should('have.value', '1')
          cy.get('@submit').should('have.attr', 'class', 'qs-submit qs-disabled')
          cy.get('@yearInput').type('2').should('have.value', '12')
          cy.get('@submit').should('have.attr', 'class', 'qs-submit qs-disabled')
          cy.get('@yearInput').type('3').should('have.value', '123')
          cy.get('@submit').should('have.attr', 'class', 'qs-submit qs-disabled')
          cy.get('@yearInput').type('4').should('have.value', '1234')
          cy.get('@submit').should('have.attr', 'class', 'qs-submit')
        })

        it('should change the month when a month name is clicked', function() {
          const today = new Date()
          this.datepicker(singleDatepickerInput)

          cy.get(singleDatepickerInput).click()
          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay styles after clicking month'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })

          cy.get(`${selectors.single.overlayMonthContainer} [data-month-num="0"]`).click()
          cy.wait(400)
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay styles after clicking month'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('0')
            expect(styles.zIndex, message).to.equal('-1')
          })
          cy.get(`${selectors.single.controls} .qs-month-year .qs-month`)
            .should('have.text', pickerProperties.months[0])

          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay styles after clicking month'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })
          cy.get(`${selectors.single.overlayMonthContainer} [data-month-num="11"]`).click()
          cy.wait(400)
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay styles after clicking month'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('0')
            expect(styles.zIndex, message).to.equal('-1')
          })
          cy.get(`${selectors.single.controls} .qs-month-year .qs-month`)
            .should('have.text', pickerProperties.months[11])
        })

        it('should close the overlay when clicking the close button', function() {
          this.datepicker(singleDatepickerInput)

          cy.get(singleDatepickerInput).click()
          cy.get(`${selectors.single.controls} .qs-month-year`).click()
          cy.wait(400)
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('1')
            expect(styles.zIndex, message).to.equal('1')
          })

          cy.get(`${selectors.single.overlay} .qs-close`).click()
          cy.wait(400)
          cy.get(selectors.single.overlay).then($overlay => {
            const message = '.qs-overlay'
            const styles = getComputedStyle($overlay[0])

            expect(styles.opacity, message).to.equal('0')
            expect(styles.zIndex, message).to.equal('-1')
          })
        })
      })
    })
  })

  describe('Daterange pair', function() {
    it('(they) should have the correct properties and values', function() {
      const options = { id: Math.random() } // Using Math.random to showcase that the id just needs to be consistent between both instances.
      const startPicker = this.datepicker(daterangeInputStart, options)
      const endPicker = this.datepicker(daterangeInputEnd, options)

      ;['start', 'end'].forEach(type => {
        const pickerToCheck = type === 'start' ? startPicker : endPicker
        const pickerProperties = getDaterangeProperties(type, startPicker, endPicker)
        pickerProperties.forEach(checkPickerProperties(pickerToCheck, true, options.id))

        // Ensure that only and all the properties are in the picker instance.
        const pickerKeys = Object.keys(pickerToCheck)
        const numOfPropertiesExpected = pickerProperties.length

        expect(pickerKeys).to.have.length(numOfPropertiesExpected)

        pickerProperties.forEach(({ property }) => {
          expect(pickerToCheck, property).to.haveOwnProperty(property)
        })
      })
    })

    it('(they) should have the correct DOM structure(s)', function() {
      this.datepicker(daterangeInputStart, { id: 1 })
      this.datepicker(daterangeInputEnd, { id: 1 })
      testDomStructure('daterangeStart', selectors.range.start)
      testDomStructure('daterangeEnd', selectors.range.end)
    })

    describe('Basic visuals and behavior', function() {
      it('(they) are initially hidden in the DOM', function() {
        this.datepicker(daterangeInputStart, { id: 1 })
        this.datepicker(daterangeInputEnd, { id: 1 })
        cy.get(selectors.range.start.calendarContainer).should('not.be.visible')
        cy.get(selectors.range.end.calendarContainer).should('not.be.visible')
      })

      it('(they) should show the calendar (individually) when clicking into the input (and not show the overlay)', function() {
        this.datepicker(daterangeInputStart, { id: 1 })
        this.datepicker(daterangeInputEnd, { id: 1 })

        cy.get(daterangeInputStart).click()
        cy.get(selectors.range.start.calendarContainer).should('be.visible')
        cy.get(selectors.range.start.overlay).then($overlay => {
          const message = '.qs-overlay (start) styles'
          const styles = getComputedStyle($overlay[0])

          expect(styles.opacity, message).to.equal('0')
          expect(styles.zIndex, message).to.equal('-1')
        })

        cy.get(daterangeInputEnd).click()
        cy.get(selectors.range.start.calendarContainer).should('not.be.visible')
        cy.get(selectors.range.end.calendarContainer).should('be.visible')
        cy.get(selectors.range.end.overlay).then($overlay => {
          const message = '.qs-overlay (end) styles'
          const styles = getComputedStyle($overlay[0])

          expect(styles.opacity, message).to.equal('0')
          expect(styles.zIndex, message).to.equal('-1')
        })
      })

      it('(they) should change months when the arrows are clicked, not affecting the other', function() {
        const today = new Date()
        const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        this.datepicker(daterangeInputStart, { id: 1 })
        this.datepicker(daterangeInputEnd, { id: 1 })

        cy.get(daterangeInputStart).click()
        cy.get(`${selectors.range.start.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.range.start.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)
        cy.get(daterangeInputEnd).click()
        cy.get(`${selectors.range.end.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.range.end.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)

        cy.get(daterangeInputStart).click()
        cy.get(`${selectors.range.start.controls} .qs-arrow.qs-left`).click()
        cy.get(`${selectors.range.start.controls} .qs-month`).should('have.text', pickerProperties.months[previousMonthDate.getMonth()])
        cy.get(`${selectors.range.start.controls} .qs-year`).should('have.text', `${previousMonthDate.getFullYear()}`)
        cy.get(daterangeInputEnd).click()
        cy.get(`${selectors.range.end.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.range.end.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)

        cy.get(daterangeInputStart).click()
        cy.get(`${selectors.range.start.controls} .qs-arrow.qs-right`).click()
        cy.get(`${selectors.range.start.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.range.start.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)
        cy.get(daterangeInputEnd).click()
        cy.get(`${selectors.range.end.controls} .qs-month`).should('have.text', pickerProperties.months[today.getMonth()])
        cy.get(`${selectors.range.end.controls} .qs-year`).should('have.text', `${today.getFullYear()}`)
      })
    })
  })
})


x.describe('Initial calendar load with default settings', () => {
  describe('Datepicker UI (& corresponding changes to instance object properties)', () => {

    describe('Date changes', () => {
      const dayToSelect = 15

      describe('Selecting a date', () => {
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

  describe('Instance methods', () => {
    const dayToSelect = 23

    describe('setDate', () => {
      before(() => {
        cy.get('body').click()
        cy.wait(100)
        cy.get('[data-cy="input-1"]').click()
        cy.wait(100)

        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-active')
          .should('have.length', 0)
          .then(() => {
            picker.setDate(new Date(picker.currentYear, picker.currentMonth, dayToSelect))
          })
      })

      it('should programmatically set a date', () => {
        cy.get('.qs-active')
          .should('have.length', 1)
          .should('have.text', `${dayToSelect}`)
      })

      it('should populate the input with that date', () => {
        const expectedInputText = new Date(picker.currentYear, picker.currentMonth, dayToSelect).toDateString()
        cy.get('[data-cy="input-1"]')
          .should('have.value', expectedInputText)
      })

      it('should populate `dateSelected` on the instance object', () => {
        expect(+picker.dateSelected).to.equal(+new Date(picker.currentYear, picker.currentMonth, dayToSelect))
      })

      it('should navigate the calendar to that date via the second argument', () => {
        cy.get('.qs-active').click().then(() => {
          const { currentMonthName, currentYear, currentMonth } = picker
          const nextMonthIndex = currentMonth === 0 ? 1 : 0
          const nextMonthName = months[nextMonthIndex]
          const nextYear = currentYear + 1
          const nextDate = 20

          expect(picker.dateSelected).to.be.undefined

          cy.get('.qs-active')
            .should('have.length', 0)
          cy.get('.qs-month')
            .should('have.text', currentMonthName)
          cy.get('.qs-year')
            .should('have.text', `${currentYear}`)
            .then(() => {
              picker.setDate(new Date(nextYear, nextMonthIndex, nextDate), true)

              cy.get('.qs-month')
                .should('have.text', nextMonthName)
              cy.get('.qs-year')
                .should('have.text', `${nextYear}`)
              cy.get('[data-cy="input-1"]')
                .should('have.value', new Date(nextYear, nextMonthIndex, 20).toDateString())
              cy.get('.qs-active')
                .should('have.text', `${nextDate}`)
            })
        })
      })

      it('should remove the selected date when called with no argument', () => {
        picker.setDate()

        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-active')
          .should('have.length', 0)

      })
    })

    describe('setMin', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
        cy.get('.qs-active')
          .should('have.length', 0)
        expect(picker.minDate).to.be.undefined
      })

      it('should set the `minDate` property on the instance', () => {
        const minDate = new Date(picker.currentYear, picker.currentMonth, dayToSelect)

        picker.setMin(minDate)
        expect(+picker.minDate).to.equal(+minDate)
      })

      it('should disable dates prior to the provided value (including prev months)', () => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', dayToSelect - 1)

        cy.get('.qs-arrow.qs-left').click().then(() => {
          const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

          cy.get('.qs-square.qs-disabled')
            .should('have.length', numOfDaysInMonth)
        })
      })

      it('should prevent disabled dates from being selected', () => {
        expect(picker.dateSelected).to.be.undefined

        cy.get('.qs-square.qs-disabled')
          .first()
          .should('have.text', '1')
          .click()
          .then(() => {
            expect(picker.dateSelected).to.be.undefined

            cy.get('.qs-active')
              .should('have.length', 0)
          })
      })

      it('should remove the min selectable date when called with no argument', () => {
        picker.setMin()

        expect(picker.minDate).to.be.undefined
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
      })
    })

    describe('setMax', () => {
      before(() => {
        cy.get('.qs-square.qs-disabled')
          .should('have.length', 0)
          .then(() => {
            expect(picker.maxDate).to.be.undefined
            picker.setMax(new Date(picker.currentYear, picker.currentMonth, 1))
          })
      })

      it('should set the `maxDate` property on the instnace', () => {
        expect(+picker.maxDate).to.equal(+new Date(picker.currentYear, picker.currentMonth, 1))
      })

      it('should disabled dates after the provided value (including future months)', () => {
        const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()
        const numOfDaysNextMonth = new Date(picker.currentYear, picker.currentMonth + 2, 0).getDate()

        cy.get('.qs-square.qs-disabled')
          .should('have.length', numOfDaysInMonth - 1)
        cy.get('.qs-arrow.qs-right').click().then(() => {
          cy.get('.qs-square.qs-disabled')
            .should('have.length', numOfDaysNextMonth)
        })
      })

      it('should prevent disabled dates from being selected', () => {
        expect(picker.dateSelected).to.be.undefined
        cy.get('.qs-square.qs-disabled')
          .first()
          .should('have.text', '1')
          .click()
          .then(() => {
            expect(picker.dateSelected).to.be.undefined
          })
      })

      it('should remove the max selectable date when called with no argument', () => {
        const numOfDaysInMonth = new Date(picker.currentYear, picker.currentMonth + 1, 0).getDate()

        cy.get('.qs-square.qs-disabled')
          .should('have.length', numOfDaysInMonth)
          .then(() => {
            expect(picker.maxDate).not.to.be.undefined
            picker.setMax()
            expect(picker.maxDate).to.be.undefined
            cy.get('.qs-square.qs-disabled')
              .should('have.length', 0)
          })
      })
    })

    describe('show', () => {
      before(() => {
        cy.get('body').click()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })

      it('should show the calendar when called', () => {
        picker.show()
        cy.get('.qs-datepicker-container')
          .should('be.visible')
      })
    })

    describe('hide', () => {
      it('should hide the calendar when called', () => {
        picker.hide()
        cy.get('.qs-datepicker-container')
          .should('not.be.visible')
      })
    })

    describe('remove', () => {
      before(() => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 1)
      })

      it('should completely nuke the instance object', () => {
        const originalNumOfProps = Object.keys(picker).length
        picker.remove()
        const numOfProps = Object.keys(picker).length

        expect(originalNumOfProps).to.be.gt(0)
        expect(numOfProps).to.equal(0)
      })

      it('should remove the calendar from the DOM', () => {
        cy.get('.qs-datepicker-container')
          .should('have.length', 0)
      })
    })
  })
})
