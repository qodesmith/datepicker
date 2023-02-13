describe('template spec', () => {
  it('passes', () => {
    cy.visit(Cypress.env('TEST_DEV_LOCALHOST'))

    expect(true).to.equal(true)
  })
})
