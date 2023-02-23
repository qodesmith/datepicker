import {voidElements} from '../../src/constants'
import {Datepicker} from '../../src/types'
import {containers, wackyBits} from '../selectors'

describe('Datepicker function', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  describe('selector', () => {
    describe('string selector', () => {
      it('should initialize with a class selector', () => {
        cy.get(containers.calendarContainer)
          .should('have.length', 0)
          .then(() => {
            datepicker(wackyBits.wackyDiv)
          })

        cy.get(containers.calendarContainer).should('have.length', 1)
      })

      // TODO - implement this.
      it('should initialize with a selector in a shadow DOM')

      it('should initialize with an id selector beginning with a number (rare)', () => {
        cy.get(containers.calendarContainer)
          .should('have.length', 0)
          .then(() => {
            datepicker(wackyBits.idStartingWithNumber)
          })

        cy.get(containers.calendarContainer).should('have.length', 1)
      })

      it('should throw when a selector is not found', () => {
        // Class.
        cy.get(containers.calendarContainer)
          .should('have.length', 0)
          .then(() => {
            expect(() => datepicker('.no-way-jose')).to.throw(
              'No element found.'
            )
          })

        // ID.
        cy.get(containers.calendarContainer)
          .should('have.length', 0)
          .then(() => {
            expect(() => datepicker('#no-way-jose')).to.throw(
              'No element found.'
            )
          })
      })

      it('should throw when a selector is a void element', () => {
        cy.get(wackyBits.wackyDiv).then(el => {
          voidElements.forEach(nodeName => {
            const tag = `<${nodeName}>`
            el.html(tag)

            expect(() => datepicker(nodeName)).to.throw(
              `Using a void element <${nodeName}> is not supported.`
            )
          })
        })
      })

      // TODO - implement this.
      it('should throw if the selector is a shadow DOM root')
    })

    describe('element selector', () => {
      it('should initialize for valid HTML elements', () => {
        cy.get(wackyBits.wackyAside).then(el => datepicker(el[0]))
        cy.get(wackyBits.wackyDiv).then(el => datepicker(el[0]))
        cy.get(wackyBits.wackySection).then(el => datepicker(el[0]))
        cy.get(wackyBits.wackySpan).then(el => datepicker(el[0]))
        cy.get(containers.calendarContainer).should('have.length', 4)
      })

      // TODO - implement this.
      it('should initialize for elements inside a shadow DOM')

      it('should throw if the selector object is not an element', () => {
        const div = document.createElement('div')
        div.textContent = 'hello world'
        const textNode = div.childNodes[0]

        // @ts-expect-error Purposely passing a non-element for testing.
        expect(() => datepicker(textNode)).to.throw(
          'The object passed to datepicker is not an HTML element.'
        )

        // @ts-expect-error Purposely passing a non-element for testing.
        expect(() => datepicker(document)).to.throw(
          'The object passed to datepicker is not an HTML element.'
        )
      })

      it("should throw if the element doesn't have a parent and is NOT part of a shadow DOM", () => {
        const div = document.createElement('div')
        const span = document.createElement('span')

        expect(() => datepicker(div)).to.throw(
          'Invalid root node found for selector: HTMLDivElement'
        )
        expect(() => datepicker(span)).to.throw(
          'Invalid root node found for selector: HTMLSpanElement'
        )
      })

      // TODO - implement this.
      it('should throw if the element is a ShadowRoot')
    })
  })
})
