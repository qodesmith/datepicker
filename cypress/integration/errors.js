import selectors from '../selectors'
import datepicker from '../../src/datepicker'

const { singleDatepickerInput } = selectors

function createMyElement({ global, datepicker, shouldThrow }) {
  class MyElement extends global.HTMLElement {
    constructor() {
      super()
      const shadowRoot = this.attachShadow({ mode: 'open' })
      this.root = shadowRoot
      shadowRoot.innerHTML = `
        <div data-cy="shadow-dom-error-test">
          <h1>Cypress Single Instance Shadow DOM Error Test</h1>
          <div>(no styles for this calendar, so the html will explode, lol)</div>
          <input />
        </div>
      `

      // Create the node we'll pass to datepicker.
      this.input = shadowRoot.querySelector('input')
    }

    connectedCallback() {
      if (shouldThrow) {
        expect(() => datepicker(this.root)).to.throw('Using a shadow DOM as your selector is not supported.')
      } else {
        expect(() => datepicker(this.input)).not.to.throw()
      }
    }
  }

  return MyElement
}

describe('Errors thrown by datepicker', function() {
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

  describe.only('Single instance', function() {
    it('should throw if a shadow DOM is used as the selector', function() {
      const datepicker = this.datepicker

      cy.window().then(global => {
        cy.document().then(doc => {
          const MyElement = createMyElement({ global, datepicker, shouldThrow: true })
          global.customElements.define('my-element', MyElement)

          const myElement = doc.createElement('my-element')
          doc.body.prepend(myElement)
        })
      })
    })

    it('should not throw if an element within a shadow DOM is used as the seletor', function() {
      const datepicker = this.datepicker

      cy.window().then(global => {
        cy.document().then(doc => {
          const MyElement = createMyElement({ global, datepicker, shouldThrow: false })
          global.customElements.define('my-element', MyElement)

          const myElement = doc.createElement('my-element')
          doc.body.prepend(myElement)
        })
      })
    })

    it('should throw if no selector is provided or the provided selector is not found in the DOM', function() {
      expect(() => this.datepicker(`#nope-${Math.random()}`)).to.throw('No selector / element found.')
      expect(() => this.datepicker()).to.throw()
    })

    it('should throw if we try to use the same el twice', function() {
      this.datepicker(singleDatepickerInput)
      expect(() => this.datepicker(singleDatepickerInput)).to.throw('A datepicker already exists on that element.')
    })

    describe('Options', function() {
      it('should throw if `options.events` contains something other than date objects', function() {
        const fxnThatThrows = () => this.datepicker(singleDatepickerInput, { events: [new Date(), Date.now()] })
        expect(fxnThatThrows).to.throw('"options.events" must only contain valid JavaScript Date objects.')
      })

      it('should not throw if `options.events` contains only date objects', function() {
        const noThrow = () => this.datepicker(singleDatepickerInput, { events: [new Date(), new Date('1/1/2000')] })
        expect(noThrow).not.to.throw()
      })

      it(`should throw if startDate, dateSelected, minDate, or maxDate aren't date objects`, function() {
        ['startDate', 'dateSelected', 'minDate', 'maxDate'].forEach(option => {
          expect(() => this.datepicker(singleDatepickerInput, { [option]: 'nope' }), `${option} - should throw`)
            .to.throw(`"options.${option}" needs to be a valid JavaScript Date object.`)
        })
      })

      it('should not throw if startDate, dateSelected, minDate, and maxDate are all date objects', function() {
        const today = new Date()
        const noThrow = () => this.datepicker(singleDatepickerInput, {
          startDate: today,
          dateSelected: new Date(today.getFullYear(), today.getMonth(), 5),
          minDate: new Date(today.getFullYear(), today.getMonth(), 2),
          maxDate: new Date(today.getFullYear(), today.getMonth(), 10),
        })

        expect(noThrow).not.to.throw()
      })


    })
  })

  describe('Daterange pair', function() {})
})
