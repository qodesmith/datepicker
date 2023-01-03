# Callback Options

## onSelect

Callback function after a date has been selected. It will receive the previous and newly selected dates. If `newDate` is `undefined`, that means the calendar date has been de-selected.

```typescript
onSelect({
  prevDate: Date | undefined
  newDate: Date | undefined
}): void
```

**Default value:** `undefined`

**Example**:

```typescript
const picker = datepicker(selector, {
  onSelect({prevDate, nextDate}) {
    if (!nextDate) {
      // The date is being deselected.
    }

    if (nextDate) {
      // The date is being selected.
    }
  },
})
```
