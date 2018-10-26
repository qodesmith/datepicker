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
Get a date with JavaScript! Datepicker has **no dependencies** and is _stupid lightweight_ weighing in at **4.5kb gzipped**! I mean, do you even bandwidth bro? Datepicker is simple to use and looks sexy on the screen. A calendar pops up and you pick a date. #Boom.

_Note: Use_ `datepicker.min.js` _to ensure ES5 compatibility._

![Datepicker screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/calendar.png "Get a date with JavaScript!")


#### Quick Links - Options

* [alwaysShow](#alwaysShow)
* [customDays](#customDays)
* [customMonths](#customMonths)
* [dateSelected](#dateSelected)
* [disabledDates](#disabledDates)
* [disableMobile](#disableMobile)
* [disabledOverlay](#disabledOverlay)
* [id](#id)
* [formatter](#formatter)
* [maxDate](#maxDate)
* [minDate](#minDate)
* [noWeekends](#noWeekends)
* [startDate](#startDate)
* [onHide](#onHide)
* [onMonthChange](#onMonthChange)
* [onSelect](#onSelect)
* [onShow](#onShow)
* [overlayButton](#overlayButton)
* [overlayPlaceholder](#overlayPlaceholder)
* [position](#position)
* [startDay](#startDay)

See the [examples](#examples) below.

<!-- [Live Demo](http://aaroncordova.xyz/datepicker) -->


## Installation

#### Manually

Simply include `datepicker.css` in the `<head>`...
```html
<head>
  ...
  <link rel="stylesheet" href="datepicker.css">
  <!-- Via Unpkg CDN -->
  <!-- <link rel="stylesheet" href="https://unpkg.com/js-datepicker/datepicker.css"> -->
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

|       File        |            Location             |                 Description                |
| ----------------- | ------------------------------- | ------------------------------------------ |
| datepicker.js     | node_modules/js-datepicker/     | our main file - (ES7)                      |
| datepicker.min.js | node_modules/js-datepicker/     | minified main file - (ES5, 4.5kb gzipped!) |
| datepicker.css    | node_modules/js-datepicker/     | stylesheet                                 |
| datepicker.less   | node_modules/js-datepicker/less | less: use it for your own builds           |


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

```javascript
const picker = datepicker('.some-input', {
  onSelect: (instance, date) => {
    // Do stuff when a date is selected (or unselected) on the calendar.
    // You have access to the datepicker instance for convenience.
  }
})
```
type - function
default - none
arguments:
1. `instance` - the current datepicker instance.
2. `date`:
    * JavaScript date object when a date is being selected.
    * `undefined` when a date is being unselected.

Callback function after a date has been selected. The 2nd argument is the selected date when a date is being selected and `undefined` when a date is being unselected. You unselect a date by clicking it again.

_NOTE: IF you want to set something up like a daterange picker, use this option combined with the_ [`id`](#id) _option to ensure both calendars stay in sync. See this [example](#id)._


### onShow

```javascript
const picker = datepicker('.some-input', {
  onShow: instance => {
    // Do stuff when the calendar is shown.
    // You have access to the datepicker instance for convenience.
  }
})
```
type - function
default - none
arguments:
1. `instance` - the current datepicker instance.


### onHide

```javascript
const picker = datepicker('.some-input', {
  onHide: instance => {
    // Do stuff once the calendar goes away.
    // You have access to the datepicker instance for convenience.
  }
})
```
type - function
default - none
arguments:
1. `instance` - the current datepicker instance.

Callback function when the calendar is hidden.


### onMonthChange

```javascript
const picker = datepicker('.some-input', {
  onMonthChange: instance => {
    // Do stuff when the month changes.
    // You have access to the datepicker instance for convenience.
  }
})
```
type - function
default - none
arguments:
1. `instance` - the current datepicker instance.

Callback function when the month has changed.


## Options - Customizations

These options help you customize the calendar to your suit your needs. Some of these are especially helpful if you're using a language other than English.


### formatter

```javascript
const picker = datepicker('.some-input', {
  formatter: (input, date, instance) => {
    const value = date.toLocaleDateString()
    input.value = value // => '1/1/2099'
  }
})
```
type - function
default - none (default format is `date.toDateString()`)
arguments:
1. `input` - the input field that the datepicker is associated with.
2. `date` - a JavaScript date object of the currently selected date.
3. `instance` - the current datepicker instance.

Using an input field with your datepicker? Want to customize it's value anytime a date is selected? Provide a function that manually sets the provided input's value with your own formatting.


### position

```javascript
// The calendar will be positioned to the top-left of the input field.
const picker = datepicker('.some-input', { position: 'tl' })
```
type - string
default - 'bl'

This option positions the calendar relative to the input field it's associated with. This can be 1 of 5 values: `'tr'`, `'tl'`, `'br'`, `'bl'`, `'c'` representing top-right, top-left, bottom-right, bottom-left, and centered respectively. Datepicker will position itself accordingly relative to the element you reference in the 1st argument. For a value of `'c'`, Datepicker will position itself fixed, smack in the middle of the screen. This can be desirable for mobile devices.


### startDay

```javascript
// The first day of the week on this calendar is Monday.
const picker = datepicker('.some-input', { startDay: 1 })
```
type - number (0 - 6)
default - 0 (Sunday starts the week)

Specify the day of the week your calendar starts on. 0 = Sunday, 1 = Monday, etc. Plays nice with the [`customDays`](#customDays) option.


### customDays

```javascript
const picker = datepicker('.some-input', {
  customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S']
})
```
* type - array
* default - `['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']`

You can customize the display of days on the calendar by providing an array of 7 values. This can be used with the [`startDay`](#startDay) option if your week starts on a day other than Sunday.


### customMonths

```javascript
const picker = datepicker('.some-input', {
  customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
})
```

type - array
default - `['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];`

You can customize the display of the month name at the top of the calendar by providing an array of 12 values.


### overlayButton

```javascript
const picker = datepicker('.some-input', {
  overlayButton: "¡Vamanos!"
})
```
type - string
default - 'Submit'

Custom text for the year overlay submit button.


### overlayPlaceholder

```javascript
const picker = datepicker('.some-input', {
  overlayPlaceholder: 'Enter a year...'
})
```
type - string
default - '4-digit year'

Custom placeholder text for the year overlay.


## Options - Settings

Use these options to set the calendar the way you want.


### alwaysShow

```javascript
const picker = datepicker('.some-input', { alwaysShow: true })
```
* type - boolean
* default - `false`

By default, the datepicker will hide & show itself automatically depending on where you click or focus on the page. If you want the calendar to always be on the screen, use this option.


### dateSelected

```javascript
const picker = datepicker('.some-input', { dateSelected: new Date(2099, 0, 5) })
```
type - JS date object
default - none

This will start the calendar with a date already selected. If Datepicker is used with an `<input>` element, that field will be populated with this date as well.


### maxDate

```javascript
const picker = datepicker('.some-input', { maxDate: new Date(2099, 0, 1) })
```
type - JavaScript date object.
default - none

This will be the maximum threshold of selectable dates. Anything after it will be unselectable.


### minDate

```javascript
const picker = datepicker('.some-input', { minDate: new Date(2018, 0, 1) })
```
type - JavaScript date object.
default - none

This will be the minumum threshold of selectable dates. Anything prior will be unselectable.


### startDate

```javascript
const picker = datepicker('.some-input', { startDate: new Date(2099, 0 ,1) })
```
type - JavaScript date object.
default - today's month

The date you provide will be the month that the calendar start off at.


## Options - Disabling Things

These options are associated with disabled various things.


### noWeekends

```javascript
const picker = datepicker('.some-input', { noWeekends: true })
```
type - boolean
default - false

Provide `true` to disable selecting weekends. Weekends are Saturday & Sunday. If your weekends are a set of different days or you need more control over disabled dates, check out the [`disabler`](#disabler) option.


### disabler

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
type - function
default - none
arguments:
1. `date` - JavaScript date object representing a given day on a calendar.

Sometimes you need more control over which dates to customize. The [`disabledDates`](#disabledDates) option limits you to an explicit array of dates and the [`noWeekends`](#noWeekends) option limits you to Saturdays & Sundays. Provide a function that takes a JavaScript date as it's only argument and returns `true` if the date should be disabled. Each day on the calendar is run through this function prior to the calendar being created.


### disabledDates

```javascript
const picker = datepicker('.some-input', {
  disabledDates: [
    new Date(2099, 0, 5),
    new Date(2099, 0, 6),
    new Date(2099, 0, 7),
  ]
})
```
type - array of JS date objects
default - none

Provide an array of JS date objects that will be disabled on the calendar. This array cannot include the same date as [`dateSelected`](#dateSelected). If you need more control over which dates are disabled, see the [`disabler`](#disabler) option.


### disableMobile

```javascript
const picker = datepicker('.some-input', { disableMobile: true })
```
type - boolean
default - `false`

Optionally disable Datepicker on mobile devices. This is handy if you'd like to trigger the mobile device's native date picker instead. If that's the case, make sure to use an input with a type of "date" - `<input type="date" />`


### disableYearOverlay

```javascript
const picker = datepicker('.some-input', { disableYearOverlay: true })
```
type - boolean
default - `false`

Clicking the year or month name on the calendar triggers an overlay to show, allowing you to enter a year manually. If you want to disable this feature, set this option to `true`.


## Options - Other

### id
```javascript
const start = datepicker('.start', {
  id: 1,
  onSelect: (instance, date) => {
    instance.setMin(date) // Set this calendar's minimum date - start of the range.
    instance.sibling.setMin(date) // Set the sibling calendar as well.
  }
})

const end = datepicker('.end', {
  id: 1,
  onSelect: (instance, date) => {
    instance.setMax(date) // Set this calendar's maximum date - end of the range.
    instance.sibling.setMax(date) // Set the sibling calendar as well.
  }
})
```
type - anything but `null` or `undefined`
default - none

Now we're getting _fancy!_ If you want to link two instances together to help form a date-_range_ picker, this is your option. You still have manual work to do, but it's easy (see the example above). Only two picker instances can share an `id`.


## Methods

Each instance of Datepicker has methods to allow you to programmatically manipulate the calendar.


### remove()

```javascript
const picker = datepicker('.some-input')

/* ...so many things... */

picker.remove() // So fresh & so clean clean.
```

Performs cleanup. This will remove the current instance from the DOM, leaving all others in tact. If this is the only instance left, it will also remove the event listeners that Datepicker previously set up.


### setDate(date, changeCalendar)

```javascript
const picker = datepicker('.some-input')
picker.setDate(new Date(2099, 0 , 1), true)
```

arguments:
1. `date` - JavaScript date object.
2. `changeCalendar` - boolean (default is `false`)

Allows you to programmatically select a date on the calendar. If you pass `true` for the 2nd argument, the calendar will change to the month of the date you passed for argument 1 - otherwise, it will not change. This will This will _not_ trigger the [`onSelect`]('#onSelect') callback.


### setMin(date)

```javaScript
const picker = datepicker('.some-input')
picker.setMin(new Date(2018, 0, 1))
```

arguments:
1. `date` - JavaScript date object.

Allows you to programmatically change the minimum selectable date. If this instance has an [`id`](#id) set (effectively treating it like a date-range picker), the other instance will be changed as well.


### setMax(date)

```javaScript
const picker = datepicker('.some-input')
picker.setMax(new Date(2099, 0, 1))
```

arguments:
1. `date` - JavaScript date object.

Allows you to programmatically change the maximum selectable date. If this instance has an [`id`](#id) set (effectively treating it like a date-range picker), the other instance will be changed as well.


## Properties & Values

If you take a look at the datepicker instance, you'll notice plenty of values that you can grab and use however you'd like. Let's say you instantiated datepicker as such:

```javascript
const picker = datepicker('.some-class', { dateSelected: new Date(2099, 0, 5), id: 1 });
```

Below will detail some helpful properties and values that are available on the `picker` example above.

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
| `sibling` | If two datepickers have the same `id` option, then this property will be available and refer to the other instance.  |


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
    instance.sibling.setMin(selectedDate);
  }
});

const end = datepicker('.end', {
  id: 1,
  onSelect: (instance, selectedDate) => {
    instance.sibling.setMax(selectedDate);
  }
});

// NOTE: Any of the other options, as shown below, are valid for range pickers as well.
```

With all other options declared:
```javascript
const picker = datepicker(document.querySelector('#some-id'), {
  position: 'tr', // Top right.
  startDate: new Date(), // This month.
  startDay: 1, // Calendar week starts on a Monday.
  dateSelected: new Date(), // Today is selected.
  disabledDates: [new Date('1/1/2050'), new Date('1/3/2050')], // Disabled dates.
  minDate: new Date(2016, 5, 1), // June 1st, 2016.
  maxDate: new Date(2099, 0, 1), // Jan 1st, 2099.
  noWeekends: true, // Weekends will be unselectable.
  formatter: function(el, date, instance) {
    // This will display the date as `1/1/2017`.
    el.value = date.toDateString();
  },
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
  customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
  overlayPlaceholder: 'Enter a 4-digit year',
  overlayButton: 'Go!',
  disableMobile: true // Conditionally disabled on mobile devices.
});
```


## License

### MIT

Copyright 2018 Aaron Cordova

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
