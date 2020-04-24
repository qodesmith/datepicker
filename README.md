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

# Datepicker.js &middot; [![npm version](https://badge.fury.io/js/js-datepicker.svg)](https://badge.fury.io/js/js-datepicker)
Get a date with JavaScript! Or a daterange, but that's not a good pun. Datepicker has **no dependencies** and weighs in at **5.9kb gzipped**! Datepicker is simple to use and looks sexy on the screen. A calendar pops up and you pick a date. #Boom.

![Datepicker screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/calendar.png "Get a date with JavaScript!")


### Table of Contents

* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [Custom Elements / Shadow DOM Usage](#custom-elements--shadow-dom-usage)
* [Manual Year & Month Navigation](#manual-year--month-navigation)
* [Using As A Daterange Picker](#using-as-a-daterange-picker)
* [Calendar Examples](#examples)
* [Sizing The Calendar](#sizing-the-calendar)
* [Properties & Values](#properties--values)


#### Event Callbacks

* [onSelect](#onselect)
* [onShow](#onshow)
* [onHide](#onhide)
* [onMonthChange](#onmonthchange)

#### Customizations

* [formatter](#formatter)
* [position](#position)
* [startDay](#startday)
* [customDays](#customdays)
* [customMonths](#custommonths)
* [customOverlayMonths](#customoverlaymonths)
* [overlayButton](#overlaybutton)
* [overlayPlaceholder](#overlayplaceholder)
* [events](#events)

#### Settings

* [alwaysShow](#alwaysshow)
* [dateSelected](#dateselected)
* [maxDate](#maxdate)
* [minDate](#mindate)
* [startDate](#startdate)
* [showAllDates](#showalldates)
* [respectDisabledReadOnly](#respectdisabledreadonly)

#### Disabling Things

* [noWeekends](#noweekends)
* [disabler](#disabler)
* [disabledDates](#disableddates)
* [disableMobile](#disablemobile)
* [disableYearOverlay](#disableyearoverlay)
* [disabled](#disabled)

#### ID - Daterange

* [id](#id)

#### Instance Methods

* [remove](#remove)
* [setDate](#setdate)
* [setMin](#setmin)
* [setMax](#setmax)
* [show](#show)
* [hide](#hide)
  * [Show / Hide "Gotcha"](#show--hide-gotcha)
* [getRange](#getrange) _(daterange only)_


See the [examples](#examples) below.


## Installation

#### Manually

Simply include `datepicker.min.css` in the `<head>`...
```html
<head>
  ...
  <link rel="stylesheet" href="datepicker.min.css">
  <!-- Or remotely via Unpkg CDN -->
  <!-- <link rel="stylesheet" href="https://unpkg.com/js-datepicker/dist/datepicker.min.css"> -->
</head>
```

and include `datepicker.min.js` just above your closing `</body>` tag...
```html
<body>
  ...
  <script src="datepicker.min.js"></script>
  <!-- Or remotely via Unpkg CDN -->
  <!-- <script src="https://unpkg.com/js-datepicker"></script> -->
</body>
```

If you downloaded the package via zip file from Github, these files are located in the `dist` folder. Otherwise, you can use the Unpkg CDN as shown in the examples above.


#### Via NPM
```
npm install js-datepicker
```

Files & locations:

|        File        |             Folder              |               Description               |
| ------------------ | ------------------------------- | --------------------------------------- |
| datepicker.min.js  | node_modules/js-datepicker/dist | production build - (ES5, 5.9kb gzipped) |
| datepicker.min.css | node_modules/js-datepicker/dist | production stylesheet                   |
| datepicker.scss    | node_modules/js-datepicker/src  | Scss file. Use it in your own builds.   |


## Basic Usage

Importing the library if you're using it in Node:
```javascript
import datepicker from 'js-datepicker'
// or
const datepicker = require('js-datepicker')
```

Using it in your code:
```javascript
const picker = datepicker(selector, options)
```

Importing the styles into your project using Node:
```javascript
// From within a scss file,
// import datepickers scss file...
@import '~js-datepicker/src/datepicker';

// or import datepickers css file.
@import '~js-datepicker/dist/datepicker.min.css';
```

Datepicker takes 2 arguments:

1. `selector` - two possibilities:
    1. `string` - a CSS selector, such as `'.my-class'`, `'#my-id'`, or `'div'`.
    2. `DOM node` - provide a DOM node, such as `document.querySelector('#my-id')`.
2. (optional) An object full of [options](#options).

The return value of the `datepicker` function is the datepicker instance. See the methods and properties below.

You can use Datepicker with any type of element you want. If used with an `<input>` element (the common use case), then the `<input>`'s value will automatically be set when selecting a date.

_NOTE: Datepicker will not change the value of input fields with a type of_ `date` - `<input type="date">`. _This is because those input's already have a built in calendar and can cause problems. Use_ `<input type="text">` _instead._


### Manual Year & Month Navigation

By clicking on the year or month an overlay will show revealing an input field and a list of months. You can either enter a year in the input, click a month, or both:

![Datepicker screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/overlay-default.png "Get a date with JavaScript!")


### Using As A Daterange Picker

Want 2 calendars linked together to form ~~Voltron~~ a daterange picker? It's as simple as giving them both the same [id](#id)! By using the [id](#id) option, Datepicker handles all the logic to keep both calendars in sync.

![Datepicker daterange screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/daterange.gif "Animated GIF opf a daterange pair")

The 1st calendar will serve as the minimum date and the 2nd calendar as the maximum. Dates will be enabled / disabled on each calendar automatically when the user selects a date on either. The [getRange](#getrange) method will conveniently give you an object with the `start` and `end` date selections. It's as simple as creating 2 instances with the same `id` to form a daterange picker:

```javascript
const start = datepicker('.start', { id: 1 })
const end = datepicker('.end', { id: 1 })
```

And when you want to get your start and end values, simply call [getRange](#getrange) on _either_ instance:
```javascript
start.getRange() // { start: <JS date object>, end: <JS date object> }
end.getRange() // Gives you the same as above!
```

## Custom Elements / Shadow DOM Usage

You can use Datepicker within a Shadow DOM and custom elements. In order to do so, <span style="text-decoration: underline; font-style: italic; font-weight: bold;">must</span> pass a ___node___ as the 1st argument:

```javascript
class MyElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.innerHTML = `
      <div>
        <style>${textOfDatepickersCSS}</style>
        <input />
      </div>
    `

    // Create the node we'll pass to datepicker.
    this.input = shadowRoot.querySelector('input')
  }

  connectedCallback() {
    // Pass datepicker a node within the shadow DOM.
    datepicker(this.input)
  }
}

customElements.define('my-element', MyElement)
```

All other options work as expected, including dateranges. You can even have a date range pair with one calendar in the shadow DOM and another outside it!

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

_NOTE: This **will** fire when using the [show](#show) instance method._


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

_NOTE: This **will** fire when using the [hide](#hide) instance method._


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

![Custom days screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/chinese-days.png "Example with Chinese custom days")

* Type - array
* Default - `['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']`


### customMonths

You can customize the display of the month name at the top of the calendar by providing an array of 12 strings.

```javascript
const picker = datepicker('.some-input', {
  customMonths: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
})
```

![Custom months screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/spanish-months.png "Example with Spanish custom months")

* Type - array
* Default - `['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']`


### customOverlayMonths

You can customize the display of the month names in the overlay view by providing an array of 12 strings. Keep in mind that if the values are too long, it could produce undesired results in the UI.

Here's what the default looks like:

![Custom overlay months default screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/overlay-default.png "Example with default custom overlay months")

Here's an example with an array of custom values:

```javascript
const picker = datepicker('.some-input', {
  customOverlayMonths: ['😀', '😂', '😎', '😍', '🤩', '😜', '😬', '😳', '🤪', '🤓 ', '😝', '😮']
})
```

![Custom overlay months screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/overlay-custom-months.png "Example with custom overlay months")

* Type - array
* Default - The first 3 characters of each item in `customMonths`.


### overlayButton

Custom text for the year overlay submit button.

```javascript
const picker = datepicker('.some-input', {
  overlayButton: "¡Vamanos!"
})
```

![Custom overlay text screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/overlay-button.png "Example with custom overlay text")

* Type - string
* Default - `'Submit'`


### overlayPlaceholder

Custom placeholder text for the year overlay.

```javascript
const picker = datepicker('.some-input', {
  overlayPlaceholder: 'Entrar un año'
})
```

![Custom overlay placeholder screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/overlay-placeholder.png "Example with custom overlay placeholder text")

* Type - string
* Default - `'4-digit year'`


### events

An array of dates which indicate something is happening - a meeting, birthday, etc. I.e. an _event_.
```javascript
const picker = datepicker('.some-input', {
  events: [
    new Date(2019, 10, 1),
    new Date(2019, 10, 10),
    new Date(2019, 10, 20),
  ]
})
```

![Events on calendar screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/events.png "Example with events on calendar")

* Type - array of JS date objects


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

_NOTE: When using a [daterange](#using-as-a-daterange-picker) pair, if you set_ `maxDate` _on the first instance options it will be ignored on the 2nd instance options._


### minDate

This will be the minumum threshold of selectable dates. Anything prior will be unselectable.

```javascript
const picker = datepicker('.some-input', { minDate: new Date(2018, 0, 1) })
```
* Type - JavaScript date object.

_NOTE: When using a [daterange](#using-as-a-daterange-picker) pair, if you set_ `minDate` _on the first instance options it will be ignored on the 2nd instance options._


### startDate

The date you provide will determine the month that the calendar starts off at.

```javascript
const picker = datepicker('.some-input', { startDate: new Date(2099, 0, 1) })
```
* Type - JavaScript date object.
* Default - today's month


### showAllDates

By default, the datepicker will not put date numbers on calendar days that fall outside the current month. They will be empty squares. Sometimes you want to see those preceding and trailing days. This is the option for you.

```javascript
const picker = datepicker('.some-input', { showAllDates: true })
```

![Show all dates on screenshot](https://raw.githubusercontent.com/qodesmith/datepicker/master/images/show-all-dates-on.png "Example with show all dates option on")

* Type - boolean
* Default - `false`


### respectDisabledReadOnly

`<input />`'s can have a `disabled` or `readonly` attribute applied to them. In those cases, you might want to prevent Datepicker from selecting a date and changing the input's value. Set this option to `true` if that's the case. The calendar will still be functional in that you can change months and enter a year, but dates will not be selectable (or deselectable).

```javascript
const picker = datepicker('.some-input', { respectDisabledReadOnly: true })
```

* Type - boolean
* Default - `false`


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


### disabled

Want to completely disable the calendar? Simply set the `disabled` property on the datepicker instance to `true` to render it impotent. Maybe you don't want the calendar to show in a given situation. Maybe the calendar is showing but you don't want it to do anything until some other field is filled out in a form. Either way, have fun.

Example:
```javascript
const picker = datepicker('.some-input')

function disablePicker() {
  picker.disabled = true
}

function enablePicker() {
  picker.disabled = false
}

function togglePicker() {
  picker.disabled = !picker.disabled
}
```


## Options - Other

### id

Now we're getting _fancy!_ If you want to link two instances together to help form a daterange picker, this is your option. Only two picker instances can share an `id`. The datepicker instance declared first will be considered the "start" picker in the range. There's a fancy [getRange](#getrange) method for you to use as well.

```javascript
const start = datepicker('.start', { id: 1 })
const end = datepicker('.end', { id: 1 })
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


### navigate

Programmatically navigates the calendar to the date you provide. This doesn't select a date, it's literally just for navigation. You can optionally trigger the `onMonthChange` callback with the 2nd argument.

```javascript
const picker = datepicker('.some-input')
const date = new Date(2020, 3, 1)

/* ...so many things... */

// Navigate to a new month.
picker.navigate(date)

// Navigate to a new month AND trigger the `onMonthChange` callback.
picker.navigate(date, true)
```

* Arguments:
    1. `date` - JavaScript date object.
    2. `changeCalendar` - boolean (default is `false`)


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
picker.setDate(new Date(2099, 10, 1))

// Remove the selection simply by omitting any arguments.
picker.setDate()
```
* Arguments:
    1. `date` - JavaScript date object.
    2. `changeCalendar` - boolean (default is `false`)

_Note: This will not trigger the_ [`onSelect`]('#onselect') _callback._


### setMin

Allows you to programmatically set the minimum selectable date or unset it. If this instance is part of a [daterange](#using-as-a-daterange-picker) instance (see the [`id`](#id) option) then the other instance will be changed as well. To unset a minimum date, simply run the function with no arguments.

```javascript
// Set a minimum selectable date.
const picker = datepicker('.some-input')
picker.setMin(new Date(2018, 0, 1))

// Remove the minimum selectable date.
picker.setMin()
```
* Arguments:
    1. `date` - JavaScript date object.


### setMax

Allows you to programmatically set the maximum selectable date or unset it. If this instance is part of a [daterange](#using-as-a-daterange-picker) instance (see the [`id`](#id) option) then the other instance will be changed as well. To unset a maximum date, simply run the function with no arguments.

```javascript
// Set a maximum selectable date.
const picker = datepicker('.some-input')
picker.setMax(new Date(2099, 0, 1))

// Remove the maximum selectable date.
picker.setMax()
```
* Arguments:
    1. `date` - JavaScript date object.


### show

Allows you to programmatically show the calendar. Using this method will trigger the `onShow` callback if your instance has one.

```javascript
const picker = datepicker('.some-input')
picker.show()
```

_Note: see the "[gotcha](#show--hide-gotcha)" below for implementing this method in an event handler._


### hide

Allows you to programmatically hide the calendar. If the `alwaysShow` property was set on the instance then this method will have no effect. Using this method will trigger the `onHide` callback if your instance has one.

```javascript
const picker1 = datepicker('.some-input')
const picker2 = datepicker('.some-other-input', { alwaysShow: true })

picker1.hide() // This works.
picker2.hide() // This does not work because of `alwaysShow`.
```

_Note: see the "[gotcha](#show--hide-gotcha)" below for implementing this method in an event handler._


#### Show / Hide "Gotcha"

Want to show / hide the calendar programmatically with a button or by clicking some element? Make [sure](https://github.com/qodesmith/datepicker/issues/71#issuecomment-553363045) to use `stopPropagation` in your event callback! If you don't, any click event in the DOM will bubble up to Datepicker's internal `oneHandler` event listener, triggering logic to close the calendar since it "sees" the click event _outside_ the calendar. Here's an example on how to use the `show` and `hide` methods in a click event handler:

```javascript
// Attach the picker to an input element.
const picker = datepicker(inputElement, options)

// Toggle the calendar when a button is clicked.
button.addEventListener('click', e => {
  // THIS!!! Prevent Datepicker's event handler from hiding the calendar.
  e.stopPropagation()

  // Toggle the calendar.
  const isHidden = picker.calendarContainer.classList.contains('qs-hidden')
  picker[isHidden ? 'show' : 'hide']()
})
```


### getRange

This method is only available on [daterange](#using-as-a-daterange-picker) pickers. It will return an object with `start` and `end` properties whose values are JavaScript date objects representing what the user selected on both calendars.

```javascript
const start = datepicker('.start', { id: 1 })
const end = datepicker('.end', { id: 1 })

// ...

start.getRange() // { start: <JS date object>, end: <JS date object> }
end.getRange() // Gives you the same as above!
```


## Properties & Values

If you take a look at the datepicker instance, you'll notice plenty of values that you can grab and use however you'd like. Below details some helpful properties and values that are available on the picker instance.

| Property | Value |
| -------- | ----- |
| `calendar` | The calendar element. |
| `calendarContainer` | The container element that houses the calendar. Use it to [size](#sizing-the-calendar) the calendar or programmatically [check if the calendar is showing](#show--hide-gotcha). |
| `currentMonth` | A 0-index number representing the current month. For example, `0` represents January. |
| `currentMonthName` | Calendar month in plain english. E.x. `January` |
| `currentYear` | The current year. E.x. `2099` |
| `dateSelected` | The value of the selected date. This will be `undefined` if no date has been selected yet. |
| `el` | The element datepicker is relatively positioned against (unless centered). |
| `minDate` | The minimum selectable date. |
| `maxDate` | The maximum selectable date. |
| `sibling` | If two datepickers have the same `id` option then this property will be available and refer to the other instance. |


## Sizing The Calendar

You can control the size of the calendar dynamically with the `font-size` property!

Every element you see on the calendar is relatively sized in `em`'s. The calendar has a container `<div>` with a class name of `qs-datepicker-container` and a `font-size: 1rem` style on it in the CSS. Simply override that property with inline styles set via JavaScript and watch the calendar resize! For ease, you can access the containing div via the `calendarContainer` property on each instance. For example:

```javascript
// Instantiate a datepicker instance.
const picker = datepicker('.some-class')

// Use JavaScript to change the calendar size.
picker.calendarContainer.style.setProperty('font-size', '1.5rem')
```


## Examples

Simplest usage:
```javascript
const picker = datepicker('#some-id')
```

Setting up a daterange picker:
```javascript
const start = datepicker('.start', { id: 1 })
const end = datepicker('.end', { id: 1 })

// NOTE: Any of the other options, as shown below, are valid for range pickers as well.
```

With all other options declared:
```javascript
const picker = datepicker('#some-id', {
  // Event callbacks.
  onSelect: instance => {
    // Show which date was selected.
    console.log(instance.dateSelected)
  },
  onShow: instance => {
    console.log('Calendar showing.')
  },
  onHide: instance => {
    console.log('Calendar hidden.')
  },
  onMonthChange: instance => {
    // Show the month of the selected date.
    console.log(instance.currentMonthName)
  },

  // Customizations.
  formatter: (input, date, instance) => {
    // This will display the date as `1/1/2019`.
    input.value = date.toDateString()
  },
  position: 'tr', // Top right.
  startDay: 1, // Calendar week starts on a Monday.
  customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
  customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  customOverlayMonths: ['😀', '😂', '😎', '😍', '🤩', '😜', '😬', '😳', '🤪', '🤓 ', '😝', '😮'],
  overlayButton: 'Go!',
  overlayPlaceholder: 'Enter a 4-digit year',

  // Settings.
  alwaysShow: true, // Never hide the calendar.
  dateSelected: new Date(), // Today is selected.
  maxDate: new Date(2099, 0, 1), // Jan 1st, 2099.
  minDate: new Date(2016, 5, 1), // June 1st, 2016.
  startDate: new Date(), // This month.
  showAllDates: true, // Numbers for leading & trailing days outside the current month will show.

  // Disabling things.
  noWeekends: true, // Saturday's and Sunday's will be unselectable.
  disabler: date => (date.getDay() === 2 && date.getMonth() === 9), // Disabled every Tuesday in October
  disabledDates: [new Date(2050, 0, 1), new Date(2050, 0, 3)], // Specific disabled dates.
  disableMobile: true, // Conditionally disabled on mobile devices.
  disableYearOverlay: true, // Clicking the year or month will *not* bring up the year overlay.

  // ID - be sure to provide a 2nd picker with the same id to create a daterange pair.
  id: 1
})
```


## License

### MIT

Copyright 2017 - present, Aaron Cordova

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
