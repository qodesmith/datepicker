import {
  getType,
  throwError,
  throwAlreadyRemovedError,
  getDaysInMonth,
} from '../../src/utils'

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
        "Unable to run a function or access properties from a picker that's already removed."
      )
    })
  })

  describe('getDaysInMonth', () => {
    it('should get the days in the month for the date provided', () => {
      const daysInMonth = getDaysInMonth(new Date(2023, 2))
      expect(daysInMonth).to.equal(31)
    })

    it('should get the days in the month n-months away from the date provided in either direction', () => {
      const date = new Date(2023, 2)

      expect(getDaysInMonth(date, 1)).to.equal(30)
      expect(getDaysInMonth(date, -1)).to.equal(28)
      expect(getDaysInMonth(date, 2)).to.equal(31)
      expect(getDaysInMonth(date, -2)).to.equal(31)
      expect(getDaysInMonth(date, 3)).to.equal(30)
      expect(getDaysInMonth(date, -3)).to.equal(31)
      expect(getDaysInMonth(date, 4)).to.equal(31)
      expect(getDaysInMonth(date, -4)).to.equal(30)
      expect(getDaysInMonth(date, 5)).to.equal(31)
      expect(getDaysInMonth(date, -5)).to.equal(31)
      expect(getDaysInMonth(date, 6)).to.equal(30)
      expect(getDaysInMonth(date, -6)).to.equal(30)

      // Testing with a leap years - https://www.timeanddate.com/date/leapyear.html.
      ;[2020, 2024, 2028, 2032].forEach(year => {
        expect(getDaysInMonth(new Date(year, 2), -1)).to.equal(29)
      })
    })
  })
})
