const appSelectors = {
  singleDatepickerInput: '[data-cy="single-datepicker-input"]',
  daterangeInputStart: '[data-cy="daterange-input-start"]',
  daterangeInputEnd: '[data-cy="daterange-input-end"]',
  singleDatepickerInputParent: '[data-cy="single-datepicker-input-parent"]',
  daterangeInputsParent: '[data-cy="daterange-inputs-parent"]',
}

const container = '.qs-datepicker-container'
const calendar =  '.qs-datepicker'
const controls = '.qs-controls'
const squares = '.qs-squares'
const everySquare = '.qs-square'
const squareDayHeader = '.qs-day'
const squareOutsideCurrentMonth = '.qs-outside-current-month'
const sqareWithNum = '.qs-num'
const squareCurrentDay = '.qs-current'
const overlay = '.qs-overlay'

const datepickerSelectors = {
  single: {
    calendarContainer: `${appSelectors.singleDatepickerInputParent} ${container}`,
    calendar: `${appSelectors.singleDatepickerInputParent} ${calendar}`,
    controls: `${appSelectors.singleDatepickerInputParent} ${calendar} ${controls}`,
    squares: `${appSelectors.singleDatepickerInputParent} ${calendar} ${squares}`,
    overlay: `${appSelectors.singleDatepickerInputParent} ${calendar} ${overlay}`,
  },
  range: {
    start: {
      calendarContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1)`,
      calendar: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar}`,
      controls: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${controls}`,
      squares: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${squares}`,
      overlay: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${overlay}`,
    },
    end: {
      calendarContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2)`,
      calendar: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar}`,
      controls: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${controls}`,
      squares: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${squares}`,
      overlay: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${overlay}`,
    },
  },
  common: {
    container,
    calendar,
    controls,
    squares,
    overlay,
    everySquare,
    squareDayHeader,
    squareOutsideCurrentMonth,
    sqareWithNum,
    squareCurrentDay,
  }
}

const selectors = {
  ...appSelectors,
  ...datepickerSelectors,

}

export default selectors
