/*
  TODO's:
    * Test for setting a datepicker on the same input more than once.
    * Test for other error-throwing scenario's
*/

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

  describe('Single instance', function() {})
  describe('Daterange pair', function() {})
})
