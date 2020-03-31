/*
  Importing this scss file so as to declare it's a dependency in the library.
  Webpack will then separate it out into its own css file and include it in the dist folder.
*/
require('./datepicker.scss')


var datepickers = [] // Get's reassigned in `remove()` below.
var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
var months = [
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
var sides = {
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
function noop() {}

/*
  Add a single function as the handler for a few events for ALL datepickers.
  Storing events in an array to access later in the `remove` fxn below.
  Using `focusin` because it bubbles, `focus` does not.
*/
var events = ['click', 'focusin', 'keydown', 'input']


/*
 *  Datepicker! Get a date with JavaScript...
 */
function datepicker(selectorOrElement, options) {
    // Create the datepicker instance!
  var instance = createInstance(selectorOrElement, options)

  // Apply the event listeners to the document only once.
  if (!datepickers.length) applyListeners(document)

  // Apply the event listeners to a particular shadow DOM only once.
  if (instance.shadowDom) {
    var shadowDomAlreadyInUse = datepickers.some(function(picker) { return picker.shadowDom === instance.shadowDom })
    if (!shadowDomAlreadyInUse) applyListeners(instance.shadowDom)
  }

  // Keep track of all our instances in an array.
  datepickers.push(instance)

  /*
    Daterange processing!
    When we encounted the 2nd in a pair, we need run both through `adjustDateranges`
    to handle the min & max settings, and we need to re-render the 1st.
  */
  if (instance.second) {
    var first = instance.sibling

    // Adjust both dateranges.
    adjustDateranges({ instance: instance, deselect: !instance.dateSelected })
    adjustDateranges({ instance: first, deselect: !first.dateSelected })

    // Re-render the first daterange instance - the 2nd will be rendered below.
    renderCalendar(first)
  }

  renderCalendar(instance, instance.startDate || instance.dateSelected)
  if (instance.alwaysShow) calculatePosition(instance)

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
function applyListeners(documentOrShadowDom) {
  /*
    Using document instead of window because #iphone :/
    Safari won't handle the click event properly if it's on the window.
  */
  events.forEach(function(event) {
    documentOrShadowDom.addEventListener(event, documentOrShadowDom === document ? oneHandler : shadowDomHandler)
  })
}

/*
 *  Creates a datepicker instance after sanitizing the options.
 *  Calls `setCalendarInputValue` and conditionally `showCal`.
 */
function createInstance(selectorOrElement, opts) {
  var options = sanitizeOptions(opts || defaults())

  /*
    This will get assigned the shadow DOM if the calendar is in one.
    We use this property to trigger an extra event listener on the shadow DOM
    as well as tell the <body> listener to ignore events from the shadow DOM.
  */
  var shadowDom

  /*
    This will get assigned the <custom-element> containing the shadow DOM.
    This can potentially eventually become `positionedEl` (stored on the instance object).
    It is used for positioning purposes. See the explanation below where `positionedEl` is defined.

    PLEASE NOTE - custom elements have a default display of `inline` which, for whatever reason,
    can have negative effects on the calendar. This is only an issue if the calendar is attached
    directly to the shadow DOM and not nested within some other element in the shadow DOM.
    If this is your case and you notice weirdness (such as the calendar disappearing immediately after showing),
    try adding an explicit display property to the custom element. This is also mentioned in the
    "best practices" article by Google here - https://bit.ly/33F7TkJ.
  */
  var customElement

  /*
    In the case that the selector is an id beginning with a number (e.x. #123),
    querySelector will fail. That's why we need to check and conditionally use `getElementById`.
    Also, datepicker doesn't support string selectors when using a shadow DOM, hence why we use `document`.
  */
  var el = selectorOrElement
  if (typeof el === 'string') {
    el = el[0] === '#' ? document.getElementById(el.slice(1)) : document.querySelector(el)

  // Maybe this will be supported one day once I understand the use-case.
  } else if (type(el) === '[object ShadowRoot]') {
    throw 'Using a shadow DOM as your selector is not supported.'

  /*
    If the selector is not a string, we may have been given an element within a shadow DOM (or a shadow DOM itself).
    IE doesn't support custom elements at all so that would have to be polyfilled.
    Warn about this for good dev experience and then throw whatever error the browser gives.
  */
  } else {
    try {
      var rootNode = el.getRootNode() // Even if `el` IS the shadow DOM, this will still return the shadow DOM.
      if (type(rootNode) === '[object ShadowRoot]') {
        shadowDom = rootNode
        customElement = rootNode.host
      }
    } catch(e) {
      console.warn('You have to polyfill the web components spec - http://bit.ly/3axUZHC')
      throw e
    }
  }

  if (!el) throw ('No selector / element found.')

  // Check if the provided element already has a datepicker attached.
  if (datepickers.some(function(picker) { return picker.el === el })) throw 'A datepicker already exists on that element.'

  /*
    `noPosition` tells future logic to avoid trying to style the parent element of datepicker.
    Otherwise, it will conditionally add `position: relative` styling to the parent.
    For instance, if datepicker's selector was 'body', there is no parent element to do any
    styling to. And there's nothing to position datepicker relative to. It will just be appended to the body.

    This property also prevents `calculatePosition()` from doing anything.
    `noPosition` will false when using a shadow DOM.
  */
  var noPosition = el === document.body

  /*
    `parent` is the element that datepicker will be attached to in the DOM.

    In the case of `noPosition`, it will be the <body>. If datepicker was passed a top-level element
    in the shadow DOM (meaning the element's direct parent IS the shadow DOM), the parent will be the
    shadow DOM. Otherwise, `parent` is assigned the parent of the element that was passed to datepicker
    in the first place (usually an <input>).
  */
  var parent = shadowDom ? (el.parentElement || shadowDom) : noPosition ? document.body : el.parentElement

  /*
    The calendar needs to be positioned relative `el`. Since we position the calendar absolutely, we need
    something up the chain to have explicit positioning on it. `positionedEl` will conditionally get that
    explicit positioning below via inline styles if it doesn't already have it. That positioning, if applied,
    will be removed (cleaned up) down the line. `calculatePosition` will use the coordinates for `positionedEl`
    and `el` to correctly position the calendar.

    If `noPosition` is true, this value will be ignored further down the chain.
    If `parent` is a shadow DOM, this could be the custom element associated with that shadow DOM.

    If the next element up the chain (el.parentElement) IS the shadow DOM, el.parentElement will be null
    since a shadow DOM isn't an element. Hence why we go even further up the chain and assign customElement.
  */
  var positionedEl = shadowDom ? (el.parentElement || customElement) : parent


  var calendarContainer = document.createElement('div')
  var calendar = document.createElement('div')

  /*
    The calendar scales relative to the font-size of the container.
    The user can provide a class name that sets font-size, or a theme perhaps,
    thereby controlling the overall size and look of the calendar.
  */
  calendarContainer.className = 'qs-datepicker-container qs-hidden'
  calendar.className = 'qs-datepicker'


  var instance = {
    // If a datepicker is used within a shadow DOM, this will be populated with it.
    shadowDom: shadowDom,

    // If a datepicker is used within a shadow DOM, this will be populated with the web component custom element.
    // This is not used internally, but provided as a convenience for users who might want a reference.
    customElement: customElement,



    // Used to help calculate the position of the calendar.
    positionedEl: positionedEl,

    // The calendar will become a sibling to this element in the DOM and be positioned relative to it (except when <body>).
    el: el,

    // The element that datepicker will be child of in the DOM. Used to calculate datepicker's position and might get inline styles.
    parent: parent,

    // Indicates whether the calendar is used with an <input> or not. Affects login in the event listener.
    nonInput: el.nodeName !== 'INPUT',

    // Flag indicating if `el` is 'body'. Used below and by `calculatePosition`.
    noPosition: noPosition,

    // Calendar position relative to `el`.
    position: noPosition ? false : options.position,

    // Date obj used to indicate what month to start the calendar on.
    startDate: options.startDate,

    // Starts the calendar with a date selected.
    dateSelected: options.dateSelected,

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
    calendarContainer: calendarContainer,

    // The element our calendar is constructed in.
    calendar: calendar,

    // Month of `startDate` or `dateSelected` (as a number).
    currentMonth: (options.startDate || options.dateSelected).getMonth(),

    // Month name in plain english - or not.
    currentMonthName: (options.months || months)[(options.startDate || options.dateSelected).getMonth()],

    // Year of `startDate` or `dateSelected`.
    currentYear: (options.startDate || options.dateSelected).getFullYear(),

    // Events will show a small circle on calendar days.
    events: options.events || {},



    // Method to programmatically set the calendar's date.
    setDate: setDate,

    // Method that removes the calendar from the DOM along with associated events.
    remove: remove,

    // Method to programmatically change the minimum selectable date.
    setMin: setMin,

    // Method to programmatically change the maximum selectable date.
    setMax: setMax,

    // Method to programmatically show the calendar.
    show: show,

    // Method to programmatically hide the calendar.
    hide: hide,



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

    // Custom overlay months - only the first 3 characters are used.
    overlayMonths: options.overlayMonths || (options.months || months).map(function(m) { return m.slice(0, 3) }),

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
  if (options.sibling) {
    /* If we're here, we're encountering the 2nd instance in a daterange pair. */
    var first = options.sibling
    var second = instance
    var minDate = first.minDate || second.minDate
    var maxDate = first.maxDate || second.maxDate

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
  if (options.dateSelected) setCalendarInputValue(el, instance)

  // Find out what positioning `positionedEl` has so we can conditionally style it.
  var computedPosition = getComputedStyle(positionedEl).position

  // Only add inline styles if `positionedEl` doesn't have any explicit positioning.
  if (!noPosition && (!computedPosition || computedPosition === 'static')) {
    // Indicate that inline styles have been set.
    instance.inlinePosition = true

    /*
      Add inline position styles.
      I've seen that `element.style.position = '...'` isn't reliable.
      https://mzl.la/2Yi6hNG
    */
    positionedEl.style.setProperty('position', 'relative')
  }

  /*
    Ensure any pickers with a common `positionedEl` will ALL have the `inlinePosition` property.
    This will ensure the styling is removed ONLY when the LAST picker inside it is removed.
    This condition will trigger when subsequent pickers are instantiated inside `postionedEl`.
  */
  if (instance.inlinePosition) {
    datepickers.forEach(function(picker) {
      if (picker.positionedEl === instance.positionedEl) picker.inlinePosition = true
    })
  }

  // Put our instance's calendar in the DOM.
  calendarContainer.appendChild(calendar)
  parent.appendChild(calendarContainer)

  // Conditionally show the calendar from the start.
  if (instance.alwaysShow) showCal(instance)

  return instance
}

/*
 *  Helper function to duplicate an object or array.
 *  Should help Babel avoid adding syntax that isn't IE compatible.
 */
function freshCopy(item) {
  if (Array.isArray(item)) return item.map(freshCopy)

  if (type(item) === '[object Object]') {
    return Object.keys(item).reduce(function(newObj, key) {
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
function sanitizeOptions(opts) {
  // Avoid mutating the original object that was supplied by the user.
  var options = freshCopy(opts)

  /*
    Check and ensure all events in the provided array are JS dates.
    Store these on the instance as an object with JS datetimes as keys for fast lookup.
  */
  if (options.events) {
    options.events = options.events.reduce(function(acc, date) {
      if (!dateCheck(date)) throw '"options.events" must only contain valid JavaScript Date objects.'
      acc[+stripTime(date)] = true
      return acc
    }, {})
  }

  /*
    Check that various options have been provided a JavaScript Date object.
    If so, strip the time from those dates (for accurate future comparisons).
  */
  ;['startDate', 'dateSelected', 'minDate', 'maxDate'].forEach(function(value) {
    var date = options[value]
    if (date && !dateCheck(date)) throw '"options.' + value + '" needs to be a valid JavaScript Date object.'

    /*
      Strip the time from the date.
      For dates not supplied, stripTime will return undefined.
    */
    options[value] = stripTime(date)
  })

  var position = options.position
  var maxDate = options.maxDate
  var minDate = options.minDate
  var dateSelected = options.dateSelected
  var overlayPlaceholder = options.overlayPlaceholder
  var overlayButton = options.overlayButton
  var startDay = options.startDay
  var id = options.id

  options.startDate = stripTime(options.startDate || dateSelected || new Date())


  // Checks around disabled dates.
  options.disabledDates = (options.disabledDates || []).map(function(date) {
    var newDateNum = +stripTime(date)

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
  if (id != null) {
    // Search through pickers already created and see if there's an id match for this one.
    var pickers = datepickers.filter(function(picker) { return picker.id === id })

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
  var positionFound = ['tr', 'tl', 'br', 'bl', 'c'].some(function(dir) { return position === dir })
  if (position && !positionFound) {
    throw '"options.position" must be one of the following: tl, tr, bl, br, or c.'
  }
  options.position = establishPosition(position || 'bl')

  // Check proper relationship between `minDate`, `maxDate`, & `dateSelected`.
  if (maxDate < minDate) throw '"maxDate" in options is less than "minDate".'
  if (dateSelected) {
    function dsErr(min) {
      var lessOrGreater = min ? 'less' : 'greater'
      throw '"dateSelected" in options is ' + lessOrGreater + ' than "' + (min || 'max') + 'Date".'
    }
    if (minDate > dateSelected) dsErr('min')
    if (maxDate < dateSelected) dsErr()
  }

  // Callbacks - default to a noop function.
  ['onSelect', 'onShow', 'onHide', 'onMonthChange', 'formatter', 'disabler'].forEach(function(fxn) {
    if (typeof options[fxn] !== 'function') options[fxn] = noop // `noop` defined at the top.
  })

  // Custom labels for months & days.
  ;['customDays', 'customMonths', 'customOverlayMonths'].forEach(function(label, i) {
    var custom = options[label]
    var num = i ? 12 : 7

    // Do nothing if the user hasn't provided this custom option.
    if (!custom) return

    if (
      !Array.isArray(custom) || // Must be an array.
      custom.length !== num || // Must have the correct length.
      custom.some(function(item) { return typeof item !== 'string' }) // Must be an array of strings only.
    ) throw '"' + label + '" must be an array with ${num} strings.'

    options[!i ? 'days' : i < 2 ? 'months' : 'overlayMonths'] = custom
  })

  /*
    Adjust days of the week for user-provided start day.
    If `startDay` is a bad value, it will simply be ignored.
  */
  if (startDay && startDay > 0 && startDay < 7) {
    // [sun, mon, tues, wed, thurs, fri, sat]             (1) - original supplied days of the week
    var daysCopy = (options.customDays || days).slice()

    // Example with startDay of 3 (Wednesday)
    // daysCopy => [wed, thurs, fri, sat]                 (2) - the 1st half of the new array
    // chunk    => [sun, mon, tues]                       (3) - the 2nd half of the new array
    var chunk = daysCopy.splice(0, startDay)

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
function establishPosition(positions) {
  var p1 = positions[0]
  var p2 = positions[1]
  var obj = {}

  obj[sides[p1]] = 1
  if (p2) obj[sides[p2]] = 1

  return obj
}

/*
 *  Renders a calendar, defaulting to the current year & month of that calendar.
 *  Populates `calendar.innerHTML` with the contents of the calendar controls, month, and overlay.
 *  This method does NOT *show* the calendar on the screen. It only affects the html structure.
 */
function renderCalendar(instance, date) {
  var overlay = instance.calendar.querySelector('.qs-overlay')
  var overlayOpen = overlay && !overlay.classList.contains('qs-hidden')

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
    then wait for the next repaint, triggering a fade out.

    Good for IE >= 10.
  */
  if (overlayOpen) window.requestAnimationFrame(function() { toggleOverlay(true, instance) })
}

/*
 *  Creates the calendar controls.
 *  Returns a string representation of DOM elements.
 */
function createControls(date, instance, overlayOpen) {
  return [
    '<div class="qs-controls' + (overlayOpen ? ' qs-blur' : '') + '">',
    '<div class="qs-arrow qs-left"></div>',
    '<div class="qs-month-year">',
    '<span class="qs-month">' + instance.months[date.getMonth()] + '</span>',
    '<span class="qs-year">' + date.getFullYear() + '</span>',
    '</div>',
    '<div class="qs-arrow qs-right"></div>',
    '</div>'
  ].join('')
}

/*
 *  Creates the calendar month structure.
 *  Returns a string representation of DOM elements.
 */
function createMonth(date, instance, overlayOpen) {
  // Dynamic properties.
  var currentMonth = instance.currentMonth
  var currentYear = instance.currentYear
  var dateSelected = instance.dateSelected
  var maxDate = instance.maxDate
  var minDate = instance.minDate
  var showAllDates = instance.showAllDates

  // Static properties.
  var days = instance.days
  var disabledDates = instance.disabledDates
  var disabler = instance.disabler
  var noWeekends = instance.noWeekends
  var startDay = instance.startDay
  var weekendIndices = instance.weekendIndices
  var events = instance.events

  // If we have a daterange picker, get the current range.
  var range = instance.getRange ? instance.getRange() : {}
  var start = +range.start
  var end = +range.end

  // Same year, same month?
  var today = new Date()
  var isThisMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth()

  // 1st of the month for whatever date we've been provided.
  var copy = stripTime(new Date(date).setDate(1)) // 1st of the month.

  // copy.getDay() - day of the week, 0-indexed.
  // startDay      - day of the week the calendar starts on, 0-indexed.
  var offset = copy.getDay() - startDay // Preceding empty squares.

  // Offsetting the start day may move back to a new 1st row.
  var precedingRow = offset < 0 ? 7 : 0

  // Bump the provided date to the 1st of the next month.
  copy.setMonth(copy.getMonth() + 1)

  // Move the provided date back a single day, resulting in the last day of the provided month.
  copy.setDate(0)

  // Last day of the month = how many quares get a number on the calendar.
  var daysInMonth = copy.getDate() // Squares with a number.

  // This array will contain string representations of HTML for all the calendar squares.
  var calendarSquares = []

  // Fancy calculations for the total # of squares.
  // The pipe operator truncates any decimals.
  var totalSquares = precedingRow + (((offset + daysInMonth) / 7 | 0) * 7)
  totalSquares += (offset + daysInMonth) % 7 ? 7 : 0

  // If the offest happens to be 0 but we did specify a `startDay`,
  // add 7 to prevent a missing row at the end of the calendar.
  if (startDay !== 0 && offset === 0) totalSquares += 7

  for (var i = 1; i <= totalSquares; i++) {
    var weekdayIndex = (i - 1) % 7
    var weekday = days[weekdayIndex]
    var num = i - (offset >= 0 ? offset : (7 + offset))
    var thisDay = new Date(currentYear, currentMonth, num) // No time so we can compare accurately :)
    var eventClass = ' qs-event'
    var hasEvent = events[+thisDay]
    var thisDayNum = thisDay.getDate()
    var outsideOfCurrentMonth = num < 1 || num > daysInMonth
    var otherClass = 'qs-num'
    var span = '<span class="qs-num">' + thisDayNum + '</span>'
    var dateInSelectedRange = start && end && +thisDay >= start && +thisDay <= end

    // Squares outside the current month.
    if (outsideOfCurrentMonth) {
      otherClass = 'qs-empty qs-outside-current-month'

      // Show dim dates for dates in preceding and trailing months.
      if (showAllDates) {
        if (hasEvent) otherClass += eventClass
        otherClass += ' qs-disabled'

      // Show empty squares for dates in preceding and trailing months.
      } else {
        span = ''
      }

    // Disabled, current, & date-range squares.
    } else {
      // Disabled dates.
      if (
        (minDate && thisDay < minDate) ||
        (maxDate && thisDay > maxDate) ||
        disabler(thisDay) ||
        // disabledDates.includes(+thisDay) || // .includes isn't supported in older browsers.
        disabledDates.some(function(num) { return num === +thisDay }) ||
        (noWeekends && weekendIndices.some(function(idx) { return idx === weekdayIndex }))
      ) otherClass = 'qs-disabled'

      // Show events for squares with a number even if they are disabled.
      if (hasEvent) otherClass += eventClass

      // Current date, i.e. today's date.
      if (isThisMonth && num === today.getDate()) otherClass += ' qs-current'

      // Selected day.
      if (+thisDay === +dateSelected) otherClass += ' qs-active'

      // Date-range classes.
      if (dateInSelectedRange) {
        // Indicate what index day of the week this is - from first to last. Affects styles.
        otherClass += ' qs-range-date-' + weekdayIndex

        // Differentiate start & end range days.
        if (start !== end) {
          if (+thisDay === start) {
            otherClass += ' qs-range-date-start qs-active'
          } else if (+thisDay === end) {
            otherClass += ' qs-range-date-end qs-active'
          } else {
            otherClass += ' qs-range-date-middle'
          }
        }
      }
    }

    calendarSquares.push('<div class="qs-square ' + otherClass + ' ' + weekday + '">' + span + '</div>')
  }

  // Add the header row of days of the week.
  var daysAndSquares = days
    .map(function(day) { return '<div class="qs-square qs-day">' + day + '</div>' })
    .concat(calendarSquares)

  // Throw error...
  // The # of squares on the calendar should ALWAYS be a multiple of 7.
  if (daysAndSquares.length % 7 !== 0 ) {
    throw 'Calendar not constructed properly. The # of squares should be a multiple of 7.'
  }

  // Wrap it all in a tidy div.
  daysAndSquares.unshift('<div class="qs-squares' + (overlayOpen ? ' qs-blur' : '') + '">')
  daysAndSquares.push('</div>')
  return daysAndSquares.join('')
}

/*
 *  Creates the overlay for users to
 *  manually navigate to a month & year.
 */
function createOverlay(instance, overlayOpen) {
  var overlayPlaceholder = instance.overlayPlaceholder
  var overlayButton = instance.overlayButton
  var overlayMonths = instance.overlayMonths
  var shortMonths = overlayMonths.map(function(m, i) {
    return [
      '<div class="qs-overlay-month" data-month-num="' + i + '">',
      '<span data-month-num="' + i + '">' + m + '</span>',
      '</div>'
    ].join('')
  }).join('')

  return [
    '<div class="qs-overlay' + (overlayOpen ? '' : ' qs-hidden') + '">',
    '<div>',
    '<input class="qs-overlay-year" placeholder="' + overlayPlaceholder + '" />',
    '<div class="qs-close">&#10005;</div>',
    '</div>',
    '<div class="qs-overlay-month-container">' + shortMonths + '</div>',
    '<div class="qs-submit qs-disabled">' + overlayButton + '</div>',
    '</div>'
  ].join('')
}

/*
 *  Highlights the selected date - or deselects it.
 *  Calls `setCalendarInputValue`.
 */
function selectDay(target, instance, deselect) {
  var el = instance.el
  var active = instance.calendar.querySelector('.qs-active')
  var num = target.textContent
  var sibling = instance.sibling

  // Prevent Datepicker from selecting (or deselecting) dates.
  if ((el.disabled || el.readOnly) && instance.respectDisabledReadOnly) return

  // Keep track of the currently selected date.
  instance.dateSelected = deselect ? undefined : new Date(instance.currentYear, instance.currentMonth, num)

  // Re-establish the active (highlighted) date.
  if (active) active.classList.remove('qs-active')
  if (!deselect) target.classList.add('qs-active')

  /*
    Populate the <input> field (or not) with a readable value
    and store the individual date values as attributes.
  */
  setCalendarInputValue(el, instance, deselect)

  /*
    Hide the calendar after a day has been selected.
    Keep it showing if deselecting.
  */
  if (!deselect) hideCal(instance)

  if (sibling) {
    // Update minDate & maxDate of both calendars.
    adjustDateranges({ instance: instance, deselect: deselect })

    /*
      http://bit.ly/2VdRx0r
      Daterange - if we're selecting a date on the "start" calendar,
      navigate the "end" calendar to the same month & year only if
      no date has already been selected on the "end" calendar.
      We don't do the opposite - the start calendar is never auto-navigated.
    */
    if (instance.first && !sibling.dateSelected) {
      sibling.currentYear = instance.currentYear
      sibling.currentMonth = instance.currentMonth
      sibling.currentMonthName = instance.currentMonthName
    }

    // Re-render both calendars.
    renderCalendar(instance)
    renderCalendar(sibling)
  }


  // Call the user-provided `onSelect` callback.
  // Passing in new date so there's no chance of mutating the original object.
  // In the case of a daterange, min & max dates are automatically set.
  instance.onSelect(instance, deselect ? undefined : new Date(instance.dateSelected))
}

/*
  When selecting / deselecting a date, this resets `minDate` or `maxDate` on
  both pairs of a daterange based upon `originalMinDate` or `originalMaxDate`.
*/
function adjustDateranges(args) {
  var first = args.instance.first ? args.instance : args.instance.sibling
  var second = first.sibling

  if (first === args.instance) {
    if (args.deselect) {
      first.minDate = first.originalMinDate
      second.minDate = second.originalMinDate
    } else {
      second.minDate = first.dateSelected
    }
  } else {
    if (args.deselect) {
      second.maxDate = second.originalMaxDate
      first.maxDate = first.originalMaxDate
    } else {
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
    if (year) instance.currentYear = +year
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
 *  Positions datepicker relative to `instance.el` using `instance.positionedEl` to
 *  derive calculations.
 */
function calculatePosition(instance) {
  // Don't try to position the calendar if its el is <body> or <html>.
  if (instance.noPosition) return

  var top = instance.position.top
  var right = instance.position.right
  var centered = instance.position.centered

  /*
    This positions the calendar `fixed` in the middle of the screen,
    so we don't need to do any calculations. We just add the class to trigger styles.
  */
  if (centered) return instance.calendarContainer.classList.add('qs-centered')

  // Get the measurements.
  var positionedElRects = instance.positionedEl.getBoundingClientRect()
  var elRects = instance.el.getBoundingClientRect()
  var containerRects = instance.calendarContainer.getBoundingClientRect()

  // Calculate the position!
  var topStyle = elRects.top - positionedElRects.top + (top ? (containerRects.height * -1) : elRects.height) + 'px'
  var leftStyle = elRects.left - positionedElRects.left + (right ? (elRects.width - containerRects.width) : 0) + 'px'

  // Set the styles.
  instance.calendarContainer.style.setProperty('top', topStyle)
  instance.calendarContainer.style.setProperty('left', leftStyle)
}

/*
 *  Checks for a valid date object.
 */
function dateCheck(date) {
  return (
    type(date) === '[object Date]' &&
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

  var date = new Date(+dateOrNum)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/*
 *  Hides the calendar and calls the `onHide` callback.
 */
function hideCal(instance) {
  if (instance.disabled) return

  // Only trigger `onHide` for instances that are currently showing.
  var isShowing = !instance.calendarContainer.classList.contains('qs-hidden')

  if (isShowing && !instance.alwaysShow) {
    toggleOverlay(true, instance)
    instance.calendarContainer.classList.add('qs-hidden')
    instance.onHide(instance)
  }
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

  var calendar = instance.calendar
  var overlay = calendar.querySelector('.qs-overlay')
  var yearInput = overlay.querySelector('.qs-overlay-year')
  var controls = calendar.querySelector('.qs-controls')
  var squaresContainer = calendar.querySelector('.qs-squares')

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

  var badDate = isNaN(+new Date().setFullYear(input.value || undefined))
  var value = badDate ? null : input.value

  // Enter has been pressed OR submit was clicked.
  if ((e.which || e.keyCode) === 13 || e.type === 'click') {
    if (overlayMonthIndex) {
      changeMonthYear(null, instance, value, overlayMonthIndex)
    } else if (!badDate && !input.classList.contains('qs-disabled')) {
      changeMonthYear(null, instance, value, overlayMonthIndex)
    }

  // Enable / disabled the submit button.
  } else if (instance.calendar.contains(input)) { // Scope to one calendar instance.
    var submit = instance.calendar.querySelector('.qs-submit')
    submit.classList[badDate ? 'add' : 'remove']('qs-disabled')
  }
}

/*
 *  Returns the explicit type of something as a string.
 */
function type(thing) {
  return ({}).toString.call(thing)
}

/*
 *  Hides all instances aside from the one passed in.
 */
function hideOtherPickers(instance) {
  datepickers.forEach(function(picker) { if (picker !== instance) hideCal(picker) })
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
  /*
    Prevent double-firing when events bubble from a shadow DOM.
    This works even if we have shadow DOMs within shadow DOMs within...
  */
  if (e.__qs_shadow_dom) return

  var type = e.type
  var target = e.target
  var classList = target.classList
  var instance = datepickers.filter(function(picker) {
    return picker.calendar.contains(target) || picker.el === target
  })[0]
  var onCal = instance && instance.calendar.contains(target)


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

    var calendar = instance.calendar
    var calendarContainer = instance.calendarContainer
    var disableYearOverlay = instance.disableYearOverlay
    var nonInput = instance.nonInput
    var input = calendar.querySelector('.qs-overlay-year')
    var overlayClosed = !!calendar.querySelector('.qs-hidden')
    var monthYearClicked = calendar.querySelector('.qs-month-year').contains(target)
    var newMonthIndex = target.dataset.monthNum

    // Calendar's el is 'body'.
    // Anything but the calendar was clicked.
    if (instance.noPosition && !onCal) {
      // Show / hide a calendar whose el is html or body.
      var calendarClosed = calendarContainer.classList.contains('qs-hidden')
      ;(calendarClosed ? showCal : hideCal)(instance)

    // Clicking the arrow buttons - change the calendar month.
    } else if (classList.contains('qs-arrow')) {
      changeMonthYear(classList, instance)

    // Clicking the month/year - open the overlay.
    // Clicking the X on the overlay - close the overlay.
    } else if (monthYearClicked || classList.contains('qs-close')) {
      if (!disableYearOverlay) toggleOverlay(!overlayClosed, instance)

    // Clicking a month in the overlay - the <span> inside might have been clicked.
    } else if (newMonthIndex) {
      overlayYearEntry(e, input, instance, newMonthIndex)

    // Clicking a number square - process whether to select that day or not.
    } else if (classList.contains('qs-num')) {
      var targ = target.nodeName === 'SPAN' ? target.parentNode : target
      var num = target.textContent
      var dateInQuestion = new Date(instance.currentYear, instance.currentMonth, num)

      if (+dateInQuestion === +instance.dateSelected) {
        selectDay(targ, instance, true)
      } else if (!targ.classList.contains('qs-disabled')) {
        selectDay(targ, instance)
      }

      return

    // Clicking the submit button in the overlay.
    } else if (classList.contains('qs-submit') && !classList.contains('qs-disabled')) {
      overlayYearEntry(e, input, instance)
    // Clicking the calendar's el for non-input's should show it.
    } else if (nonInput && target === instance.el) {
      showCal(instance)
      hideOtherPickers(instance)
    }

  /*
    Only pay attention to `focusin` events if the calendar's el is an <input>.
    We use the `focusin` event because it bubbles - `focus` does not bubble.
  */
  } else if (type === 'focusin' && instance) {
    // Show this intance.
    showCal(instance)

    // Hide all other instances.
    hideOtherPickers(instance)
  } else if (type === 'keydown' && instance && !instance.disabled) {
    var overlay = instance.calendar.querySelector('.qs-overlay')
    var overlayShowing = !overlay.classList.contains('qs-hidden')

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
    var submitButton = instance.calendar.querySelector('.qs-submit')
    var newValue = target.value
      .split('')
      // Prevent leading 0's.
      .reduce(function(acc, char) {
        if (!acc && char === '0') return ''
        return acc + (char.match(/[0-9]/) ? char : '')
      }, '')
      .slice(0, 4)

    // Set the new value of the input and conditionally enable / disable the submit button.
    target.value = newValue
    submitButton.classList[newValue.length === 4 ? 'remove' : 'add']('qs-disabled')
  }
}

/*
 *
 *  In the case of a calendar being placed in a shadow DOM (web components), we need
 *  to keep the `oneHandler` listener on the document while having another listener
 *  on the shadow DOM. We set a property on the event object to indicate the event
 *  originated from a shadow DOM. This will ensure that once the event bubbles up to
 * `oneHandler` on the document, we know to ignore it.
 */
function shadowDomHandler(e) {
  oneHandler(e)
  e.__qs_shadow_dom = true
}

/*
 *  Removes the event listeners on either the document or the shadow DOM.
 */
function removeEvents(node, listener) {
  events.forEach(function(event) { node.removeEventListener(event, listener) })
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
  var date = stripTime(newDate) // Remove the time, creating a fresh date object.
  var currentYear = this.currentYear
  var currentMonth = this.currentMonth
  var sibling = this.sibling

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
    this.disabledDates.some(function(d) { return +d === +date }) ||
    date < this.minDate ||
    date > this.maxDate
  ) throw "You can't manually set a date that's disabled."

  // Keep track of the new date.
  this.dateSelected = date

  /*
    These properties indicate to the instance where the calendar is currently at.
    Only change them if we're also navigating to the new date in the UI.
  */
  if (changeCalendar) {
    this.currentYear = date.getFullYear()
    this.currentMonth = date.getMonth()
    this.currentMonthName = this.months[date.getMonth()]
  }

  setCalendarInputValue(this.el, this)

  if (sibling) {
    // Adjust other date properties and re-render the sibling to show the same month as the other.
    adjustDateranges({ instance: this })

    // Re-render the sibling to reflect possible disabled dates due to a selection.
    renderCalendar(sibling)
  }

  var isSameMonth = currentYear === date.getFullYear() && currentMonth === date.getMonth()
  if (isSameMonth || changeCalendar) renderCalendar(this, date)

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
  var dateSelected = instance.dateSelected
  var first = instance.first
  var sibling = instance.sibling
  var minDate = instance.minDate
  var maxDate = instance.maxDate
  var newDate = stripTime(date)
  var type = isMin ? 'Min' : 'Max'

  function origProp() { return 'original' + type + 'Date' }
  function prop() { return type.toLowerCase() + 'Date' }
  function method() { return 'set' + type }
  function throwOutOfRangeError() { throw 'Out-of-range date passed to ' + method() }

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
    throw 'Invalid date passed to ' + method()

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

  if (sibling) renderCalendar(sibling)
  renderCalendar(instance)

  return instance
}

/**
 *
 *  Returns an object with start & end date selections.
 *  Available onCal daterange pairs only.
 */
function getRange() {
  var first = this.first ? this : this.sibling
  var second = first.sibling

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
  var shadowDom = this.shadowDom
  var positionedEl = this.positionedEl
  var calendarContainer = this.calendarContainer
  var sibling = this.sibling
  var _this = this

  /*
    Remove styling done to `positionedEl` and reset it back to its original
    only if there are no other instances with the same `positionedEl`.
  */
  if (this.inlinePosition) {
    var positionedElStillInUse = datepickers.some(function(picker) { return picker !== _this && picker.positionedEl === positionedEl })
    if (!positionedElStillInUse) positionedEl.style.setProperty('position', null)
  }

  // Remove the calendar from the DOM.
  calendarContainer.remove()

  // Remove this instance from the list.
  datepickers = datepickers.filter(function(picker) { return picker !== _this })

  // Remove siblings references.
  if (sibling) delete sibling.sibling

  // If this was the last datepicker in the list, remove the event handlers.
  if (!datepickers.length) removeEvents(document, oneHandler)

  // Remove the shadow DOM listener if this was the last picker in that shadow DOM.
  var shadowDomStillInUse = datepickers.some(function(picker) { return picker.shadowDom === shadowDom })
  if (shadowDom && !shadowDomStillInUse) removeEvents(shadowDom, shadowDomHandler)

  // Empty this instance of all properties.
  for (var prop in this) delete this[prop]

  // If this was the last datepicker in the list, remove the event handlers.
  if (!datepickers.length) {
    events.forEach(function(event) { document.removeEventListener(event, oneHandler) })
  }
}


module.exports = datepicker
