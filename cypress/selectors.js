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
const squaresContainer = '.qs-squares'
const everySquare = '.qs-square'
const squareDayHeader = '.qs-day'
const squareOutsideCurrentMonth = '.qs-outside-current-month'
const sqareWithNum = '.qs-num'
const squareCurrentDay = '.qs-current'
const overlay = '.qs-overlay'
const overlayInputContainer = '.qs-overlay > div:nth-of-type(1)'
const overlayYearInput = '.qs-overlay-year'
const overlayClose = '.qs-close'
const overlayMonthContainer = '.qs-overlay-month-container'
const overlayMonth = '.qs-overlay-month'
const overlaySubmit = '.qs-submit'

const datepickerSelectors = {
  single: {
    calendarContainer: `${appSelectors.singleDatepickerInputParent} ${container}`,
    calendar: `${appSelectors.singleDatepickerInputParent} ${calendar}`,
    controls: `${appSelectors.singleDatepickerInputParent} ${calendar} ${controls}`,
    squaresContainer: `${appSelectors.singleDatepickerInputParent} ${calendar} ${squaresContainer}`,
    squares: `${appSelectors.singleDatepickerInputParent} ${calendar} ${squaresContainer} ${everySquare}`,
    overlay: `${appSelectors.singleDatepickerInputParent} ${calendar} ${overlay}`,
    overlayInputContainer: `${appSelectors.singleDatepickerInputParent} ${calendar} ${overlayInputContainer}`,
    overlayMonthContainer: `${appSelectors.singleDatepickerInputParent} ${calendar} ${overlay} ${overlayMonthContainer}`,
  },
  range: {
    start: {
      calendarContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1)`,
      calendar: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar}`,
      controls: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${controls}`,
      squaresContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${squaresContainer}`,
      overlay: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${overlay}`,
      overlayInputContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${overlayInputContainer}`,
      overlayMonthContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(1) ${calendar} ${overlay} ${overlayMonthContainer}`,
    },
    end: {
      calendarContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2)`,
      calendar: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar}`,
      controls: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${controls}`,
      squaresContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${squaresContainer}`,
      overlay: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${overlay}`,
      overlayInputContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${overlayInputContainer}`,
      overlayMonthContainer: `${appSelectors.daterangeInputsParent} ${container}:nth-of-type(2) ${calendar} ${overlay} ${overlayMonthContainer}`,
    },
  },
  common: {
    container,
    calendar,
    controls,
    squaresContainer,
    overlay,

    everySquare,
    squareDayHeader,
    squareOutsideCurrentMonth,
    sqareWithNum,
    squareCurrentDay,

    overlayInputContainer,
    overlayYearInput,
    overlayClose,
    overlayMonthContainer,
    overlayMonth,
    overlaySubmit,
  }
}

const selectors = {
  ...appSelectors,
  ...datepickerSelectors,
}

export default selectors
