<!-- TODO - add images to examples where applicable. -->
<!-- TODO - add TOC linking to all options below. -->

# Customizations

- [customDays](./docs/customizations.md#customdays)
- [customMonths](./docs/customizations.md#custommonths)
- [customOverlayMonths](./docs/customizations.md#customoverlaymonths)
- [defaultView](./docs/customizations.md#defaultview)
- [formatter](./docs/callbacks.md#formatter)
- [overlayButtonText](./docs/callbacks.md#overlaybuttontext)
- [overplayPlaceholder](./docs/callbacks.md#overlayplaceholder)
- [position](./docs/callbacks.md#position)
- [startDay](./docs/callbacks.md#startday)

These options help you customize the calendar to your suit your needs. Some of
these are especially helpful if you're using a language other than English.

## customDays

You can customize the display of days on the calendar by providing an array of 7
values. This can be used with the [startDay](#startday) option if your week
starts on a day other than Sunday.

### Type Declaration

```typescript
{
  customDays?: string[] // Must be an array of 7 strings
}
```

**Default value:** `['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']`

### Example

```javascript
const picker = datepicker(selector, {
  customDays: ['天', '一', '二', '三', '四', '五', '六'],
})
```

## customMonths

You can customize the display of the month name at the top of the calendar by
providing an array of 12 strings.

_NOTE: if you provide `customMonths` but not [customOverlayMonths](#customoverlaymonths),
the 1st 3 characters of each value in `customMonths` will be used for the
overlay months._

### Type declaration

```typescript
{
  customMonths?: string[] // Must be an array of 12 strings
}
```

**Default value:** `['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']`

### Example

```javascript
const picker = datepicker(selector, {
  customMonths: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
})
```

## customOverlayMonths

You can customize the display of the month names in the overlay view by
providing an array of 12 strings.

_NOTE: Long values will affect the overlay UI layout._

### Type declaration

```typescript
{
  customOverlayMonths?: string[] // Must be an array of 12 strings
}
```

**Default value:**

| [customMonths](custommonths) | Default value                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| yes                          | The 1st 3 characters of each value in [customMonths](custommonths)                     |
| no                           | `['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']` |

### Example

<!-- prettier-ignore-start -->
```javascript
const picker = datepicker(selector, {
  customOverlayMonths: ['😀', '😂', '😎', '😍', '🤩', '😜', '😬', '😳', '🤪', '🤓 ', '😝', '😮']
})
```
<!-- prettier-ignore-end -->

## defaultView

There are 2 views associateed with datepicker:

- `'calendar'` - the default view, showing a calendar.
- `'overlay'` - the view showing the month picker and year input.

With this option, you can set which view is shown by default.

### Type declaration

```typescript
{
  defaultView: 'calendar' | 'overlay'
}
```

**Default value:** `'calendar'`

### Example

```javascript
const picker = datepicker(selector, {defaultView: 'overlay'})
```

## formatter

If you're using an input field with your datepicker, this function allows you to
customize the format of the input's value. Datepicker will use the return value
of this function to set the input value.

### Type Declaration

```typescript
// Regular datepicker.
formatter({date: Date, instance: DatepickerInstance}): string

// Daterange picker.
formatter({date: Date, instance: DaterangePickerInstance}): string
```

**Default value:** `({date}) => date.toDateString()`

### Example

```javascript
const picker = datepicker(selector, {
  formatter(date) {
    return date.toLocaleDateString()
  },
})
```

## overlayButtonText

Custom text for the year overlay submit button.

### Type Declaration

```typescript
{
  overlayButtonText?: string
}
```

**Default value:** `'Submit'`

### Example

```javascript
const picker = datepicker(selector, {overlayButtonText: '¡Vamanos!'})
```

## overlayPlaceholder

Custom placeholder text for the year overlay.

### Type Declaration

```typescript
{
  overlayPlaceholder?: string
}
```

**Default value:** `'Enter a year'`

### Example

```javascript
const picker = datepicker(selector, {overlayPlaceholder: 'Entrar un año'})
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

## startDay

Specify the day of the week your calendar starts on. 0 = Sunday, 1 = Monday,
etc. Plays nice with the [customDays](#customdays) option.

### Type Declaration

```typescript
{
  startDay?: number // Should be 0 - 6
}
```

**Default value:** `0` (Sunday starts the week)

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
