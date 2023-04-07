<!-- TODO - capture how these settings affect range pickers. -->

# Settings

- [alwaysShow](#alwaysshow)
- [events](#events)
- [exemptIds](#exepmtids)
- [maxDate](#maxdate)
- [minDate](#mindate)
- [selectedDate](#selecteddate)
- [showAllDates](#showalldates)
- [showAllDatesClickable](#showalldatesclickable)
- [startDate](#startdate)
- [respectDisabledReadOnly](#respectdisabledreadonly)

Use these options to set the calendar the way you want.

## alwaysShow

By default, the datepicker will hide & show itself automatically depending on
where you click or focus on the page. If you want the calendar to always be on
the screen, use this option.

### Type Declaration

```typescript
{
  alwaysShow?: boolean
}
```

**Default value:** `false`

### Example

```javascript
const picker = datepicker(selector, {alwaysShow: true})
```

## events

An array of dates which indicate something is happening - a meeting, birthday,
etc. I.e. an _event_. A blue dot will be down on the calendar for dates
containing an event.

### Type Declaration

```typescript
{
  events?: Date[]
}
```

**Default value:** `[]`

### Example

```javascript
const picker = datepicker(selector, {
  events: [
    new Date(2023, 10, 1),
    new Date(2023, 10, 10),
    new Date(2023, 10, 20),
  ],
})
```

## exemptIds

Since datepicker calendars automatically hide when a click is registered outside
the calendar, this option makes it possible to indicate which elements on the
page are "exempt" from causing the calendar to close.

This option takes an array of strings which correspond to an element's
`data-exempt-id` value. Simply give any element on the page a `data-exempt-id`
value, add that value to the `exemptIds` array for a given picker, and clicking
those elements will not cause the calendar to close.

A good example of using this option would be when you want to use buttons to
imperatively control the calendar via its
[various methods](./datepicker-instance.md). See the example below with the
[show](./datepicker-instance.md#show) and [hide](./datepicker-instance.md#hide)
methods.

### Type Declaration

```typescript
{
  exemptIds?: string[]
}
```

**Default value:** `[]`

### Example

Assuming some basic HTML on the page:

```html
<button id="show" data-exempt-id="calendar-show">👀 Show</button>
<button id="hide" data-exempt-id="calendar-hide">🙈 Hide</button>
```

Then we have this corresponding vanilla JavaScript:

```javascript
// Instantiate the picker.
const picker = datepicker(selector, {
  exemptIds: ['calendar-show', 'calendar-hide'],
})

// Add click event listeners to the 2 buttons to show/hide the calendar.
document.querySelector('#show').addEventListener('click', () => {
  picker.show()
})
document.querySelector('#hide').addEventListener('click', () => {
  picker.hide()
})
```

## maxDate

This will be the maximum threshold of selectable dates. Anything after it will
be unselectable.

### Type Declaration

```typescript
{
  maxDate?: Date
}
```

**Default value:** `undefined`

### Example

```javascript
const picker = datepicker(selector, {maxDate: new Date(2023, 3, 3)})
```

## minDate

This will be the minimum threshold of selectable dates. Anything before it will
be unselectable.

### Type Declaration

```typescript
{
  minDate?: Date
}
```

**Default value:** `undefined`

### Example

```javascript
const picker = datepicker(selector, {minDate: new Date(2023, 0, 1)})
```

## selectedDate

This will start the calendar with a date already selected. If Datepicker is used
with an `<input>` element, that field will be populated with this date as well.

### Type Declaration

```typescript
{
  selectedDate?: Date
}
```

**Default value:** `undefined`

### Example

```typescript
const picker = datepicker(selector, {selectedDate: new Date(2023, 3, 3)})
```

## showAllDates

By default, the datepicker will not put date numbers on calendar days that fall
outside the current month. They will be empty squares. Sometimes you want to see
those preceding and trailing days. This is the option for you.

_NOTE: these squares, by default, are not clickable, meaning you can't click
them to select that date. See the
[showAllDatesClickable](#showalldatesclickable) option below._

### Type Declaration

```typescript
{
  showAllDates?: boolean
}
```

**Default value:** `false`

### Example

```javascript
const picker = datepicker(selector, {showAllDates: true})
```

## showAllDatesClickable

Makes dates outside the current month (shown with [showAllDates](#showalldates))
clickable - and therefore selectable!

_NOTE: this option will have no effect unless [showAllDates](#showalldates) is
set to `true`._

### Type Declaration

```typescript
{
  showAllDatesClickable?: boolean
}
```

**Default value:** `false`

### Example

```javascript
const picker = datepicker(selector, {
  showAllDates: true, // This is needed for showAllDatesClickable to take effect.
  showAllDatesClickable: true,
})
```

## startDate

The date you provide will determine the month & year the calendar starts on.

### Type Declaration

```typescript
{
  startDate?: Date
}
```

**Default value:** `new Date()` (i.e. today's date)

### Example

```javascript
const picker = datepicker(selector, {startDate: new Date(2023, 3)})
```

## respectDisabledReadOnly

`<input />`'s can have a `disabled` or `readonly` attribute applied to them.
Native date inputs (`<input type="date" />`) with `disabled` or `readonly`
attributes will not show the HTML calendar associated with them.

Similarly, if you use one of these two attributes with a regular input
(`<input type="text" readonly />`), datepicker will show the calendar, but it
will prevent you from selecting a date or changing the input's initial value.

Set this option to `true` if that's what you want. The datepicker calendar will
still be functional in that you can change months and enter a year, but dates
will not be selectable (or deselectable).

### Type Declaration

```typescript
{
  respectDisabledReadOnly?: boolean
}
```

**Default value:** `false`

### Example

Example HTML:

```html
<input type="text" readonly />
```

Corresponding JavaScript:

```javascript
const picker = datepicker(selector, {respectDisabledReadOnly: true})
```
