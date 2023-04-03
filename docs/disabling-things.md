# Disabling Things

- [disableYearOverlay](./docs/disabling-things.md#disableyearoverlay)
- [disabledDates](./docs/disabling-things.md#disableddates)
- [disabler](./docs/disabling-things.md#disabler)
- [noWeekends](./docs/disabling-things.md#noweekends)

These options are all associated with disabling various aspects of the calendar.

## disableYearOverlay

Clicking the year or month name on the calendar triggers an overlay to show,
allowing you to enter a year manually. If you want to disable this feature, set
this option to `true`.

### Type Declaration

```typescript
{
  disableYearOverlay?: boolean
}
```

**Default value:** `false`

### Example

```javascript
const picker = datepicker(selector, {disableYearOverlay: true})
```

## disabledDates

Provide an array of JS date objects that will be disabled on the calendar (i.e.
you can't select these dates). This array cannot include the same date as
[selectedDate](settings.md#selecteddate). If you need more control over which
dates are disabled, see the [disabler](#disabler) option.

### Type Declaration

```typescript
{
  disabledDates?: Date[]
}
```

**Default value:** `[]`

### Example

```javascript
const picker = datepicker(selector, {
  disabledDates: [
    new Date(), // "Today" is disabled - whatever that date may be.
    new Date(2023, 3, 1),
  ],
})
```

## disabler

Sometimes you need more control over which dates are disabled. The
[disabledDates](#disableddates) option is limited to an explicit array of dates
and the [noWeekends](#nowweekends) option is limited to Saturdays & Sundays.
Provide a function that takes a JavaScript date as it's only argument and
returns `true` if the date should be disabled. When the calendar renders, each
date will be run through this function to determine whether or not it should be
disabled.

### Type Declaration

```typescript
disabler?(date: Date): boolean
```

**Default value:** `undefined`

### Example

```javascript
// Disable every Tuesday on the calendar (for any given month).
const picker = datepicker(selector, {
  disabler: date => date.getDay() === 2,
})

// Disable every day in the month of October (for any given year).
const picker = datepicker(selector, {
  disabler: date => date.getMonth() === 9,
})

// Disable every Monday in 2023.
const picker = datepicker(selector, {
  disabler: date => date.getFullYear() === 2023 && date.getDay() === 1,
})
```

## noWeekends

Provide `true` to disable selecting weekends. Weekends are Saturday & Sunday.
If your weekends are a set of different days or you need more control over
disabled dates, use the [disabler](#disabler) option.

### Type Declaration

```typescript
{
  noWeekends?: boolean
}
```

**Default value:** `false`

### Example

```javascript
const picker = datepicker(selector, {noWeekends: true})
```
