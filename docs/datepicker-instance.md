# Datepicker Instance

Each instance of Datepicker has methods to allow you to programmatically control
the calendar. There are also a number of helpful properties for convenience.

## remove

This method removes the calendar from the DOM and optionally takes a callback
function as its only argument.

### Type Declaration

```typescript
remove(callback()?: void): void
```

### Example

```javascript
const picker = datepicker(selector)

// With no callback.
picker.remove()

// Using a callback.
picker.remove(() => console.log('Picker has been removed!'))
```

## removePair

_Only available on daterange picker instances._

This method removes both calendars from the DOM that are associated with the two
pickers in a daterange. It optionally takes a callback function as its only
argument. You can call `removePair` on either picker instance.

### Type Declaration

```typescript
removePair(callback()?: void): void
```

### Example

```javascript
const pickerStart = datepicker(selector1, {id: 1})
const pickerEnd = datepicker(selector2, {id: 1})

// Call the method on either instance, it doesn't matter.
pickerStart.removePair()

// Using a callback.
pickerStart.removePair(() => console.log('Both pickers have been removed!'))
```

## navigate

Programmatically navigate the calendar to the date you provide. This doesn't
select a date, it simply changes the displayed calendar to a different month.

### Type Declaration

```typescript
navigate(date: Date): void
```

### Example

```javascript
// The calendar will be rendered at January 2023.
const picker = datepicker(selector, {startDate: new Date(2023, 0)})

// Now the calendar will be rendered at February 2024.
picker.navigate(new Date(2024, 1))
```

## selectDate

Allows you to programmatically select or unselect a date on the calendar. Pass
a JS date as the first argument to select a date. If that date is a different
month/year from the current month/year, you can navigate to the new date by
passing `true` as the 2nd argument. To _unselect_ a date, simply call the method
with no arguments.

### Type Declaration

```typescript
selectDate(date?: Date, changeCalendar? boolean): void
```

### Example

```javascript
const picker = datepicker(selector, {startDate: new Date(2023, 0)})

// January 15th, 2023 will be selected.
picker.selectDate(new Date(2023, 0, 15))

// The calendar will navigate to the month of the selected date - February 2023.
picker.selectDate(new Date(2023, 1, 1), true)

// Select a date outside of the currently display month/year without navigating.
picker.selectDate(new Date(2023, 2, 20))

// Unselect the date.
picker.selectDate()
```
