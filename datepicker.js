(function(root, returnDatepicker) {
  if (typeof exports === 'object') return module.exports = returnDatepicker();
  if (typeof define === 'function' && define.amd) return define(function() {return returnDatepicker()});
  return root.datepicker = returnDatepicker();
})(this, function() {
  'use strict';

  const datepickers = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
  ];
  const sides = {
    t: 'top',
    r: 'right',
    b: 'bottom',
    l: 'left'
  };

  /*
   *
   */
  function Datepicker(selector, options) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    const parent = el.parentElement;

    options = sanitizeOptions(options || defaults(), el, selector);

    const calendar = document.createElement('div');
    const {startDate, dateSelected} = options;
    const noPosition = el === document.body || el === document.querySelector('html');
    const instance = {
      // The calendar will be positioned relative to this element (except when 'body' or 'html').
      el: el,

      // The element that datepicker will be attached to.
      parent: parent,

      // Indicates whether to use a <input> element or not as the calendars anchor.
      nonInput: el.nodeName !== 'INPUT',

      // Flag indicating if `el` is 'body' or 'html' for `calculatePosition`.
      noPosition: noPosition,

      // Calendar position relative to `el`.
      position: noPosition ? false : options.position,

      // Date obj used to indicate what month to start the calendar on.
      startDate: startDate,

      // Starts the calendar with a date selected.
      dateSelected: dateSelected,

      // Low end of selectable dates.
      minDate: options.minDate,

      // High end of selectable dates.
      maxDate: options.maxDate,

      // Disabled the ability to select days on the weekend.
      noWeekends: !!options.noWeekends,

      // The element our calendar is constructed in.
      calendar: calendar,

      // Month of `startDate` or `dateSelected` (as a number).
      currentMonth: (startDate || dateSelected).getMonth(),

      // Month name in plain english.
      currentMonthName: (options.months || months)[(startDate || dateSelected).getMonth()],

      // Year of `startDate` or `dateSelected`.
      currentYear: (startDate || dateSelected).getFullYear(),

      // Method to programatically set the calendar's date.
      setDate: setDate,

      // Method that removes the calendar from the DOM along with associated events.
      remove: remove,

      // Callback fired when a date is selected - triggered in `selectDay`.
      onSelect: options.onSelect,

      // Callback fired when the calendar is shown - triggered in `classChangeObserver`.
      onShow: options.onShow,

      // Callback fired when the calendar is hidden - triggered in `classChangeObserver`.
      onHide: options.onHide,

      // Callback fired when the month is changed - triggered in `changeMonth`.
      onMonthChange: options.onMonthChange,

      // Function to customize the date format updated on <input> elements - triggered in `setElValues`.
      formatter: options.formatter,

      // Custom labels for months.
      months: options.months,

      // Custom labels for days.
      days: options.days,

      // Disable the datepicker on mobile devices.
      // Allows the use of native datepicker if the input type is 'date'.
      disableMobile: options.disableMobile,

      // Used in conjuntion with `disableMobile` above within `oneHandler`.
      isMobile: 'ontouchstart' in window
    };

    // Initially populate the <input> field / set attributes on the `el`.
    if (dateSelected) setElValues(el, instance);

    calendar.classList.add('datepicker');
    calendar.classList.add('hidden');
    datepickers.push(el);
    calendarHtml(startDate || dateSelected, instance);

    classChangeObserver(calendar, instance);
    window.addEventListener('click', oneHandler.bind(instance));
    window.addEventListener('focusin', oneHandler.bind(instance));
    window.addEventListener('keyup', oneHandler.bind(instance));

    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    parent.appendChild(calendar);

    return instance;
  }

  /*
   *  Will run checks on the provided options object to ensure correct types.
   *  Returns an options object if everything checks out.
   */
  function sanitizeOptions(options, el) {
    // An invalid selector or non-DOM node has been provided.
    if (!el) throw new Error('An invalid selector or non-DOM node has been provided.');

    // Check if the provided element already has a datepicker attached.
    if (datepickers.includes(el)) throw new Error('A datepicker already exists on that element.');

    let {position, maxDate, minDate, dateSelected, formatter, customMonths, customDays} = options;


    // Ensure the accuracy of `options.position` & call `establishPosition`.
    if (position) {
      const found = ['tr', 'tl', 'br', 'bl'].some(dir => position === dir);
      const msg = '"options.position" needs to be one of the following: tl, tr, bl, or br.';

      if (!found) throw new Error(msg);
      options.position = establishPosition(position);
    } else {
      options.position = establishPosition('bl');
    }

    // Check that various options have been provided a JavaScript Date object.
    // If so, strip the time from those dates (for accurate future comparisons).
    ['startDate', 'dateSelected', 'minDate', 'maxDate'].forEach(date => {
      if (options[date]) {
        if (!dateCheck(options[date]) || isNaN(+options[date])) {
          throw new TypeError(`"options.${date}" needs to be a valid JavaScript Date object.`);
        }

        // Strip the time from the date.
        options[date] = stripTime(options[date]);
      }
    });

    options.startDate = options.startDate || options.dateSelected || stripTime(new Date());
    options.formatter = typeof formatter === 'function' ? formatter : null;

    if (maxDate < minDate) {
      throw new Error('"maxDate" in options is less than "minDate".');
    }

    if (dateSelected) {
      if (minDate > dateSelected) {
        throw new Error('"dateSelected" in options is less than "minDate".');
      }

      if (maxDate < dateSelected) {
        throw new Error('"dateSelected" in options is greater than "maxDate".');
      }
    }

    // Callbacks.
    ['onSelect', 'onShow', 'onHide', 'onMonthChange'].forEach(fxn => {
      options[fxn] = typeof options[fxn] === 'function' && options[fxn];
    });


    // Custom labels for months & days.
    [customMonths, customDays].forEach((custom, i) => {
      if (custom === undefined) return;

      const errorMsgs = [
        '"customMonths" must be an array with 12 strings.',
        '"customDays" must be an array with 7 strings.'
      ];
      const wrong = [
        ({}).toString.call(custom) !== '[object Array]',
        custom.length !== (i ? 7 : 12),
        custom.some(item => typeof item !== 'string')
      ].some(thing => thing);

      if (wrong) throw new Error(errorMsgs[i]);

      options[i ? 'days' : 'months'] = custom;
    });

    return options;
  }

  /*
   *  Returns an object containing all the default settings.
   */
  function defaults() {
    return {
      startDate: stripTime(new Date()),
      position: 'bl'
    };
  }

  /*
   *  Returns an object representing the position of the calendar
   *  relative to the calendars <input> element.
   */
  function establishPosition(position) {
    const obj = {};

    obj[sides[position[0]]] = 1;
    obj[sides[position[1]]] = 1;

    return obj;
  }

  /*
   *  Populates `calendar.innerHTML` with the contents
   *  of the calendar controls, month, and overlay.
   */
  function calendarHtml(date, instance) {
    const controls = createControls(date, instance);
    const month = createMonth(date, instance);
    instance.calendar.innerHTML = controls + month;
  }

  /*
   *  Creates the calendar controls.
   *  Returns a string representation of DOM elements.
   */
  function createControls(date, instance) {
    return [
      '<div class="controls">',
      '<div class="arrow left"></div>',
      '<div class="month-year">',
      `<span class="month">${(instance.months || months)[date.getMonth()]}</span>`,
      `<span class="year">${date.getFullYear()}</span>`,
      '</div>',
      '<div class="arrow right"></div>',
      '</div>'
    ].join('');
  }

  /*
   *  Creates the calendar month structure.
   *  Returns a string representation of DOM elements.
   */
  function createMonth(date, instance) {
    const {minDate, maxDate, dateSelected, currentYear, currentMonth, noWeekends} = instance;

    // Same year, same month?
    const today = new Date();
    const isThisMonth = today.toJSON().slice(0, 7) === date.toJSON().slice(0, 7);

    // Calculations for the squares on the calendar.
    const copy = new Date(new Date(date).setDate(1));
    const offset = copy.getDay(); // Preceding empty squares.
    copy.setMonth(copy.getMonth() + 1);
    copy.setDate(0); // Last day in the current month.
    const daysInMonth = copy.getDate(); // Squares with a number.

    // Will contain string representations of HTML for the squares.
    const calendarSquares = [];

    // Fancy calculations for the total # of squares.
    let totalSquares = ((offset + daysInMonth) / 7 | 0) * 7;
    totalSquares += (offset + daysInMonth) % 7 ? 7 : 0;

    for (let i = 1; i <= totalSquares; i++) {
      let weekday = (instance.days || days)[(i - 1) % 7];
      let num = i - offset;
      let otherClass = '';
      let span = `<span class="num">${num}</span>`;
      let thisDay = new Date(currentYear, currentMonth, num);
      let isEmpty = num < 1 || num > daysInMonth;

      // Empty squares.
      if (isEmpty) {
        otherClass = 'empty';
        span = '';

      // Disabled & current squares.
      } else {
        let disabled = (minDate && thisDay < minDate) || (maxDate && thisDay > maxDate);
        const weekend = weekday === 'Sat' || weekday === 'Sun';
        const currentValidDay = isThisMonth && !disabled && num === today.getDate();

        disabled = disabled || (noWeekends && weekend);
        otherClass = disabled ? 'disabled' : currentValidDay ? 'current' : '';
      }

      // Currently selected day.
      if (+thisDay === +dateSelected && !isEmpty) otherClass += ' active';

      calendarSquares.push(`<div class="square num ${weekday} ${otherClass}">${span}</div>`);
    }

    // Add the header row of days of the week.
    const daysAndSquares = (instance.days || days).map(day => {
      return `<div class="square day">${day}</div>`;
    }).concat(calendarSquares);

    // Throw error...
    // The # of squares on the calendar should ALWAYS be a multiple of 7.
    if (daysAndSquares.length % 7 !== 0 ) {
      const msg = 'Calendar not constructed properly. The # of squares should be a multiple of 7.';
      throw new Error(msg);
    }

    // Wrap it all in a tidy div.
    daysAndSquares.unshift('<div class="squares">');
    daysAndSquares.push('</div>');
    return daysAndSquares.join('');
  }

  /*
   *  Highlights the selected date.
   *  Calls `setElValues`.
   */
  function selectDay(target, instance) {
    const { currentMonth, currentYear, calendar, el, onSelect } = instance;
    const active = calendar.querySelector('.active');
    const num = target.textContent;

    // Keep track of the currently selected date.
    instance.dateSelected = new Date(currentYear, currentMonth, num);

    // Re-establish the active (highlighted) date.
    if (active) active.classList.remove('active');
    target.classList.add('active');

    // Populate the <input> field (or not) with a readble value
    // and store the individual date values as attributes.
    setElValues(el, instance);

    // Hide the calendar after a day has been selected.
    calendar.classList.add('hidden');

    if (onSelect) instance.onSelect(instance);
  }

  /*
   *  Populates the <input> fields with a readble value
   *  and stores the individual date values as attributes.
   */
  function setElValues(el, instance) {
    if (instance.nonInput) return;
    if (instance.formatter) return instance.formatter(el, instance.dateSelected);
    el.value = instance.dateSelected.toDateString();
  }

  /*
   *  Updates `this.currentMonth` & `this.currentYear` based on right or left arrows.
   *  Creates a `newDate` based on the updated month & year.
   *  Calls `calendarHtml` with the updated date.
   */
  function changeMonth(classList, instance) {
    instance.currentMonth += classList.contains('right') ? 1 : -1;

    if (instance.currentMonth === 12) {
      instance.currentMonth = 0;
      instance.currentYear++
    } else if (instance.currentMonth === -1) {
      instance.currentMonth = 11;
      instance.currentYear--;
    }

    const newDate = new Date(instance.currentYear, instance.currentMonth, 1);
    calendarHtml(newDate, instance);
    instance.currentMonthName = (instance.months || months)[instance.currentMonth];
    instance.onMonthChange && instance.onMonthChange(instance);
  }

  /*
   *  Sets the `style` attribute on the calendar after doing calculations.
   */
  function calculatePosition(instance) {
    // Don't position the calendar in reference to the <body> or <html> elements.
    if (instance.noPosition) return;

    const {el, calendar, position, parent} = instance;
    const {top, right} = position;

    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const calRect = calendar.getBoundingClientRect();
    const offset = elRect.top - parentRect.top + parent.scrollTop;

    const style = `
      top:${offset - (top ? calRect.height : (elRect.height * -1))}px;
      left:${elRect.left - parentRect.left + (right ? elRect.width - calRect.width : 0)}px;
    `;

    calendar.setAttribute('style', style);
  }

  /*
   *  Method that programatically sets the date.
   */
  function setDate(date) {
    if (!dateCheck(date)) throw new TypeError('`setDate` needs a JavaScript Date object.');
    date = stripTime(date); // Remove the time.
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.currentMonthName = (instance.months || months)[date.getMonth()];
    this.dateSelected = date;
    setElValues(this.el, this);
    calendarHtml(date, this);
  }

  function dateCheck(date) {
    return ({}).toString.call(date) === '[object Date]';
  }

  /*
   *  Takes a date and returns a date stripped of its time (hh:mm:ss:ms).
   */
  function stripTime(date) {
    return new Date(date.toDateString());
  }

  /*
   *  Removes all event listeners added by the constructor.
   *  Removes the current instance from the array of instances.
   */
  function remove() {
    window.removeEventListener('click', oneHandler);
    window.removeEventListener('focusin', oneHandler);
    window.removeEventListener('keyup', oneHandler);
    this.calendar.remove();
    this.observer.disconnect(); // Stop the mutationObserver. https://goo.gl/PgFCEr

    // Remove styling done to the parent element.
    if (this.calendar.hasOwnProperty('parentStyle')) this.parent.style.position = '';

    // Remove this datepicker's `el` from the list.
    const index = datepickers.indexOf(this.el);
    if (index > -1) datepickers.splice(index, 1);
  }


  /////////////////////
  // EVENT FUNCTIONS //
  /////////////////////

  /*
   *  Mutation observer
   *  1. Will trigger the user-provided `onShow` callback when the calendar is shown.
   *  2. Will call `calculatePosition` when calendar is shown.
   */
  function classChangeObserver(calendar, instance) {
    instance.observer = new MutationObserver((mutations, thing) => {
      // Calendar has been shown.
      if (mutations[0].oldValue.includes('hidden')) {
        calculatePosition(instance);
        instance.onShow && instance.onShow(instance);

      // Calendar has been hidden.
      } else {
        instance.onHide && instance.onHide(instance);
      }
    });

    instance.observer.observe(calendar, {
      attributes: 1,
      attributeFilter: ['class'],
      attributeOldValue: 1
    });
  }

  /*
   *  Handles `click` events when the calendar's `el` is an <input>.
   *  Handles `focusin` events for all other types of `el`'s.
   *  Handles `keyup` events when tabbing.
   */
  function oneHandler(e) {
    // Add `e.path` if it doesn't exist.
    if (!e.path) {
      let node = e.target;
      e.path = [];

      while (node !== document) {
        e.path.push(node);
        node = node.parentNode;
      }
    }

    if (this.isMobile && this.disableMobile) return;

    const calClasses = this.calendar.classList;
    const hidden = calClasses.contains('hidden');

    // Only pay attention to `keyup` events if the character is the TAB key.
    if (e.type === 'keyup' && e.keyCode !== 9) return;

    // Only pay attention to `focusin` events if the calendar's el is an <input>.
    // `focusin` bubbles, `focus` does not.
    if (e.type === 'focusin') return e.target === this.el && calClasses.remove('hidden');

    // Calendar's el is 'html' or 'body'.
    // Anything but the calendar was clicked.
    if (this.noPosition) {
      e.path.includes(this.calendar) ? calendarClicked(e, this) : calClasses.toggle('hidden');

    // When the calendar is hidden...
    } else if (hidden) {
      e.target === this.el && calClasses.remove('hidden');

    // Clicked on the calendar.
    } else if (e.path.includes(this.calendar)) {
      calendarClicked(e, this);
    } else {
      e.target !== this.el && calClasses.add('hidden');
    }

    function calendarClicked(e, instance) {
      const classList = e.target.classList;

      // A number was clicked.
      if (classList.contains('num')) {
        const target = e.target.nodeName === 'SPAN' ? e.target.parentNode : e.target;
        const doNothing = ['disabled', 'active', 'empty'].some(name => {
          return target.classList.contains(name);
        });

        !doNothing && selectDay(target, instance);

      // Month arrows were clicked.
      } else if (classList.contains('arrow')) {
        changeMonth(classList, instance);

      // Month or year was clicked.
      } else if (classList.contains('month-year')) {
        monthYearOverlay(e.target, instance);
      }
    }

    function monthYearOverlay(target, instance) {
      const { calendar } = instance;
      const overlay = document.createElement('div');
      const dropMonths = (instance.months || months).map(month => {
        return `<option value="${month}">${month}</option>`
      }).join('');
      const html = `
        <div class="overlay">
          <div class="overlay-close"></div>
          <div>Choose month:</div>
          <select class="month-dropdown">${dropMonths}</select>
          <div>Enter year:</div>
          <input type="text" class="enter-year" />
        </div>
      `;

      overlay.classList.add('overlay');
      overlay.innerHTML = html;
      calendar.appendChild(overlay);
    }
  }

  return Datepicker;
});
