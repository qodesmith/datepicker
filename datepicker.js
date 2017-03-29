(function(root, returnDatepicker) {
  if (typeof exports === 'object') return module.exports = returnDatepicker();
  if (typeof define === 'function' && define.amd) return define(function() {return returnDatepicker()});
  return root.datepicker = returnDatepicker();
})(this, function() {
  'use strict';

  const months = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  };
  const days = {
    1: 'Sun',
    2: 'Mon',
    3: 'Tue',
    4: 'Wed',
    5: 'Thu',
    6: 'Fri',
    0: 'Sat'
  };
  const sides = {
    t: 'top',
    r: 'right',
    b: 'bottom',
    l: 'left'
  };
  const datepickers = [];

  /*
   *
   */
  function Datepicker(selector, options) {
    const el = document.querySelector(selector);
    const parent = el.parentElement;

    options = sanitizeOptions(options || defaults(), el, selector);

    const calendar = document.createElement('div');
    const startDate = options.startDate || new Date(new Date().toLocaleDateString());
    const dateSelected = options.dateSelected;
    const noPosition = selector === 'body' || selector === 'html';
    const instance = {
      // The calendar will be positioned relative to this element (except when 'body' or 'html').
      el: el,

      parent: parent,

      // Indicates whether to use a <input> element or not as the calendars anchor  .
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

      // Month of `startDate` or `dateSelected`.
      currentMonth: (startDate || dateSelected).getMonth(),

      // Month name in plain english.
      currentMonthName: months[(startDate || dateSelected).getMonth()],

      // Year of `startDate` or `dateSelected`.
      currentYear: (startDate || dateSelected).getFullYear(),

      // Method to programatically set the calendar's date.
      setDate: setDate,

      // Method that removes the calendar from the DOM along with associated events.
      remove: remove,

      // Callback fired when a date is selected.
      onSelect: options.onSelect,

      // Callback fired when the calendar is shown.
      onShow: options.onShow,

      // Callback fired when the calendar is hidden.
      onHide: options.onHide,

      // Callback fired when the month is changed.
      onMonthChange: options.onMonthChange
    };

    // Populate the <input> field or set attributes on the `el`.
    if (dateSelected) setElValues(el, instance);

    calendar.classList.add('datepicker');
    calendar.classList.add('hidden');
    datepickers.push(el);
    calendarHtml(startDate || dateSelected, instance);

    classChangeObserver(calendar, instance);
    window.addEventListener('click', oneHandler.bind(instance));
    window.addEventListener('focusin', oneHandler.bind(instance));

    if (getComputedStyle(parent).position === 'static') {
      instance.parent = parent;
      parent.style.position = 'relative';
    }

    parent.appendChild(calendar);

    return instance;
  }

  /*
   *  Will run checks on the provided options object to ensure correct types.
   *  Returns an options object if everything checks out.
   */
  function sanitizeOptions(options, el, selector) {
    // An invalid selected has been provided.
    if (!el) throw new Error(`"${selector}" doesn't reference any element on the page.`);

    // Check if the provided element already has a datepicker attached.
    if (datepickers.includes(el)) throw new Error('A datepicker already exists on that element.');

    let {position, maxDate, minDate, dateSelected} = options;

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
        options[date] = new Date(options[date].toLocaleDateString());
      }
    });

    options.startDate = options.startDate || options.dateSelected;

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

    return options;
  }

  /*
   *  Returns an object containing all the default settings.
   */
  function defaults() {
    return {
      startDate: new Date(new Date().toLocaleDateString()),
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
   *  of the calendar controls and month.
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
  function createControls(date) {
    return [
      '<div class="controls">',
      '<div class="arrow left"></div>',
      '<div class="month-year">',
      `<span class="month">${months[date.getMonth()]}</span>`,
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
    const {
      minDate,
      maxDate,
      dateSelected,
      currentYear,
      currentMonth,
      noWeekends
    } = instance;

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
      let weekday = days[i % 7];
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
    const daysAndSquares = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
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
    const { currentMonth, currentYear, calendar, el } = instance;
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
    instance.calendar.classList.add('hidden');

    if (instance.onSelect) instance.onSelect(instance);
  }

  /*
   *  Populates the <input> fields with a readble value
   *  and stores the individual date values as attributes.
   */
  function setElValues(el, instance) {
    if (instance.nonInput) return;
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
    instance.currentMonthName = months[instance.currentMonth];
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
    date = new Date(date.toLocaleDateString()); // Remove the time.
    this.currentYear = date.getFullYear();
    this.currentMonth = date.getMonth();
    this.currentMonthName = months[date.getMonth()];
    this.dateSelected = date;
    setElValues(this.el, this);
    calendarHtml(date, this);
  }

  function dateCheck(date) {
    return ({}).toString.call(date) === '[object Date]';
  }

  /*
   *  Removes all event listeners added by the constructor.
   *  Removes the current instance from the array of instances.
   */
  function remove() {
    window.removeEventListener('click', oneHandler);
    window.removeEventListener('focusin', oneHandler);
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

    const calClasses = this.calendar.classList;
    const hidden = calClasses.contains('hidden');

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
      }
    }
  }

  return Datepicker;
});
