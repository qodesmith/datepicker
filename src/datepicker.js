require('./datepicker.less')


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
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left',
  c: 'centered' // This fixes the calendar smack in the middle of the screen.
}

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
  if (!datepickers.length) applyListeners()

  // Create the datepicker instance!
  const instance = createInstance(selector, options)
  const { startDate, dateSelected } = instance

  renderCalendar(startDate || dateSelected, instance)

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
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector
  const options = sanitizeOptions(opts || defaults(), el)

  const { startDate, dateSelected } = options
  const noPosition = el === document.body
  const parent = noPosition ? document.body : el.parentElement
  const calendar = document.createElement('div')
  calendar.className = 'qs-datepicker qs-hidden'

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

    // An array of dates to disable.
    disabledDates: options.disabledDates,

    // Low end of selectable dates.
    minDate: options.minDate,

    // High end of selectable dates.
    maxDate: options.maxDate,

    // Disabled the ability to select days on the weekend.
    noWeekends: !!options.noWeekends,

    // Indices for "Saturday" and "Sunday" repsectively.
    weekendIndices: options.weekendIndices,

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
    id: options.id
  }

  // Set a reference to each sibling on each instance.
  // This will only be true the 2nd time an id is encountered.
  if (options.sibling) {
    instance.sibling = options.sibling
    instance.sibling.first = true // Flag the first instance in a sibling pair.
    options.sibling.sibling = instance
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
    // https://goo.gl/vWYcpH
    parent.style.setProperty('position', 'relative')
  }

  // Ensure any pickers with a common parent that have
  // will ALL have the `inlinePosition` property.
  if (instance.inlinePosition) {
    datepickers
      .filter(picker => picker.parent === instance.parent)
      .forEach(picker => picker.inlinePosition = true)
  }

  // Keep track of all our instances in an array.
  datepickers.push(instance)

  // Put our instance's calendar in the DOM.
  parent.appendChild(calendar)

  // Conditionally show the calendar.
  instance.alwaysShow && showCal(instance)

  return instance
}

/*
 *  Helper function to duplicate copy an object or array.
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
  if (datepickers.some(picker => picker.el === el)) {
    throw 'A datepicker already exists on that element.'
  }

  // Avoid mutating the original object that was supplied by the user.
  const options = freshCopy(opts)

  let {
    position,
    maxDate,
    minDate,
    dateSelected,
    customMonths,
    customDays,
    overlayPlaceholder,
    overlayButton,
    startDay,
    disabledDates
  } = options

  // If id was provided, it cannot me null or undefined.
  if (options.hasOwnProperty('id') && options.id == null) {
    throw 'Id cannot be `null` or `undefined`'
  }

  // No more than 2 pickers can have the same id.
  if (options.id) {
    const pickers = datepickers.reduce((acc, picker) => {
      if (picker.id === options.id) acc.push(picker)
      return acc
    }, [])

    if (pickers.length > 1) throw 'Only two datepickers can share an id.'
    if (pickers.length) options.sibling = pickers[0]
  }

  // Checks around disabled dates.
  options.disabledDates = (disabledDates || []).map(date => {
    if (!dateCheck(date)) {
      throw 'You supplied an invalid date to "options.disabledDates".'
    } else if (+stripTime(date) === +stripTime(dateSelected)) {
      throw '"disabledDates" cannot contain the same date as "dateSelected".'
    }

    return +stripTime(date)
  })

  // Ensure the accuracy of `options.position` & call `establishPosition`.
  // The 'c' option positions the calendar smack in the middle of the screen,
  // *not* relative to the input. This can be desirable for mobile devices.
  const positionFound = ['tr', 'tl', 'br', 'bl', 'c'].some(dir => position === dir)
  if (position && !positionFound) {
    throw '"options.position" must be one of the following: tl, tr, bl, br, or c.'
  }
  options.position = establishPosition(position || 'bl')

  // Check that various options have been provided a JavaScript Date object.
  // If so, strip the time from those dates (for accurate future comparisons).
  ;['startDate', 'dateSelected', 'minDate', 'maxDate'].forEach(date => {
    if (options[date]) {
      if (!dateCheck(options[date]) || isNaN(+options[date])) {
        throw `"options.${date}" needs to be a valid JavaScript Date object.`
      }

      // Strip the time from the date.
      options[date] = stripTime(options[date])
    }
  })

  options.startDate = stripTime(options.startDate || options.dateSelected || new Date())

  if (maxDate < minDate) {
    throw '"maxDate" in options is less than "minDate".'
  }

  if (dateSelected) {
    if (minDate > dateSelected) {
      throw '"dateSelected" in options is less than "minDate".'
    }

    if (maxDate < dateSelected) {
      throw '"dateSelected" in options is greater than "maxDate".'
    }
  }

  // Callbacks.
  ['onSelect', 'onShow', 'onHide', 'onMonthChange', 'formatter', 'disabler'].forEach(fxn => {
    options[fxn] = typeof options[fxn] === 'function' && options[fxn]
  })


  // Custom labels for months & days.
  ;[customMonths, customDays].forEach((custom, i) => {
    if (!custom) return

    const errorMsgs = [
      '"customMonths" must be an array with 12 strings.',
      '"customDays" must be an array with 7 strings.'
    ]
    const wrong = (
      !Array.isArray(custom) || // Must be an array.
      custom.length !== (i ? 7 : 12) || // Must have the corrent length.
      custom.some(item => typeof item !== 'string') // Must contain only strings.
    )

    if (wrong) throw errorMsgs[i]

    options[i ? 'days' : 'months'] = custom
  })

  // Adjust days of the week for user-provided start day.
  if (startDay && +startDay > 0 && +startDay < 7) {
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
 *  Renders a calendar.
 *  Populates `calendar.innerHTML` with the contents
 *  of the calendar controls, month, and overlay.
 */
function renderCalendar(date, instance) {
  const overlay = instance.calendar.querySelector('.qs-overlay')
  const overlayOpen = overlay && !overlay.classList.contains('qs-hidden')

  instance.calendar.innerHTML = [
    createControls(date, instance, overlayOpen),
    createMonth(date, instance, overlayOpen),
    createOverlay(instance, overlayOpen)
  ].join('')

  /*
    When the overlay is open and we submit a year, the calendar's html
    is recreated here. To make the overlay fade out the same way it faded in,
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
    const thisDay = new Date(currentYear, currentMonth, num)
    const isEmpty = num < 1 || num > daysInMonth
    let otherClass = ''
    let span = `<span class="qs-num">${num}</span>`

    // Empty squares.
    if (isEmpty) {
      otherClass = 'qs-empty'
      span = ''

    // Disabled & current squares.
    } else {
      let disabled = (
        (minDate && thisDay < minDate) ||
        (maxDate && thisDay > maxDate) ||
        (disabler && disabler(thisDay)) ||
        disabledDates.includes(+thisDay)
      )
      const isWeekend = weekendIndices.includes(weekdayIndex)
      const currentValidDay = isThisMonth && !disabled && num === today.getDate()

      disabled = disabled || (noWeekends && isWeekend)
      otherClass = disabled ? 'qs-disabled' : currentValidDay ? 'qs-current' : ''
    }

    // Currently selected day.
    if (+thisDay === +dateSelected && !isEmpty) otherClass += ' qs-active'

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
  const { overlayPlaceholder, overlayButton } = instance

  return `
    <div class="qs-overlay ${overlayOpen ? '' : 'qs-hidden'}">
      <div class="qs-close">&#10005;</div>
      <input class="qs-overlay-year" placeholder="${overlayPlaceholder}" />
      <div class="qs-submit qs-disabled">${overlayButton}</div>
    </div>
  `
}

/*
 *  Highlights the selected date - or deselects it.
 *  Calls `setCalendarInputValue`.
 */
function selectDay(target, instance, deselect) {
  const { currentMonth, currentYear, calendar, el, onSelect } = instance
  const active = calendar.querySelector('.qs-active')
  const num = target.textContent

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

  // Call the user-provided `onSelect` callback.
  // Passing in new date so there's no chance of mutating the original object.
  onSelect && onSelect(instance, deselect ? undefined : new Date(instance.dateSelected))
}

/*
 *  Populates the <input> fields with a readble value
 *  and stores the individual date values as attributes.
 */
function setCalendarInputValue(el, instance, deselect) {
  if (instance.nonInput) return
  if (deselect) return el.value = ''
  if (instance.formatter) return instance.formatter(el, instance.dateSelected, instance)
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
function changeMonthYear(classList, instance, year) {
  // Overlay.
  if (year) {
    instance.currentYear = year

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

  const newDate = new Date(instance.currentYear, instance.currentMonth, 1)
  renderCalendar(newDate, instance)

  instance.onMonthChange && instance.onMonthChange(instance)
}

/*
 *  Sets the `style` attribute on the calendar after doing calculations.
 */
function calculatePosition(instance) {
  // Don't position the calendar in reference to the <body> or <html> elements.
  if (instance.noPosition) return

  const { el, calendar, position, parent } = instance
  const { top, right, centered } = position

  if (centered) return calendar.classList.add('qs-centered')

  const [parentRect, elRect, calRect] = [parent, el, calendar].map(x => x.getBoundingClientRect())
  const offset = elRect.top - parentRect.top + parent.scrollTop
  const style = `
    top:${offset - (top ? calRect.height : (elRect.height * -1))}px;
    left:${elRect.left - parentRect.left + (right ? elRect.width - calRect.width : 0)}px;
  `

  calendar.setAttribute('style', style)
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
 */
function stripTime(dateOrNum) {
  /*
    JavaScript gotcha:
    +(undefined) => NaN
    +(null) => 0

    We need to do `dateOrNum == null` because relying on `+dateOrNum`
    may actually result in `0`, thereby rendering an actual date!
  */
  const date = new Date(+dateOrNum)
  if (dateOrNum == null || !dateCheck(date)) return undefined
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/*
 *  Hides the calendar and calls the `onHide` callback.
 */
function hideCal(instance, api) {
  toggleOverlay(true, instance)
  !instance.alwaysShow && instance.calendar.classList.add('qs-hidden')
  !api && instance.onHide && instance.onHide(instance)
}

/*
 *  Shows the calendar and calls the `onShow` callback.
 */
function showCal(instance, api) {
  instance.calendar.classList.remove('qs-hidden')
  calculatePosition(instance)
  !api && instance.onShow && instance.onShow(instance)
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

  const { calendar } = instance
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
function overlayYearEntry(e, input, instance) {
  // Fun fact: 275760 is the largest year for a JavaScript date. #TrialAndError

  const badDate = isNaN(+new Date().setFullYear(input.value || undefined))

  // Enter has been pressed OR submit was clicked.
  if ((e.which || e.keyCode) === 13 || e.type === 'click') {
    if (badDate || input.classList.contains('qs-disabled')) return
    changeMonthYear(null, instance, input.value, true)

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
  const instance = datepickers.filter(({ calendar, el }) => (
    calendar.contains(target) || el === target
  ))[0]
  const onCal = instance && instance.calendar.contains(target)

  // Ignore event handling for mobile devices when disableMobile is true.
  if (instance && instance.isMobile && instance.disableMobile) return


  ////////////
  // EVENTS //
  ////////////

  if (type === 'click') {
    // Anywhere other than the calendar - close the calendar.
    if (!instance) return datepickers.forEach(hideCal)

    const { calendar, disableYearOverlay } = instance
    const overlayClosed = !!calendar.querySelector('.qs-hidden')
    const monthYearClicked = calendar.querySelector('.qs-month-year').contains(target)

    // Calendar's el is 'body'.
    // Anything but the calendar was clicked.
    if (instance.noPosition && !onCal) {
      // Show / hide a calendar whose el is html or body.
      const calendarClosed = calendar.classList.contains('qs-hidden')
      ;(calendarClosed ? showCal : hideCal)(instance)

    // Clicking the arrow buttons - change the calendar month.
    } else if (classList.contains('qs-arrow')) {
      changeMonthYear(classList, instance)

    // Clicking the month/year - open the overlay.
    // Clicking the X on the overlay - close the overlay.
    } else if (monthYearClicked || classList.contains('qs-close')) {
      !disableYearOverlay && toggleOverlay(!overlayClosed, instance)

    // Clicking a number square - process whether to select that day or not.
    } else if (classList.contains('qs-num')) {
      const targ = target.nodeName === 'SPAN' ? target.parentNode : target
      const doNothing = ['qs-disabled', 'qs-empty'].some(cls => targ.classList.contains(cls))

      if (targ.classList.contains('qs-active')) return selectDay(targ, instance, true)

      return !doNothing && selectDay(targ, instance)

    // Clicking the submit button in the overlay.
    } else if (classList.contains('qs-submit') && !classList.contains('qs-disabled')) {
      const input = calendar.querySelector('.qs-overlay-year')
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
  } else if (type === 'keydown' && instance) {
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
    const submitButton = target.parentElement.querySelector('.qs-submit')
    const newValue = target.value
      .split('')
      // Prevent leading 0's.
      .reduce((acc, char) => {
        if (!acc && char === '0') return ''
        return char.match(/[0-9]/) ? (acc + char) : acc
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
  showCal(this, true)
}

/*
 *  Programmatically hide the calendar.
 */
function hide() {
  hideCal(this, true)
}

/*
 *  Programmatically sets the date on an instance
 *  and updates all associated properties.
 *  Will re-render the calendar if it is showing.
 */
function setDate(newDate, changeCalendar) {
  const date = stripTime(newDate) // Remove the time.
  const { currentYear, currentMonth } = this

  if (date !== undefined && !date) throw '`setDate` needs a JavaScript Date object.'

  // Removing the selected date.
  if (date === undefined) {
    // Remove the date.
    this.dateSelected = undefined

    // Remove the min or max depending on if this is a daterange pair.
    if (this.sibling) this.first ? this.setMin() : this.setMax()

    // Clear the associated input field.
    setCalendarInputValue(this.el, this, true)

    // Re-render the calendar to clear the selected date.
    renderCalendar(new Date(this.currentYear, this.currentMonth), this)

    // Return the instance to enable chaining methods.
    return this
  }

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

  const isSameMonth = currentYear === date.getFullYear() && currentMonth === date.getMonth()
  ;(isSameMonth || changeCalendar) && renderCalendar(date, this)

  // Ensure min / max values are correct with siblings.
  if (this.sibling) {
    const method = this.first ? 'setMin' : 'setMax'
    this[method](date)
    this.sibling[method](date)
  }

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
function changeMinOrMax(instance, newDate, isMin, processingSibling) {
  if (newDate != undefined && !dateCheck(newDate)) throw `Invalid date passed to set${isMin ? 'Min' : 'Max'}`

  const { dateSelected } = instance
  const date = stripTime(newDate)

  if (isMin && date > instance.maxDate) throw `You can't set the minimum date past the maximum.`
  if (!isMin && date < instance.minDate) throw `You can't set the maximum date below the minimum.`

  // Remove the selected date if it falls outside the
  // min/max range and clear its input if it has one.
  if (dateSelected) {
    /*
      Is a daterange instance:
        1. isMin changes selected date on first instance
        2. !isMin changes selected date on second instance
    */
    if (instance.sibling) {
      if ((isMin && instance.first) || (!isMin && !instance.first)) {
        instance.dateSelected = date
      }

    /*
      Not a daterange instance:
      1. Min is set after the selected date.
      2. Max is set before the selected date.
    */
    } else if ((isMin && dateSelected < date) || (!isMin && dateSelected > date)) {
      instance.dateSelected = undefined

      if (!instance.nonInput) instance.el.value = ''
    }
  }

  instance[isMin ? 'minDate' : 'maxDate'] = date
  renderCalendar(dateSelected || instance.startDate, instance)

  if (!processingSibling && instance.sibling) {
    changeMinOrMax(instance.sibling, date, isMin, true)
  }

  return instance
}

/*
 *  Removes the current instance from the array of instances.
 *  Removes the instance calendar from the DOM.
 *  Removes the event listeners if this is the last instance.
 */
function remove() {
  // NOTE: `this` is the datepicker instance.
  const { inlinePosition, parent, calendar, el, sibling } = this

  // Remove styling done to the parent element and reset it back to its original
  // only if there are no other instances using the same parent.
  if (inlinePosition) {
    const found = datepickers.some(picker => picker !== this && picker.parent === parent)
    if (!found) parent.style.setProperty('position', null)
  }

  // Remove the calendar from the DOM.
  calendar.remove()

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
