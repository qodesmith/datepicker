import {Datepicker} from '../../src/types'
import {testElementIds} from '../selectors'

describe('Other Tests', () => {
  let datepicker: Datepicker

  beforeEach(() => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))
    cy.window().then(global => {
      // @ts-ignore this will be available.
      datepicker = global.datepicker
    })
  })

  it('should only add an event listener on the document once', () => {
    cy.document()
      .then(doc => {
        cy.spy(doc, 'addEventListener').as('globalListener')
      })
      .then(() => {
        datepicker(testElementIds.singleInput)
        datepicker(testElementIds.singleStandalone)
      })

    cy.get('@globalListener').should('have.been.calledOnce')
  })

  it('should have the correct set of properties', () => {
    const picker = datepicker(testElementIds.singleInput, {
      selectedDate: new Date(),
    })
    const expectedPropertiesData = [
      {propertyName: 'calendarContainer', type: '[object HTMLDivElement]'},
      {propertyName: 'currentDate', type: '[object Date]'},
      {propertyName: 'selectedDate', type: '[object Date]'},
      {propertyName: 'remove', type: '[object Function]'},
      {propertyName: 'navigate', type: '[object Function]'},
      {propertyName: 'selectDate', type: '[object Function]'},
      {propertyName: 'setMin', type: '[object Function]'},
      {propertyName: 'setMax', type: '[object Function]'},
      {propertyName: 'show', type: '[object Function]'},
      {propertyName: 'hide', type: '[object Function]'},
      {propertyName: 'toggleCalendar', type: '[object Function]'},
      {propertyName: 'toggleOverlay', type: '[object Function]'},
    ]
    const expectedPropertyNames = expectedPropertiesData.map(
      ({propertyName}) => propertyName
    )

    expect(Object.keys(picker)).to.have.members(expectedPropertyNames)

    expectedPropertiesData.forEach(({propertyName, type}) => {
      const property = picker[propertyName]
      expect({}.toString.call(property)).to.equal(type)
    })
  })
})
