# Datepicker Instance

Each instance of Datepicker has methods to allow you to programmatically control
the calendar. There are also a number of helpful properties for convenience.

## remove

This method removes the calendar from the DOM and optionally takes a callback
function as its only argument.

### Type Declaration

```typescript
remove(cb?: () => void): void
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
removePair(cb?: () => void): void
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
