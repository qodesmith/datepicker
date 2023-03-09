import {
  getType,
  throwError,
  throwAlreadyRemovedError,
  getDaysInMonth,
  getIndexOfLastDayOfMonth,
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

  describe('getIndexOfLastDayOfMonth', () => {
    // I manually got these from looking at Google calendar for 2023.
    const sundayStartDayIndices = [0, 6, 5, 4, 3, 2, 1]
    const sundayIndicis2023: number[] = [2, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4, 0]
    const datesData = Array.from({length: 12}).map((_, i) => {
      return {
        date: new Date(2023, i),
        expectedStartDay0Index: sundayIndicis2023[i],
      }
    })

    datesData.forEach(({date, expectedStartDay0Index}) => {
      const displayDate = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).toLocaleDateString()

      Array.from({length: 7}).forEach((_, startDay) => {
        const index0 = getIndexOfLastDayOfMonth(date, 0)
        const index = getIndexOfLastDayOfMonth(date, startDay)
        const sundayIndex = sundayStartDayIndices[startDay]
        const expectedIndex = (index0 + sundayIndex) % 7

        it(`${displayDate}, startDay: ${startDay} - should get the 0 - 6 index of the last day of the month respecting startDay (${expectedIndex})`, () => {
          if (startDay === 0) {
            expect(index0).to.equal(expectedStartDay0Index)
          }

          expect(index).to.equal(expectedIndex)
        })
      })
    })
  })
})
