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

| Callbacks                                          | Customizations                                                      | Settings                                                              | Disabling Things                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [onHide](./docs/callbacks.md#onhide)               | [customDays](./docs/customizations.md#customdays)                   | [alwaysShow](./docs/settings.md#alwaysshow)                           | [disableYearOverlay](./docs/disabling-things.md#disableyearoverlay) |
| [onMonthChange](./docs/callbacks.md#onmonthchange) | [customMonths](./docs/customizations.md#custommonths)               | [events](./docs/settings.md#events)                                   | [disabledDates](./docs/disabling-things.md#disableddates)           |
| [onSelect](./docs/callbacks.md#onselect)           | [customOverlayMonths](./docs/customizations.md#customoverlaymonths) | [exemptIds](./docs/settings.md#exepmtids)                             | [disabler](./docs/disabling-things.md#disabler)                     |
| [onShow](./docs/callbacks.md#onshow)               | [defaultView](./docs/customizations.md#defaultview)                 | [maxDate](./docs/settings.md#maxdate)                                 | [noWeekends](./docs/disabling-things.md#noweekends)                 |
|                                                    | [formatter](./docs/callbacks.md#formatter)                          | [minDate](./docs/settings.md#mindate)                                 |                                                                     |
|                                                    | [overlayButtonText](./docs/callbacks.md#overlaybuttontext)          | [selectedDate](./docs/settings.md#selecteddate)                       |                                                                     |
|                                                    | [overplayPlaceholder](./docs/callbacks.md#overlayplaceholder)       | [showAllDates](./docs/settings.md#showalldates)                       |                                                                     |
|                                                    | [position](./docs/callbacks.md#position)                            | [showAllDatesClickable](./docs/settings.md#showalldatesclickable)     |                                                                     |
|                                                    | [startDay](./docs/callbacks.md#startday)                            | [startDate](./docs/settings.md#startdate)                             |                                                                     |
|                                                    |                                                                     | [respectDisabledReadOnly](./docs/settings.md#respectdisabledreadonly) |
