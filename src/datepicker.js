/*
  Importing this scss file so as to declare it's a dependency of the library.
  Webpack will then separate it out into its own css file and include it in the dist folder.
*/
require('./datepicker.scss')


let datepickers = [] // Get's reassigned in `remove()` below.
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
const sides = {
  // `t`, `r`, `b`, and `l` are all positioned relatively to the input the calendar is attached to.
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left',

  // `centered` fixes the calendar smack in the middle of the screen. Useful for mobile devices.
  c: 'centered'
}

/*
  The default callback functions (onSelect, etc.) will be a noop function.
  Using this variable so we can simply reference the same function.
  Also, this allows us to check if the callback is a noop function
  by doing a `=== noop` anywhere we like.
*/
const noop = () => {}

/*
  Add a single function as the handler for a few events for ALL datepickers.
  Storing events in an array to access later in the `remove` fxn below.
  Using `focusin` because it bubbles, `focus` does not.
*/
const events = ['click', 'focusin', 'keydown', 'input']


/*
 *  Datepicker! Get a date with JavaScript...
 */
function datepicker(selector, options) {
  // Apply the event listeners only once.
  if (!datepickers.length) applyListeners()

  // Create the datepicker instance!
  const instance = createInstance(selector, options)
  const { startDate, dateSelected } = instance

  /*
    Daterange processing!
    When we encounted the 2nd in a pair, we need run both through `adjustDateranges`
    to handle the min & max settings, and we need to re-render the 1st.
  */
  if (instance.second) {
    const first = instance.sibling

    // Adjust both dateranges.
    adjustDateranges({ instance, deselect: !dateSelected })
    adjustDateranges({ instance: first, deselect: !first.dateSelected })

    // Re-render the first daterange instance - the 2nd will be rendered below.
    renderCalendar(first)
  }

  renderCalendar(instance, startDate || dateSelected)
  calculatePosition(instance)

  return instance
}

/*
 *  Applies the event listeners.
 *  This will be called the first time datepicker is run.
 *  It will also be called on the first run *after* having removed
 *  all previous instances from the DOM. In other words, it only
 *  runs the first time for each "batch" of datepicker instances.
 *
 *  The goal is to ever only have one set of listeners regardless
 *  of how many datepicker instances have been initialized.
 */
function applyListeners() {
  // Using document instead of window because #iphone :/
  // Safari won't handle the click event properly if they're on the window.
  events.forEach(event => document.addEventListener(event, oneHandler))
}

/*
 *  Creates a datepicker instance after sanitizing the options.
 *  Calls `setCalendarInputValue` and conditionally `showCal`.
 */
function createInstance(selector, opts) {
  /*
    In the case that the selector is an id beginning with a number (#123),
    querySelector will fail. That's why we need to check and
    conditionally use `getElementById`.
  */
  let el = selector
  if (typeof el === 'string') {
    el = el[0] === '#' ? document.getElementById(el.slice(1)) : document.querySelector(el)
  }

  const options = sanitizeOptions(opts || defaults(), el)
  const { startDate, dateSelected, sibling } = options
  const noPosition = el === document.body
  const parent = noPosition ? document.body : el.parentElement
  const calendarContainer = document.createElement('div')
  const calendar = document.createElement('div')

  // The calendar scales relative to the font-size of the container.
  // The user can provide a class name that sets font-size, or a theme perhaps.
  // thereby controlling the overall size and look of the calendar.
  calendarContainer.className = 'qs-datepicker-container'
  calendar.className = 'qs-datepicker'


  const instance = {
    // The calendar will be positioned relative to this element (except when 'body').
    el,

    // The element that datepicker will be child of in the DOM.
    parent,

    // Indicates whether to use an <input> element or not as the calendar's anchor.
    nonInput: el.nodeName !== 'INPUT',

    // Flag indicating if `el` is 'body' for `calculatePosition`.
    noPosition,

    // Calendar position relative to `el`.
    position: noPosition ? false : options.position,

    // Date obj used to indicate what month to start the calendar on.
    startDate,

    // Starts the calendar with a date selected.
    dateSelected,

    // An array of dates to disable - these are unix timestamps and not date objects (converted in `sanitizeOptions`).
    disabledDates: options.disabledDates,

    // Low end of selectable dates - overriden for daterange pairs below.
    minDate: options.minDate,

    // High end of selectable dates - overriden for daterange pairs below.
    maxDate: options.maxDate,

    // Disabled the ability to select days on the weekend.
    noWeekends: !!options.noWeekends,

    // Indices for "Saturday" and "Sunday" repsectively.
    weekendIndices: options.weekendIndices,

    // The containing element to our calendar.
    calendarContainer,

    // The element our calendar is constructed in.
    calendar,

    // Month of `startDate` or `dateSelected` (as a number).
    currentMonth: (startDate || dateSelected).getMonth(),

    // Month name in plain english - or not.
    currentMonthName: (options.months || months)[(startDate || dateSelected).getMonth()],

    // Year of `startDate` or `dateSelected`.
    currentYear: (startDate || dateSelected).getFullYear(),



    // Method to programmatically set the calendar's date.
    setDate,

    // Method that removes the calendar from the DOM along with associated events.
    remove,

    // Method to programmatically change the minimum selectable date.
    setMin,

    // Method to programmatically change the maximum selectable date.
    setMax,

    // Method to programmatically show the calendar.
    show,

    // Method to programmatically hide the calendar.
    hide,



    // Callback fired when a date is selected - triggered in `selectDay`.
    onSelect: options.onSelect,

    // Callback fired when the calendar is shown - triggered in `showCal`.
    onShow: options.onShow,

    // Callback fired when the calendar is hidden - triggered in `hideCal`.
    onHide: options.onHide,

    // Callback fired when the month is changed - triggered in `changeMonthYear`.
    onMonthChange: options.onMonthChange,

    // Function to customize the date format updated on <input> elements - triggered in `setCalendarInputValue`.
    formatter: options.formatter,

    // Function with custom logic that determines wether a given date is disabled or not.
    disabler: options.disabler,



    // Labels for months - custom or default.
    months: options.months || months,

    // Labels for days - custom or default.
    days: options.customDays || days,

    // Start day of the week - indexed from `days` above.
    startDay: options.startDay,

    // Custom overlay months.
    overlayMonths: options.overlayMonths || (options.months || months).map(m => m.slice(0, 3)),

    // Custom overlay placeholder.
    overlayPlaceholder: options.overlayPlaceholder || '4-digit year',

    // Custom overlay submit button.
    overlayButton: options.overlayButton || 'Submit',

    // Disable the overlay for changing the year.
    disableYearOverlay: !!options.disableYearOverlay,

    // Disable the datepicker on mobile devices.
    // Allows the use of native datepicker if the input type is 'date'.
    disableMobile: !!options.disableMobile,

    // Used in conjuntion with `disableMobile` above within `oneHandler`.
    isMobile: 'ontouchstart' in window,

    // Prevents the calendar from hiding.
    alwaysShow: !!options.alwaysShow,

    // Used to connect 2 datepickers together to form a daterange picker.
    id: options.id,

    // Shows a date in every square rendered on the calendar (preceding and trailing month days).
    showAllDates: !!options.showAllDates,

    // Prevents Datepicker from selecting dates when attached to inputs that are `disabled` or `readonly`.
    respectDisabledReadOnly: !!options.respectDisabledReadOnly,



    // Indicates this is the 1st instance in a daterange pair.
    first: options.first,

    // Indicates this is the 2nd instance in a daterange pair.
    second: options.second
  }

  /*
    Daterange processing!
    Ensure both instances have a reference to one another.
    Set min/max and original min/max dates on each instance.
  */
  if (sibling) {
    /* If we're here, we're encountering the 2nd instance in a daterange pair. */
    const first = sibling
    const second = instance
    const minDate = first.minDate || second.minDate
    const maxDate = first.maxDate || second.maxDate

    // Store the 1st instance as a sibling on the 2nd.
    second.sibling = first

    // Store the 2nd instance as a sibling on the 1st.
    first.sibling = second

    /*
      Daterange pairs share a min & max date.
      The 1st instance overrides the 2nd.
    */
    first.minDate = minDate
    first.maxDate = maxDate
    second.minDate = minDate
    second.maxDate = maxDate

    // Used to restore the min / max dates when a date is deselected.
    first.originalMinDate = minDate
    first.originalMaxDate = maxDate
    second.originalMinDate = minDate
    second.originalMaxDate = maxDate

    // Add a method that returns an object with start & end date selections for the pair.
    first.getRange = getRange
    second.getRange = getRange
  }

  // Initially populate the <input> field / set attributes on the `el`.
  if (dateSelected) setCalendarInputValue(el, instance)

  // Add any needed styles to the parent element.
  const computedPosition = getComputedStyle(parent).position

  if (!noPosition && (!computedPosition || computedPosition === 'static')) {
    // Indicate that the parent inline styles for position have been set.
    instance.inlinePosition = true

    // Add inline position styles.
    // I've seen that `element.style.position = '...'` isn't reliable.
    // https://mzl.la/2Yi6hNG
    parent.style.setProperty('position', 'relative')
  }

  // Ensure any pickers with a common parent that have
  // will ALL have the `inlinePosition` property.
  if (instance.inlinePosition) {
    datepickers.forEach(picker => {
      if (picker.parent === instance.parent) picker.inlinePosition = true
    })
  }

  // Keep track of all our instances in an array.
  datepickers.push(instance)

  // Put our instance's calendar in the DOM.
  calendarContainer.appendChild(calendar)
  parent.appendChild(calendarContainer)

  // Conditionally show the calendar.
  instance.alwaysShow && showCal(instance)

  return instance
}

/*
 *  Helper function to duplicate an object or array.
 *  Should help Babel avoid adding syntax that isn't IE compatible.
 */

function freshCopy(item) {
  if (Array.isArray(item)) return item.map(freshCopy)

  if (({}).toString.call(item) === '[object Object]') {
    return Object.keys(item).reduce((newObj, key) => {
      newObj[key] = freshCopy(item[key])
      return newObj
    }, {})
  }

  return item
}

/*
 *  Will run checks on the provided options object to ensure correct types.
 *  Returns an options object if everything checks out.
 */
function sanitizeOptions(opts, el) {
  // Check if the provided element already has a datepicker attached.
  if (datepickers.some(picker => picker.el === el)) throw 'A datepicker already exists on that element.'

  // Avoid mutating the original object that was supplied by the user.
  const options = freshCopy(opts)

  /*
    Check that various options have been provided a JavaScript Date object.
    If so, strip the time from those dates (for accurate future comparisons).
  */
  ;['startDate', 'dateSelected', 'minDate', 'maxDate'].forEach(value => {
    const date = options[value]
    if (date && !dateCheck(date)) throw `"options.${value}" needs to be a valid JavaScript Date object.`

    /*
      Strip the time from the date.
      For dates not supplied, stripTime will return undefined.
    */
    options[value] = stripTime(date)
  })

  let {
    position,
    maxDate,
    minDate,
    dateSelected,
    overlayPlaceholder,
    overlayButton,
    startDay,
    id
  } = options

  options.startDate = stripTime(options.startDate || dateSelected || new Date())


  // Checks around disabled dates.
  options.disabledDates = (options.disabledDates || []).map(date => {
    const newDateNum = +stripTime(date)

    if (!dateCheck(date)) throw 'You supplied an invalid date to "options.disabledDates".'
    if (newDateNum === +stripTime(dateSelected)) throw '"disabledDates" cannot contain the same date as "dateSelected".'

    // Return a number because `createMonth` checks this array for a number match.
    return newDateNum
  })

  // If id was provided, it cannot me null or undefined.
  if (options.hasOwnProperty('id') && id == null) {
    throw 'Id cannot be `null` or `undefined`'
  }

  /*
    Daterange processing!
    No more than 2 pickers can have the same id.
    Later on in `createInstance` we'll process the daterange pair further.
    Store values for `originalMinDate` & `originalMaxDate`.
    Store a reference to the 1st instance on the 2nd in the options -
      the 1st will get its reference to the 2nd in `createInstance`.
  */
  if (id || id === 0) {
    // Search through pickers already created and see if there's an id match for this one.
    const pickers = datepickers.filter(picker => picker.id === id)

    // No more than 2 pickers can have the same id.
    if (pickers.length > 1) throw 'Only two datepickers can share an id.'

    // 2nd - If we found a picker, THIS will be the 2nd in the pair. Set the sibling property on the options.
    if (pickers.length) {
      options.second = true
      options.sibling = pickers[0]

    // 1st - If no pickers were found, this is the 1st in the pair.
    } else {
      options.first = true
    }
  }

  /*
    Ensure the accuracy of `options.position` & call `establishPosition`.
    The 'c' option positions the calendar smack in the middle of the screen,
    *not* relative to the input. This can be desirable for mobile devices.
  */
  const positionFound = ['tr', 'tl', 'br', 'bl', 'c'].some(dir => position === dir)
  if (position && !positionFound) {
    throw '"options.position" must be one of the following: tl, tr, bl, br, or c.'
  }
  options.position = establishPosition(position || 'bl')

  // Check proper relationship between `minDate`, `maxDate`, & `dateSelected`.
  if (maxDate < minDate) throw '"maxDate" in options is less than "minDate".'
  if (dateSelected) {
    const dsErr = min => { throw `"dateSelected" in options is ${min ? 'less' : 'greater'} than "${min || 'mac'}Date".` }
    if (minDate > dateSelected) dsErr('min')
    if (maxDate < dateSelected) dsErr()
  }

  // Callbacks - default to a noop function.
  ['onSelect', 'onShow', 'onHide', 'onMonthChange', 'formatter', 'disabler'].forEach(fxn => {
    if (typeof options[fxn] !== 'function') options[fxn] = noop // `noop` defined at the top.
  })

  // Custom labels for months & days.
  ;['customDays', 'customMonths', 'customOverlayMonths'].forEach((label, i) => {
    const custom = options[label]
    const num = i ? 12 : 7

    // Do nothing if the user hasn't provided this custom option.
    if (!custom) return

    if (
      !Array.isArray(custom) || // Must be an array.
      custom.length !== num || // Must have the correct length.
      custom.some(item => typeof item !== 'string') // Must be an array of strings only.
    ) throw `"${label}" must be an array with ${num} strings.`

    options[!i ? 'days' : i < 2 ? 'months' : 'overlayMonths'] = custom
  })

  /*
    Adjust days of the week for user-provided start day.
    If `startDay` is a bad value, it will simply be ignored.
  */
  if (startDay && startDay > 0 && startDay < 7) {
    // [sun, mon, tues, wed, thurs, fri, sat]             (1) - original supplied days of the week
    let daysCopy = (options.customDays || days).slice()

    // Example with startDay of 3 (Wednesday)
    // daysCopy => [wed, thurs, fri, sat]                 (2) - the 1st half of the new array
    // chunk    => [sun, mon, tues]                       (3) - the 2nd half of the new array
    const chunk = daysCopy.splice(0, startDay)

    // [wed, thurs, fri, sat, sun, mon, tues]             (4) - the new days of the week
    options.customDays = daysCopy.concat(chunk)

    options.startDay = +startDay
    options.weekendIndices = [
      daysCopy.length - 1, // Last item in the 1st half of the edited array.
      daysCopy.length // Next item in the array, 1st item in the 2nd half of the edited array.
    ]
  } else {
    options.startDay = 0
    options.weekendIndices = [6, 0] // Indices of "Saturday" and "Sunday".
  }

  // Custom text for overlay placeholder & button.
  if (typeof overlayPlaceholder !== 'string') delete options.overlayPlaceholder
  if (typeof overlayButton !== 'string') delete options.overlayButton

  return options
}

/*
 *  Returns an object containing all the default settings.
 */
function defaults() {
  return {
    startDate: stripTime(new Date()),
    position: 'bl'
  }
}

/*
 *  Returns an object representing the position of the calendar
 *  relative to the calendar's <input> element.
 */
function establishPosition([p1, p2]) {
  const obj = {}

  obj[sides[p1]] = 1
  if (p2) obj[sides[p2]] = 1

  return obj
}

/*
 *  Renders a calendar, defaulting to the current year & month of that calendar.
 *  Populates `calendar.innerHTML` with the contents
 *  of the calendar controls, month, and overlay.
 */
function renderCalendar(instance, date) {
  const overlay = instance.calendar.querySelector('.qs-overlay')
  const overlayOpen = overlay && !overlay.classList.contains('qs-hidden')

  // Default to rendering the current month. This is helpful for re-renders.
  date = date || new Date(instance.currentYear, instance.currentMonth)

  instance.calendar.innerHTML = [
    createControls(date, instance, overlayOpen),
    createMonth(date, instance, overlayOpen),
    createOverlay(instance, overlayOpen)
  ].join('')

  /*
    When the overlay is open and we submit a year (or click a month), the calendar's
    html is recreated here. To make the overlay fade out the same way it faded in,
    we need to create it with the appropriate classes (triggered by `overlayOpen`),
    and then wait 10ms to take those classes back off, triggering a fade out.
  */
  if (overlayOpen) setTimeout(() => toggleOverlay(true, instance), 10)
}

/*
 *  Creates the calendar controls.
 *  Returns a string representation of DOM elements.
 */
function createControls(date, instance, overlayOpen) {
  return `
    <div class="qs-controls ${overlayOpen ? 'qs-blur' : ''}">
      <div class="qs-arrow qs-left"></div>
      <div class="qs-month-year">
        <span class="qs-month">${instance.months[date.getMonth()]}</span>
        <span class="qs-year">${date.getFullYear()}</span>
      </div>
      <div class="qs-arrow qs-right"></div>
    </div>
  `
}

/*
 *  Creates the calendar month structure.
 *  Returns a string representation of DOM elements.
 */
function createMonth(date, instance, overlayOpen) {
  const {
    // Dynamic properties.
    currentMonth,
    currentYear,
    dateSelected,
    maxDate,
    minDate,
    showAllDates,

    // Static properties.
    days,
    disabledDates,
    disabler,
    noWeekends,
    startDay,
    weekendIndices
  } = instance

  // Same year, same month?
  const today = new Date()
  const isThisMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth()

  // 1st of the month for whatever date we've been provided.
  const copy = stripTime(new Date(date).setDate(1)) // 1st of the month.

  // copy.getDay() - day of the week, 0-indexed.
  // startDay      - day of the week the calendar starts on, 0-indexed.
  const offset = copy.getDay() - startDay // Preceding empty squares.

  // Offsetting the start day may move back to a new 1st row.
  const precedingRow = offset < 0 ? 7 : 0

  // Bump the provided date to the 1st of the next month.
  copy.setMonth(copy.getMonth() + 1)

  // Move the provided date back a single day, resulting in the last day of the provided month.
  copy.setDate(0)

  // Last day of the month = how many quares get a number on the calendar.
  const daysInMonth = copy.getDate() // Squares with a number.

  // This array will contain string representations of HTML for all the calendar squares.
  const calendarSquares = []

  // Fancy calculations for the total # of squares.
  // The pipe operator truncates any decimals.
  let totalSquares = precedingRow + (((offset + daysInMonth) / 7 | 0) * 7)
  totalSquares += (offset + daysInMonth) % 7 ? 7 : 0

  // If the offest happens to be 0 but we did specify a `startDay`,
  // add 7 to prevent a missing row at the end of the calendar.
  if (startDay !== 0 && offset === 0) totalSquares += 7

  for (let i = 1; i <= totalSquares; i++) {
    const weekdayIndex = (i - 1) % 7
    const weekday = days[weekdayIndex]
    const num = i - (offset >= 0 ? offset : (7 + offset))
    const thisDay = new Date(currentYear, currentMonth, num) // No time so we can compare accurately :)
    const thisDayNum = thisDay.getDate()
    const outsideOfCurrentMonth = num < 1 || num > daysInMonth
    let otherClass = ''
    let span = `<span class="qs-num">${thisDayNum}</span>`

    // Squares outside the current month.
    if (outsideOfCurrentMonth) {
      otherClass = 'qs-empty'

      // Show dim dates for dates in preceding and trailing months.
      if (showAllDates) {
        otherClass += ' qs-disabled'

      // Show empty squares for dates in preceding and trailing months.
      } else {
        span = ''
      }

    // Disabled & current squares.
    } else {

      // Disabled dates.
      if (
        (minDate && thisDay < minDate) ||
        (maxDate && thisDay > maxDate) ||
        disabler(thisDay) ||
        disabledDates.includes(+thisDay) ||
        (noWeekends && weekendIndices.includes(weekdayIndex))
      ) otherClass = 'qs-disabled'

      // Current date, i.e. today's date.
      if (isThisMonth && num === today.getDate()) otherClass += ' qs-current'
    }

    // Currently selected day.
    if (+thisDay === +dateSelected && !outsideOfCurrentMonth) otherClass += ' qs-active'

    calendarSquares.push(`<div class="qs-square qs-num ${weekday} ${otherClass}">${span}</div>`)
  }

  // Add the header row of days of the week.
  const daysAndSquares = days
    .map(day =>`<div class="qs-square qs-day">${day}</div>`)
    .concat(calendarSquares)

  // Throw error...
  // The # of squares on the calendar should ALWAYS be a multiple of 7.
  if (daysAndSquares.length % 7 !== 0 ) {
    throw 'Calendar not constructed properly. The # of squares should be a multiple of 7.'
  }

  // Wrap it all in a tidy div.
  daysAndSquares.unshift(`<div class="qs-squares ${overlayOpen ? 'qs-blur' : ''}">`)
  daysAndSquares.push('</div>')
  return daysAndSquares.join('')
}

/*
 *  Creates the overlay for users to
 *  manually navigate to a month & year.
 */
function createOverlay(instance, overlayOpen) {
  const { overlayPlaceholder, overlayButton, overlayMonths } = instance
  const shortMonths = overlayMonths.map((m, i) => (`
      <div class="qs-overlay-month" data-month-num="${i}">
        <span data-month-num="${i}">${m}</span>
      </div>
  `)).join('')

  return `
    <div class="qs-overlay ${overlayOpen ? '' : 'qs-hidden'}">
      <div>
        <input class="qs-overlay-year" placeholder="${overlayPlaceholder}" />
        <div class="qs-close">&#10005;</div>
      </div>
      <div class="qs-overlay-month-container">${shortMonths}</div>
      <div class="qs-submit qs-disabled">${overlayButton}</div>
    </div>
  `
}

/*
 *  Highlights the selected date - or deselects it.
 *  Calls `setCalendarInputValue`.
 */
function selectDay(target, instance, deselect) {
  const {
    currentMonth,
    currentYear,
    calendar,
    el,
    onSelect,
    respectDisabledReadOnly,
    sibling
  } = instance
  const active = calendar.querySelector('.qs-active')
  const num = target.textContent

  // Prevent Datepicker from selecting (or deselecting) dates.
  if ((el.disabled || el.readOnly) && respectDisabledReadOnly) return

  // Keep track of the currently selected date.
  instance.dateSelected = deselect ? undefined : new Date(currentYear, currentMonth, num)

  // Re-establish the active (highlighted) date.
  if (active) active.classList.remove('qs-active')
  if (!deselect) target.classList.add('qs-active')

  // Populate the <input> field (or not) with a readble value
  // and store the individual date values as attributes.
  setCalendarInputValue(el, instance, deselect)

  // Hide the calendar after a day has been selected.
  // Keep it showing if deselecting.
  !deselect && hideCal(instance)

  if (sibling) {
    adjustDateranges({ instance, deselect })
    renderCalendar(instance)
    renderCalendar(sibling)
  }


  // Call the user-provided `onSelect` callback.
  // Passing in new date so there's no chance of mutating the original object.
  // In the case of a daterange, min & max dates are automatically set.
  onSelect(instance, deselect ? undefined : new Date(instance.dateSelected))
}

/*
  When selecting / deselecting a date, this resets `minDate` or `maxDate` on
  both pairs of a daterange based upon `originalMinDate` or `originalMaxDate`.
*/
function adjustDateranges({ instance, deselect }) {
  const first = instance.first ? instance : instance.sibling
  const second = first.sibling

  if (first === instance) {
    if (deselect) {
      first.minDate = first.originalMinDate
      second.minDate = second.originalMinDate
    } else {
      first.minDate = first.dateSelected
      second.minDate = first.dateSelected
    }
  } else {
    if (deselect) {
      second.maxDate = second.originalMaxDate
      first.maxDate = first.originalMaxDate
    } else {
      second.maxDate = second.dateSelected
      first.maxDate = second.dateSelected
    }
  }
}

/*
 *  Populates the <input> fields with a readable value
 *  and stores the individual date values as attributes.
 */
function setCalendarInputValue(el, instance, deselect) {
  if (instance.nonInput) return
  if (deselect) return el.value = ''
  if (instance.formatter !== noop) return instance.formatter(el, instance.dateSelected, instance)
  el.value = instance.dateSelected.toDateString()
}

/*
 *  2 Scenarios:
 *
 *  Updates `this.currentMonth` & `this.currentYear` based on right or left arrows.
 *  Creates a `newDate` based on the updated month & year.
 *  Calls `renderCalendar` with the updated date.
 *
 *  Changes the calendar to a different year
 *  from a users manual input on the overlay.
 *  Calls `renderCalendar` with the updated date.
 */
function changeMonthYear(classList, instance, year, overlayMonthIndex) {
  // Overlay.
  if (year || overlayMonthIndex) {
    if (year) instance.currentYear = year
    if (overlayMonthIndex) instance.currentMonth = +overlayMonthIndex

  // Month change.
  } else {
    instance.currentMonth += classList.contains('qs-right') ? 1 : -1

    // Month = 0 - 11
    if (instance.currentMonth === 12) {
      instance.currentMonth = 0
      instance.currentYear++
    } else if (instance.currentMonth === -1) {
      instance.currentMonth = 11
      instance.currentYear--
    }
  }

  instance.currentMonthName = instance.months[instance.currentMonth]

  renderCalendar(instance)
  instance.onMonthChange(instance)
}

/*
 *  Sets the `top` & `left` inline styles on the container after doing calculations.
 */
function calculatePosition(instance) {
  // Don't position the calendar in reference to the <body> or <html> elements.
  if (instance.noPosition) return

  const { el, calendarContainer, position, parent } = instance
  const { top, right, centered } = position

  if (centered) return calendarContainer.classList.add('qs-centered')

  const [parentRect, elRect, calRect] = [parent, el, calendarContainer].map(x => x.getBoundingClientRect())
  const offset = elRect.top - parentRect.top + parent.scrollTop
  const topStyle = `${offset - (top ? calRect.height : (elRect.height * -1))}px`
  const leftStyle = `${elRect.left - parentRect.left + (right ? elRect.width - calRect.width : 0)}px`

  calendarContainer.style.setProperty('top', topStyle)
  calendarContainer.style.setProperty('left', leftStyle)
}

/*
 *  Checks for a valid date object.
 */
function dateCheck(date) {
  return (
    ({}).toString.call(date) === '[object Date]' &&
    date.toString() !== 'Invalid Date'
  )
}

/*
 *  Takes a date or number and returns a date stripped of its time (hh:mm:ss:ms).
 *  Returns a new date object.
 *  Returns undefined for invalid date objects.
 */
function stripTime(dateOrNum) {
  // NOTE: in `createMonth`, `stripTime` is passed a number.
  /*
    JavaScript gotcha:
      +(undefined) => NaN
      +(null) => 0
  */

  // Implicit `undefined` here, later checked elsewhere.
  if (!dateCheck(dateOrNum) && (typeof dateOrNum !== 'number' || isNaN(dateOrNum))) return

  const date = new Date(+dateOrNum)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/*
 *  Hides the calendar and calls the `onHide` callback.
 */
function hideCal(instance) {
  if (instance.disabled) return

  toggleOverlay(true, instance)
  !instance.alwaysShow && instance.calendarContainer.classList.add('qs-hidden')
  instance.onHide(instance)
}

/*
 *  Shows the calendar and calls the `onShow` callback.
 */
function showCal(instance) {
  if (instance.disabled) return

  instance.calendarContainer.classList.remove('qs-hidden')
  calculatePosition(instance)
  instance.onShow(instance)
}

/*
 *  Show / hide the change-year overlay.
 */
function toggleOverlay(closing, instance) {
  /*
    .qs-overlay  - The dark overlay element containing the year input & submit button.
    .qs-controls - The header of the calendar containing the left / right arrows & month / year.
    .qs-squares  - The container for all the squares making up the grid of the calendar.
  */


  /*
    This function is called within a `setTimeout` inside `renderCalendar`.
    What if `.remove()` was called within that time span? There would be no properties on
    instance anymore since `.remove()` removes them all. Return here to avoid errors.
    This is highly unlikely to happen, but in case the instances are tied to other functions
    in the users program, and perhaps those functions remove the calendar, avoid errors here.
  */
  const { calendar } = instance
  if (!calendar) return

  const overlay = calendar.querySelector('.qs-overlay')
  const yearInput = overlay.querySelector('.qs-overlay-year')
  const controls = calendar.querySelector('.qs-controls')
  const squaresContainer = calendar.querySelector('.qs-squares')

  if (closing) {
    overlay.classList.add('qs-hidden')
    controls.classList.remove('qs-blur')
    squaresContainer.classList.remove('qs-blur')
    yearInput.value = ''
  } else {
    overlay.classList.remove('qs-hidden')
    controls.classList.add('qs-blur')
    squaresContainer.classList.add('qs-blur')
    yearInput.focus()
  }
}

/*
 *  Calls `changeMonthYear` when a year is submitted and
 *  conditionally enables / disables the submit button.
 */
function overlayYearEntry(e, input, instance, overlayMonthIndex) {
  // Fun fact: 275760 is the largest year for a JavaScript date. #TrialAndError

  const badDate = isNaN(+new Date().setFullYear(input.value || undefined))
  const value = badDate ? null : input.value

  // Enter has been pressed OR submit was clicked.
  if ((e.which || e.keyCode) === 13 || e.type === 'click') {
    if (overlayMonthIndex) {
      changeMonthYear(null, instance, value, overlayMonthIndex)
    } else if (!badDate && !input.classList.contains('qs-disabled')) {
      changeMonthYear(null, instance, value, overlayMonthIndex)
    }

  // Enable / disabled the submit button.
  } else if (instance.calendar.contains(input)) { // Scope to one calendar instance.
    const submit = instance.calendar.querySelector('.qs-submit')
    submit.classList[badDate ? 'add' : 'remove']('qs-disabled')
  }
}


///////////////////
// EVENT HANDLER //
///////////////////

/*
 *  A single function to handle the 4 events we track - click, focusin, keydown, & input.
 *  Only one listener is applied to the document (not window). It is removed once
 *  all datepicker instances have had their `remove` method called.
 */
function oneHandler(e) {
  const { type, target } = e
  const { classList } = target
  const [instance] = datepickers.filter(({ calendar, el }) => (
    calendar.contains(target) || el === target
  ))
  const onCal = instance && instance.calendar.contains(target)


  // Ignore event handling for mobile devices when disableMobile is true.
  if (instance && instance.isMobile && instance.disableMobile) return


  ////////////
  // EVENTS //
  ////////////

  if (type === 'click') {
    // Anywhere other than the calendar - close the calendar.
    if (!instance) return datepickers.forEach(hideCal)

    // Do nothing for disabled calendars.
    if (instance.disabled) return

    const { calendar, calendarContainer, disableYearOverlay } = instance
    const input = calendar.querySelector('.qs-overlay-year')
    const overlayClosed = !!calendar.querySelector('.qs-hidden')
    const monthYearClicked = calendar.querySelector('.qs-month-year').contains(target)
    const newMonthIndex = target.dataset.monthNum

    // Calendar's el is 'body'.
    // Anything but the calendar was clicked.
    if (instance.noPosition && !onCal) {
      // Show / hide a calendar whose el is html or body.
      const calendarClosed = calendarContainer.classList.contains('qs-hidden')
      ;(calendarClosed ? showCal : hideCal)(instance)

    // Clicking the arrow buttons - change the calendar month.
    } else if (classList.contains('qs-arrow')) {
      changeMonthYear(classList, instance)

    // Clicking the month/year - open the overlay.
    // Clicking the X on the overlay - close the overlay.
    } else if (monthYearClicked || classList.contains('qs-close')) {
      !disableYearOverlay && toggleOverlay(!overlayClosed, instance)

    // Clicking a month in the overlay - the <span> inside might have been clicked.
    } else if (newMonthIndex) {
      overlayYearEntry(e, input, instance, newMonthIndex)

    // Clicking a number square - process whether to select that day or not.
    } else if (classList.contains('qs-num')) {
      const targ = target.nodeName === 'SPAN' ? target.parentNode : target
      const doNothing = ['qs-disabled', 'qs-empty'].some(cls => targ.classList.contains(cls))

      if (targ.classList.contains('qs-active')) return selectDay(targ, instance, true)

      return !doNothing && selectDay(targ, instance)

    // Clicking the submit button in the overlay.
    } else if (classList.contains('qs-submit') && !classList.contains('qs-disabled')) {
      overlayYearEntry(e, input, instance)
    }

  /*
    Only pay attention to `focusin` events if the calendar's el is an <input>.
    We use the `focusin` event because it bubbles - `focus` does not bubble.
  */
  } else if (type === 'focusin' && instance) {
    // Show this intance.
    showCal(instance)

    // Hide all other instances.
    datepickers.forEach(picker => picker !== instance && hideCal(picker))
  } else if (type === 'keydown' && instance && !instance.disabled) {
    const overlay = instance.calendar.querySelector('.qs-overlay')
    const overlayShowing = !overlay.classList.contains('qs-hidden')

    // Pressing enter while the overlay is open.
    if ((e.which || e.keyCode) === 13 && overlayShowing && onCal) {
      overlayYearEntry(e, target, instance)

    // ESC key pressed.
    } else if ((e.which || e.keyCode) === 27 && overlayShowing && onCal) {
      toggleOverlay(true, instance)
    }
  } else if (type === 'input') {
    // Avoid applying these restrictions to other inputs on the page.
    if (!instance || !instance.calendar.contains(target)) return

    // Only allow numbers & a max length of 4 characters.
    const submitButton = instance.calendar.querySelector('.qs-submit')
    const newValue = target.value
      .split('')
      // Prevent leading 0's.
      .reduce((acc, char) => {
        if (!acc && char === '0') return ''
        return acc + (char.match(/[0-9]/) ? char : '')
      }, '')
      .slice(0, 4)

    // Set the new value of the input and conditionally enable / disable the submit button.
    target.value = newValue
    submitButton.classList[newValue.length === 4 ? 'remove' : 'add']('qs-disabled')
  }
}


//////////////////////
// INSTANCE METHODS //
//////////////////////

/*
 *  Programmatically show the calendar.
 */
function show() {
  showCal(this)
}

/*
 *  Programmatically hide the calendar.
 */
function hide() {
  hideCal(this)
}

/*
 *  Programmatically sets the date on an instance
 *  and updates all associated properties.
 *  Will re-render the calendar if it is showing.
 */
function setDate(newDate, changeCalendar) {
  const date = stripTime(newDate) // Remove the time, creating a fresh date object.
  const { currentYear, currentMonth, sibling } = this

  // Removing the selected date.
  if (newDate == null) {
    // Remove the date.
    this.dateSelected = undefined

    // Clear the associated input field.
    setCalendarInputValue(this.el, this, true)

    // Daterange processing!
    if (sibling) {
      adjustDateranges({ instance: this, deselect: true })
      renderCalendar(sibling)
    }

    // Re-render the calendar to clear the selected date.
    renderCalendar(this)

    // Return the instance to enable chaining methods.
    return this

  // Date isn't undefined or null but still falsey.
  } else if (!dateCheck(newDate)) {
    throw '`setDate` needs a JavaScript Date object.'
  }


  /*
   * Anything below this line is for setting a new date.
   */


  // Check if the date is selectable.
  if (
    this.disabledDates.some(d => +d === +date) ||
    date < this.minDate ||
    date > this.maxDate
  ) throw "You can't manually set a date that's disabled."

  this.currentYear = date.getFullYear()
  this.currentMonth = date.getMonth()
  this.currentMonthName = this.months[date.getMonth()]
  this.dateSelected = date

  setCalendarInputValue(this.el, this)

  if (sibling) {
    adjustDateranges({ instance: this })
    renderCalendar(sibling, date)
  }

  const isSameMonth = currentYear === date.getFullYear() && currentMonth === date.getMonth()
  ;(isSameMonth || changeCalendar || sibling) && renderCalendar(this, date)

  return this
}

/*
 *  Programmatically changes the minimum selectable date.
 */
function setMin(date) {
  return changeMinOrMax(this, date, true)
}

/*
 *  Programmatically changes the maximum selectable date.
 */
function setMax(date) {
  return changeMinOrMax(this, date)
}

/*
 *  Called by `setMin` and `setMax`.
 */
function changeMinOrMax(instance, date, isMin) {
  const { dateSelected, first, sibling, minDate, maxDate } = instance
  const newDate = stripTime(date)
  const type = isMin ? 'Min' : 'Max'

  const origProp = () => `original${type}Date`
  const prop = () => `${type.toLowerCase()}Date`
  const method = () => `set${type}`
  const throwOutOfRangeError = () => { throw `Out-of-range date passed to ${method()}` }

  // Removing min / max.
  if (date == null) {
    /*
      Scenarios:
        * minDate
          * 1st && 1st selected
          * 2nd && 1st selected
        * maxDate
          * 2nd && 2nd selected
          * 1st && 2nd selected
    */

    // When removing a date, always remove the original min/max date.
    instance[origProp()] = undefined

    // Daterange processing!
    if (sibling) {
      sibling[origProp()] = undefined // Remove the original min/max date.

      // Removing the min.
      if (isMin) {
        if ((first && !dateSelected) || (!first && !sibling.dateSelected)) {
          instance.minDate = undefined
          sibling.minDate = undefined
        }

      // Removing the max.
      } else if ((first && !sibling.dateSelected) || (!first && !dateSelected)) {
        instance.maxDate = undefined
        sibling.maxDate = undefined
      }

    // Regular instances.
    } else {
      instance[prop()] = undefined
    }

  // Throw an error for invalid dates.
  } else if (!dateCheck(date)) {
    throw `Invalid date passed to ${method()}`

  // Setting min / max.
  } else if (sibling) {
    /*
      Acceptable ranges for setting minDate or maxDate:
        * Daterange
          * minDate
            * -∞ -> (dateSelected || maxDate)
          * maxDate
            * (dateSelected || minDate) -> ∞
        * Regular
          * minDate
            * -∞ -> (dateSeleted || maxDate)
          * maxDate
            * (dateSelected || minDate) -> ∞
    */

    // Check for dates out of range for daterange pairs.
    if (
      // 1st instance checks.
      (first && isMin && newDate > (dateSelected || maxDate)) || // setMin
      (first && !isMin && newDate < (sibling.dateSelected || minDate)) || // setMax

      // 2nd instance checks.
      (!first && isMin && newDate > (sibling.dateSelected || maxDate)) || // setMin
      (!first && !isMin && newDate < (dateSelected || minDate)) // setMax
    ) throwOutOfRangeError()

    instance[origProp()] = newDate
    sibling[origProp()] = newDate

    if (
      //setMin
      (isMin && ((first && !dateSelected) || (!first && !sibling.dateSelected))) ||

      //setMax
      (!isMin && ((first && !sibling.dateSelected) || (!first && !dateSelected)))
    ) {
      instance[prop()] = newDate
      sibling[prop()] = newDate
    }

  // Individual instance.
  } else {
    // Check for dates our of range for single instances.
    if (
      (isMin && newDate > (dateSelected || maxDate)) || // minDate
      (!isMin && newDate < (dateSelected || minDate)) // maxDate
    ) throwOutOfRangeError()

    instance[prop()] = newDate
  }

  sibling && renderCalendar(sibling)
  renderCalendar(instance)

  return instance
}

/**
 *
 *  Returns an object with start & end date selections.
 *  Available onCal daterange pairs only.
 */
function getRange() {
  const first = this.first ? this : this.sibling
  const second = first.sibling

  return {
    start: first.dateSelected,
    end: second.dateSelected
  }
}

/*
 *  Removes the current instance from the array of instances.
 *  Removes the instance calendar from the DOM.
 *  Removes the event listeners if this is the last instance.
 */
function remove() {
  // NOTE: `this` is the datepicker instance.
  const { inlinePosition, parent, calendarContainer, el, sibling } = this

  // Remove styling done to the parent element and reset it back to its original
  // only if there are no other instances using the same parent.
  if (inlinePosition) {
    const found = datepickers.some(picker => picker !== this && picker.parent === parent)
    if (!found) parent.style.setProperty('position', null)
  }

  // Remove the calendar from the DOM.
  calendarContainer.remove()

  // Remove this instance from the list.
  datepickers = datepickers.filter(picker => picker.el !== el)

  // Remove siblings references.
  if (sibling) delete sibling.sibling

  // Empty this instance of all properties.
  for (let prop in this) delete this[prop]

  // If this was the last datepicker in the list, remove the event handlers.
  if (!datepickers.length) {
    events.forEach(event => document.removeEventListener(event, oneHandler))
  }
}

module.exports = datepicker
