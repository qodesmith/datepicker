```
 ____             __                               __
/\  _`\          /\ \__                 __        /\ \
\ \ \/\ \     __ \ \ ,_\    __   _____ /\_\    ___\ \ \/'\      __   _ __
 \ \ \ \ \  /'__`\\ \ \/  /'__`\/\ '__`\/\ \  /'___\ \ , <    /'__`\/\`'__\
  \ \ \_\ \/\ \L\.\\ \ \_/\  __/\ \ \L\ \ \ \/\ \__/\ \ \\`\ /\  __/\ \ \/
   \ \____/\ \__/.\_\ \__\ \____\\ \ ,__/\ \_\ \____\\ \_\ \_\ \____\\ \_\
    \/___/  \/__/\/_/\/__/\/____/ \ \ \/  \/_/\/____/ \/_/\/_/\/____/ \/_/
                                   \ \_\
                                    \/_/ By: The Qodesmith
```

# Datepicker.js
Get a date with JavaScript! Datepicker has **no dependencies** and weighs in at **5kb gzipped**! Datepicker is simple to use and looks sexy on the screen. A calendar pops up and you pick a date. #Boom.

_Note: Use_ `datepicker.min.js` _to ensure ES5 compatibility._

![Datepicker screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/calendar.png "Get a date with JavaScript!")


### Table of Contents

**Event Callbacks**

* [onSelect](#onselect)
* [onShow](#onshow)
* [onHide](#onhide)
* [onMonthChange](#onmonthchange)

**Customizations**

* [formatter](#formatter)
* [position](#position)
* [startDay](#startday)
* [customDays](#customdays)
* [customMonths](#custommonths)
* [overlayButton](#overlaybutton)
* [overlayPlaceholder](#overlayplaceholder)

**Settings**

* [alwaysShow](#alwaysshow)
* [dateSelected](#dateselected)
* [maxDate](#maxdate)
* [minDate](#mindate)
* [startDate](#startdate)

**Disabling Things**

* [noWeekends](#noweekends)
* [disabler](#disabler)
* [disabledDates](#disableddates)
* [disableMobile](#disablemobile)
* [disableYearOverlay](#disableyearoverlay)

**ID - Daterange**
* [id](#id)

**Instance Methods**

* [remove](#remove)
* [setDate](#setdate)
* [setMin](#setmin)
* [setMax](#setmax)

See the [examples](#examples) below.

<!-- [Live Demo](http://aaroncordova.xyz/datepicker) -->


## Installation

#### Manually

Simply include `datepicker.css` in the `<head>`...
```html
<head>
  ...
  <link rel="stylesheet" href="datepicker.min.css">
  <!-- Via Unpkg CDN -->
  <!-- <link rel="stylesheet" href="https://unpkg.com/js-datepicker/dist/datepicker.min.css"> -->
</head>
```

and include `datepicker.min.js` just above your closing `</body>` tag...
```html
<body>
  ...
  <script src="datepicker.min.js"></script>
  <!-- Via Unpkg CDN -->
  <!-- <script src="https://unpkg.com/js-datepicker"></script> -->
</body>
```


#### Via NPM
```
npm install --save js-datepicker
```

Files & locations:

|        File        |            Location             |               Description              |
| ------------------ | ------------------------------- | -------------------------------------- |
| datepicker.js      | node_modules/js-datepicker/src  | our main file - (ES7)                  |
| datepicker.less    | node_modules/js-datepicker/src  | less: use it for your own builds       |
| datepicker.min.js  | node_modules/js-datepicker/dist | production build - (ES5, 5kb gzipped!) |
| datepicker.min.css | node_modules/js-datepicker/dist | production stylesheet                  |


## Usage

```javascript
const picker = datepicker(selector, options)
```

Datepicker takes 2 arguments:

1. `selector` - two possibilities:
    1. `string` - a CSS selector, such as `'.my-class'`, `'#my-id'`, or `'div'`.
    2. `DOM node` - provide a DOM node, such as `document.querySelector('#my-id')`.
2. (optional) An object full of [options](#options).

The return value of the `datepicker` function is the datepicker instance. See the methods and properties below.

You can use Datepicker with any type of element you want. If used with an `<input>` element (the common use case), then the `<input>`'s value will automatically be set when selecting a date.

_NOTE: Using_ `<input type="date">` _will cause issues as those inputs already have a built in calendar._ `datepicker` _will not change the value of those inputs. Use_ `<input type="text">` _instead._


### Manual Year Navigation

By clicking on the year or month, an overlay will show revealing an input field where you can enter a year:
![Datepicker screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/overlay.png "Get a date with JavaScript!")

<hr>


## Options - Event Callbacks

Use these options if you want to fire off your own functions after something happens with the calendar.


### onSelect

Callback function after a date has been selected. The 2nd argument is the selected date when a date is being selected and `undefined` when a date is being unselected. You unselect a date by clicking it again.

```javascript
const picker = datepicker('.some-input', {
  onSelect: (instance, date) => {
    // Do stuff when a date is selected (or unselected) on the calendar.
    // You have access to the datepicker instance for convenience.
  }
})
```
* Arguments:
    1. `instance` - the current datepicker instance.
    2. `date`:
        * JavaScript date object when a date is being selected.
        * `undefined` when a date is being unselected.

_NOTE: If you want to set something up like a daterange picker, use this option combined with the_ [`id`](#id) _option to ensure both calendars stay in sync. See [this example](#id)._

_NOTE: This will not fire when using the [instance methods](#methods) to manually change the calendar._


### onShow

Callback function when the calendar is shown.

```javascript
const picker = datepicker('.some-input', {
  onShow: instance => {
    // Do stuff when the calendar is shown.
    // You have access to the datepicker instance for convenience.
  }
})
```
* Arguments:
    1. `instance` - the current datepicker instance.


### onHide

Callback function when the calendar is hidden.

```javascript
const picker = datepicker('.some-input', {
  onHide: instance => {
    // Do stuff once the calendar goes away.
    // You have access to the datepicker instance for convenience.
  }
})
```
* Arguments:
    1. `instance` - the current datepicker instance.


### onMonthChange

Callback function when the month has changed.

```javascript
const picker = datepicker('.some-input', {
  onMonthChange: instance => {
    // Do stuff when the month changes.
    // You have access to the datepicker instance for convenience.
  }
})
```
* Arguments:
    1. `instance` - the current datepicker instance.


## Options - Customizations

These options help you customize the calendar to your suit your needs. Some of these are especially helpful if you're using a language other than English.


### formatter

Using an input field with your datepicker? Want to customize its value anytime a date is selected? Provide a function that manually sets the provided input's value with your own formatting.

```javascript
const picker = datepicker('.some-input', {
  formatter: (input, date, instance) => {
    const value = date.toLocaleDateString()
    input.value = value // => '1/1/2099'
  }
})
```
* Default - default format is `date.toDateString()`
* Arguments:
    1. `input` - the input field that the datepicker is associated with.
    2. `date` - a JavaScript date object of the currently selected date.
    3. `instance` - the current datepicker instance.

_Note: The_ `formatter` _function will only run if the datepicker instance is associated with an_ `<input>` _field._


### position

This option positions the calendar relative to the `<input>` field it's associated with. This can be 1 of 5 values: `'tr'`, `'tl'`, `'br'`, `'bl'`, `'c'` representing top-right, top-left, bottom-right, bottom-left, and centered respectively. Datepicker will position itself accordingly relative to the element you reference in the 1st argument. For a value of `'c'`, Datepicker will position itself fixed, smack in the middle of the screen. This can be desirable for mobile devices.

```javascript
// The calendar will be positioned to the top-left of the input field.
const picker = datepicker('.some-input', { position: 'tl' })
```
* Type - string
* Default - `'bl'`


### startDay

Specify the day of the week your calendar starts on. `0` = Sunday, `1` = Monday, etc. Plays nice with the [`customDays`](#customdays) option.

```javascript
// The first day of the week on this calendar is Monday.
const picker = datepicker('.some-input', { startDay: 1 })
```
* Type - number (`0` - `6`)
* Default - `0` (Sunday starts the week)


### customDays

You can customize the display of days on the calendar by providing an array of 7 values. This can be used with the [`startDay`](#startday) option if your week starts on a day other than Sunday.

<!-- Chinese days taken from https://goo.gl/vVrqRJ -->
```javascript
const picker = datepicker('.some-input', {
  customDays: ['天', '一', '二', '三', '四', '五', '六']
})
```

![Custom days screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/chinese-days.png "Example with Chinese custom days")

* Type - array
* Default - `['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']`


### customMonths

You can customize the display of the month name at the top of the calendar by providing an array of 12 values.

```javascript
const picker = datepicker('.some-input', {
  customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
})
```

![Custom months screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/spanish-months.png "Example with Spanish custom months")

* Type - array
* Default - `['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];`


### overlayButton

Custom text for the year overlay submit button.

```javascript
const picker = datepicker('.some-input', {
  overlayButton: "¡Vamanos!"
})
```

![Custom overlay text screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/overlay-button.png "Example with custom overlay text")

* Type - string
* Default - `'Submit'`


### overlayPlaceholder

Custom placeholder text for the year overlay.

```javascript
const picker = datepicker('.some-input', {
  overlayPlaceholder: 'Enter a year...'
})
```

![Custom overlay placeholder screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/overlay-placeholder.png "Example with custom overlay placeholder text")

* Type - string
* Default - `'4-digit year'`


## Options - Settings

Use these options to set the calendar the way you want.


### alwaysShow

By default, the datepicker will hide & show itself automatically depending on where you click or focus on the page. If you want the calendar to always be on the screen, use this option.

```javascript
const picker = datepicker('.some-input', { alwaysShow: true })
```
* Type - boolean
* Default - `false`


### dateSelected

This will start the calendar with a date already selected. If Datepicker is used with an `<input>` element, that field will be populated with this date as well.

```javascript
const picker = datepicker('.some-input', { dateSelected: new Date(2099, 0, 5) })
```
* Type - JS date object


### maxDate

This will be the maximum threshold of selectable dates. Anything after it will be unselectable.

```javascript
const picker = datepicker('.some-input', { maxDate: new Date(2099, 0, 1) })
```
* Type - JavaScript date object.


### minDate

This will be the minumum threshold of selectable dates. Anything prior will be unselectable.

```javascript
const picker = datepicker('.some-input', { minDate: new Date(2018, 0, 1) })
```
* Type - JavaScript date object.


### startDate

The date you provide will determine the month that the calendar starts off at.

```javascript
const picker = datepicker('.some-input', { startDate: new Date(2099, 0, 1) })
```
* Type - JavaScript date object.
* Default - today's month


## Options - Disabling Things

These options are associated with disabled various things.


### noWeekends

Provide `true` to disable selecting weekends. Weekends are Saturday & Sunday. If your weekends are a set of different days or you need more control over disabled dates, check out the [`disabler`](#disabler) option.

```javascript
const picker = datepicker('.some-input', { noWeekends: true })
```
* Type - boolean
* Default - `false`


### disabler

Sometimes you need more control over which dates to disable. The [`disabledDates`](#disableddates) option is limited to an explicit array of dates and the [`noWeekends`](#noweekends) option is limited to Saturdays & Sundays. Provide a function that takes a JavaScript date as it's only argument and returns `true` if the date should be disabled. When the calendar builds, each date will be run through this function to determine whether or not it should be disabled.

```javascript
const picker1 = datepicker('.some-input1', {
  // Disable every Tuesday on the calendar (for any given month).
  disabler: date => date.getDay() === 2
})

const picker2 = datepicker('.some-input2', {
  // Disable every day in the month of October (for any given year).
  disabler: date => date.getMonth() === 9
})
```
* Arguments:
    1. `date` - JavaScript date object representing a given day on a calendar.


### disabledDates

Provide an array of JS date objects that will be disabled on the calendar. This array cannot include the same date as [`dateSelected`](#dateselected). If you need more control over which dates are disabled, see the [`disabler`](#disabler) option.

```javascript
const picker = datepicker('.some-input', {
  disabledDates: [
    new Date(2099, 0, 5),
    new Date(2099, 0, 6),
    new Date(2099, 0, 7),
  ]
})
```
* Type - array of JS date objects


### disableMobile

Optionally disable Datepicker on mobile devices. This is handy if you'd like to trigger the mobile device's native date picker instead. If that's the case, make sure to use an input with a type of "date" - `<input type="date" />`

```javascript
const picker = datepicker('.some-input', { disableMobile: true })
```
* Type - boolean
* Default - `false`


### disableYearOverlay

Clicking the year or month name on the calendar triggers an overlay to show, allowing you to enter a year manually. If you want to disable this feature, set this option to `true`.

```javascript
const picker = datepicker('.some-input', { disableYearOverlay: true })
```
* Type - boolean
* Default - `false`


## Options - Other

### id

Now we're getting _fancy!_ If you want to link two instances together to help form a date-_range_ picker, this is your option. You still have manual work to do, but it's easy (see the example below). Only two picker instances can share an `id`. The datepicker instance declared first will be considered the "start" picker in the range.

```javascript
const start = datepicker('.start', {
  id: 1,
  onSelect: (instance, date) => {
    // Both instances will be set because they are linked by `id`.
    instance.setMin(date)
  }
})

const end = datepicker('.end', {
  id: 1,
  onSelect: (instance, date) => {
    // Both instances will be set because they are linked by `id`.
    instance.setMax(date)
  }
})
```
* Type - anything but `null` or `undefined`


## Methods

Each instance of Datepicker has methods to allow you to programmatically manipulate the calendar.


### remove

Performs cleanup. This will remove the current instance from the DOM, leaving all others in tact. If this is the only instance left, it will also remove the event listeners that Datepicker previously set up.

```javascript
const picker = datepicker('.some-input')

/* ...so many things... */

picker.remove() // So fresh & so clean clean.
```


### setDate

Allows you to programmatically select or unselect a date on the calendar. To select a date on the calendar, pass in a JS date object for the 1st argument. If you set a date on a month other than what's currently displaying _and_ you want the calendar to automatically change to it, pass in `true` as the 2nd argument.

Want to unselect a date? Simply run the function with no arguments.

```javascript
// Select a date on the calendar.
const picker = datepicker('.some-input')

// Selects January 1st 2099 on the calendar
// *and* changes the calendar to that date.
picker.setDate(new Date(2099, 0, 1), true)

// Selects November 1st 2099 but does *not* change the calendar.
picker.setDate(new Date(2099, 10, 1), true)

// Remove the selection simply by omitting any arguments.
picker.setDate()
```
* Arguments:
    1. `date` - JavaScript date object.
    2. `changeCalendar` - boolean (default is `false`)

_Note: This will not trigger the_ [`onSelect`]('#onselect') _callback._


### setMin

Allows you to programmatically set the minimum selectable date or unset it. If this instance is part of a date-_range_ instance (see the [`id`](#id) option) then the other instance will be changed as well. To unset a minimum date, simply run the function with no arguments.

```javaScript
// Set a minimum selectable date.
const picker = datepicker('.some-input')
picker.setMin(new Date(2018, 0, 1))

// Remove the minimum selectable date.
picker.setMin()
```
* Arguments:
    1. `date` - JavaScript date object.


### setMax

Allows you to programmatically set the maximum selectable date or unset it. If this instance is part of a date-_range_ instance (see the [`id`](#id) option) then the other instance will be changed as well. To unset a maximum date, simply run the function with no arguments.

```javaScript
// Set a maximum selectable date.
const picker = datepicker('.some-input')
picker.setMax(new Date(2099, 0, 1))

// Remove the maximum selectable date.
picker.setMax()
```
* Arguments:
    1. `date` - JavaScript date object.


## Properties & Values

If you take a look at the datepicker instance, you'll notice plenty of values that you can grab and use however you'd like. Below details some helpful properties and values that are available on the picker instance.

| Property | Value |
| -------- | ----- |
| `calendar` | The calendar element. |
| `currentMonth` | A 0-index number representing the current month. For example, `0` represents January. |
| `currentMonthName` | Calendar month in plain english. E.x. `January` |
| `currentYear` | The current year. E.x. `2099` |
| `dateSelected` | The value of the selected date. This will be `undefined` if no date has been selected yet. |
| `el` | The element datepicker is relatively positioned against (unless centered). |
| `minDate` | The minimum selectable date. |
| `maxDate` | The maximum selectable date. |
| `sibling` | If two datepickers have the same `id` option then this property will be available and refer to the other instance. |


## Sizing The Calendar

Styles for the calendar are compiled down to CSS from the `datepicker.less` file with `gulp`. All the sizes for the various portions of the calendar are relative to a single value at the top of that file: `@width: 250px;`. To resize the calendar, simply rebuild `datepicker.css` by doing the following:

1. Open `datepicker.less`
2. Change the `@width` variable to whatever value you want (try `350px`) and save.
3. From the command line run `gulp less`.


## Examples

Simplest usage:
```javascript
const picker = datepicker('#some-id');
```

Setting up a date-range picker:
```javascript
const start = datepicker('.start', {
  id: 1,
  onSelect: (instance, selectedDate) => {
    instance.setMin(selectedDate);
  }
});

const end = datepicker('.end', {
  id: 1,
  onSelect: (instance, selectedDate) => {
    instance.setMax(selectedDate);
  }
});

// NOTE: Any of the other options, as shown below, are valid for range pickers as well.
```

With all other options declared:
```javascript
const picker = datepicker(document.querySelector('#some-id'), {
  // Event callbacks.
  onSelect: function(instance) {
    // Show which date was selected.
    console.log(instance.dateSelected);
  },
  onShow: function(instance) {
    console.log('Calendar showing.');
  },
  onHide: function(instance) {
    console.log('Calendar hidden.');
  },
  onMonthChange: function(instance) {
    // Show the month of the selected date.
    console.log(instance.currentMonthName);
  },

  // Customizations.
  formatter: function(el, date, instance) {
    // This will display the date as `1/1/2019`.
    el.value = date.toDateString();
  },
  position: 'tr', // Top right.
  startDay: 1, // Calendar week starts on a Monday.
  customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
  customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  overlayButton: 'Go!',
  overlayPlaceholder: 'Enter a 4-digit year',

  // Settings.
  alwaysShow: true, // Never hide the calendar.
  dateSelected: new Date(), // Today is selected.
  maxDate: new Date(2099, 0, 1), // Jan 1st, 2099.
  minDate: new Date(2016, 5, 1), // June 1st, 2016.
  startDate: new Date(), // This month.

  // Disabling things.
  noWeekends: true, // Saturday's and Sunday's will be unselectable.
  disabler: date => (date.getDay() === 2 && date.getMonth() === 9), // Disabled every Tuesday in October
  disabledDates: [new Date(2050, 0, 1), new Date(2050, 0, 3)], // Specific disabled dates.
  disableMobile: true, // Conditionally disabled on mobile devices.
  disableYearOverlay: true, // Clicking the year or month will *not* bring up the year overlay.

  // Id - be sure to provide a 2nd picker with the same id to create a daterange pair.
  id: 1
});
```


## License

### MIT

Copyright 2018 Aaron Cordova

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
