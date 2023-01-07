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
