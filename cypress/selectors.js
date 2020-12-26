const appSelectors = {
  singleDatepickerInput: '[data-cy="single-datepicker-input"]',
  daterangeInputStart: '[data-cy="daterange-input-start"]',
  daterangeInputEnd: '[data-cy="daterange-input-end"]',
  singleDatepickerInputParent: '[data-cy="single-datepicker-input-parent"]',
  daterangeInputsParent: '[data-cy="daterange-inputs-parent"]',
  daterangeInputsStartContainer: '[data-cy="daterange-input-start-container"]',
  daterangeInputsEndContainer: '[data-cy="daterange-input-end-container"]',
}

const container = '.qs-datepicker-container'
const calendar =  '.qs-datepicker'
const controls = '.qs-controls'
const squaresContainer = '.qs-squares'
const everySquare = '.qs-square'
const squareDayHeader = '.qs-day'
const squareOutsideCurrentMonth = '.qs-outside-current-month'
const squareWithNum = '.qs-num'
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
      calendarContainer: `${appSelectors.daterangeInputsStartContainer} ${container}`,
      calendar: `${appSelectors.daterangeInputsStartContainer} ${container} ${calendar}`,
      controls: `${appSelectors.daterangeInputsStartContainer} ${container} ${calendar} ${controls}`,
      squaresContainer: `${appSelectors.daterangeInputsStartContainer} ${container} ${calendar} ${squaresContainer}`,
      overlay: `${appSelectors.daterangeInputsStartContainer} ${container} ${calendar} ${overlay}`,
      overlayInputContainer: `${appSelectors.daterangeInputsStartContainer} ${container} ${calendar} ${overlayInputContainer}`,
      overlayMonthContainer: `${appSelectors.daterangeInputsStartContainer} ${container} ${calendar} ${overlay} ${overlayMonthContainer}`,
    },
    end: {
      calendarContainer: `${appSelectors.daterangeInputsEndContainer} ${container}`,
      calendar: `${appSelectors.daterangeInputsEndContainer} ${container} ${calendar}`,
      controls: `${appSelectors.daterangeInputsEndContainer} ${container} ${calendar} ${controls}`,
      squaresContainer: `${appSelectors.daterangeInputsEndContainer} ${container} ${calendar} ${squaresContainer}`,
      overlay: `${appSelectors.daterangeInputsEndContainer} ${container} ${calendar} ${overlay}`,
      overlayInputContainer: `${appSelectors.daterangeInputsEndContainer} ${container} ${calendar} ${overlayInputContainer}`,
      overlayMonthContainer: `${appSelectors.daterangeInputsEndContainer} ${container} ${calendar} ${overlay} ${overlayMonthContainer}`,
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
    squareWithNum,
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
