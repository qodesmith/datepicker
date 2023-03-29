# Customizations

These options help you customize the calendar to your suit your needs. Some of these are especially helpful if you're using a language other than English.

## formatter

If you're using an input field with your datepicker, this function allows you to customize the format of the input's value. Datepicker will use the return value of this function to set the input value.

### Type Declaration

```typescript
// Regular datepicker.
formatter({date: Date, instance: DatepickerInstance}): string

// Daterange picker.
formatter({date: Date, instance: DaterangePickerInstance}): string
```

**Default value:** `undefined`

_NOTE: The default input value will be `date.toDateString()`._

### Example

```javascript
const picker = datepicker(selector, {
  formatter(date) {
    return date.toLocaleDateString()
  },
})
```

## position

The position of the calendar relative to its associated input field. This option will have **no effect** if the picker isn't associated with an input field.

The `mc` option is special in that it will center the calendar in the middle of the screen. This can be useful for mobile devices.

### Type Declaration

```typescript
type Position = 'tl' | 'tr' | 'bl' | 'br' | 'mc'
```

**Default value:** `'tl'`

| Value  | Description   |
| ------ | ------------- |
| `'tl'` | top left      |
| `'tr'` | top right     |
| `'bl'` | bottom left   |
| `'br'` | bottom right  |
| `'mc'` | mobile center |

<!-- TODO - add some screenshots -->

## startDay

Specify the day of the week your calendar starts on. 0 = Sunday, 1 = Monday,
etc. Plays nice with the [customDays](#customdays) option.

### Type Declaration

```typescript
{
  startDay?: number // Should be 0 - 6
}
```

**Default value:** `0` (Sunday sdtarts the week)

| Value | Day       |
| ----- | --------- |
| 0     | Sunday    |
| 1     | Monday    |
| 2     | Tuesday   |
| 3     | Wednesday |
| 4     | Thursday  |
| 5     | Friday    |
| 6     | Saturday  |

### Example

```javascript
// Start the week on Tuesday.
const picker = datepicker(selector, {startDay: 2})
```
