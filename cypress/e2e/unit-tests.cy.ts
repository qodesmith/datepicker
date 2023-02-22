import {getType, throwError, throwAlreadyRemovedError} from '../../src/utils'

describe('Unit Tests', () => {
  describe('getType', () => {
    it('should return the type of object passed to it', () => {
      expect(getType('Datepicker rulez')).to.equal('String')
      expect(getType(9001)).to.equal('Number')
      expect(getType(document.createElement('div'))).to.equal('HTMLDivElement')
      expect(getType(document.createElement('input'))).to.equal(
        'HTMLInputElement'
      )
      expect(getType({})).to.equal('Object')
      expect(getType([])).to.equal('Array')
      expect(getType(new Set())).to.equal('Set')
      expect(getType(new Map())).to.equal('Map')
    })
  })

  describe('throwError', () => {
    it('should throw an error with the message provided', () => {
      expect(() => throwError('test')).to.throw('test')
    })
  })

  describe('throwAlreadyRemovedError', () => {
    it('should throw an error with a specific message', () => {
      expect(() => throwAlreadyRemovedError()).to.throw(
        "Unable to run a function from a picker that's already removed."
      )
    })
  })
})
