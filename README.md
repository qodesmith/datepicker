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

[![npm version](https://badge.fury.io/js/js-datepicker.svg)](https://badge.fury.io/js/js-datepicker)

Get a date with JavaScript! Or a daterange, but that's not a good pun.
Datepicker is simple to use, looks sexy on the screen, and has
**no dependencies** 😎 A calendar pops up and you pick a date. #Boom.

<!-- TODO - insert picture of Datepicker here. -->

# Installation

## Via npm

```
npm i js-datepicker
```

## Manual Installation

Simply include `datepicker.min.css` in the `<head>` of your document:

```html
<head>
  <!-- From the dist folder in this repo... -->
  <link rel="stylesheet" href="datepicker.min.css" />

  <!-- ...or remotely via Unpkg CDN -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/js-datepicker/dist/datepicker.min.css" />
</head>
```

And include datepicker.min.js just above your closing `</body>` tag:

```html
<body>
  ...

  <!-- From the dist folder in this repo... -->
  <script src="datepicker.min.js"></script>

  <!-- ...or remotely via Unpkg CDN -->
  <script src="https://unpkg.com/js-datepicker"></script>
</body>
```

If you downloaded the package via zip file from Github, these files are located
in the dist folder. Otherwise, you can use the Unpkg CDN as shown in the
examples above.

# Basic Usage

```javascript
import 'js-datepicker/datepicker.css' // Import this somewhere once.
import {datepicker} from 'js-datepicker'

const picker = datepicker(selector, options)
```

Here is Datepicker's type signature:

```typescript
function datepicker(
  selector: string | HTMLElement,
  options?: DatepickerOptions
): DatepickerInstance
```

Datepicker takes 2 arguments:

- `selector` - a string or a DOM element that Datepicker will attach to in the
  DOM. In the case where the selector is an `<input>` element, Datepicker will be
  attached to the input's parent element.
- `options` - an optional object representing all the bells & whistles you can
  tweak with Datepicker. More on that [below](#options).

The return value of the `datepicker` function is the datepicker _instance_. See
the methods and properties below.

# Options

Datepicker has a load of options, so we'll break them down by catagories.
Each option is _optional_ and any default values are specified.

<table>
  <thead style="font-size:1.3em">
  <!-- HEADER -->
  <tr>
    <th>Callbacks</th>
    <th>Customizations</th>
    <th>Settings</th>
    <th>Disabling Things</th>
  </tr>
  </thead>

  <!-- ROWS -->
  <tbody>
  <tr>
    <td><a href="./docs/callbacks.md#onhide">onHide</a></td>
    <td><a href="./docs/customizations.md#customdays">customDays</a></td>
    <td><a href="./docs/settings.md#alwaysshow">alwaysShow</a></td>
    <td><a href="./docs/disabling-things.md#disableyearoverlay">disableYearOverlay</a></td>
  </tr>
  <tr>
    <td><a href="./docs/callbacks.md#onmonthchange">onMonthChange</a></td>
    <td><a href="./docs/customizations.md#custommonths">customMonths</a></td>
    <td><a href="./docs/settings.md#events">events</a></td>
    <td><a href="./docs/disabling-things.md#disableddates">disabledDates</a></td>
  </tr>
  <tr>
    <td><a href="./docs/callbacks.md#onselect">onSelect</a></td>
    <td><a href="./docs/customizations.md#customoverlaymonths">customOverlayMonths</a></td>
    <td><a href="./docs/settings.md#exemptids">exemptIds</a></td>
    <td><a href="./docs/disabling-things.md#disabler">disabler</a></td>
  </tr>
  <tr>
    <td><a href="./docs/callbacks.md#onshow">onShow</a></td>
    <td><a href="./docs/customizations.md#defaultview">defaultView</a></td>
    <td><a href="./docs/settings.md#maxdate">maxDate</a></td>
    <td><a href="./docs/disabling-things.md#noweekends">noWeekends</a></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#formatter">formatter</a></td>
    <td><a href="./docs/settings.md#mindate">minDate</a></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#customoverlaymonths">customOverlayMonths</a></td>
    <td><a href="./docs/settings.md#selecteddate">selectedDate</a></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#defaultview">defaultView</a></td>
    <td><a href="./docs/settings.md#showalldates">showAllDates</a></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#overlaybuttontext">overlayButtonText</a></td>
    <td><a href="./docs/settings.md#showalldatesclickable">showAllDatesClickable</a></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#overlayplaceholder">overlayPlaceholder</a></td>
    <td><a href="./docs/settings.md#startdate">startDate</a></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#position">position</a></td>
    <td><a href="./docs/settings.md#respectdisabledreadonly">respectDisabledReadOnly</a></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><a href="./docs/customizations.md#startday">startDay</a></td>
    <td></td>
    <td></td>
  </tr>
  </tbody>
</table>
