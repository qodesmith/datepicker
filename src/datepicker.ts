import type {
  DatepickerInstance,
  DatepickerOptions,
  DaterangePickerInstance,
  DaterangePickerOptions,
  Selector,
} from './types'

import getSelectorEl from './getSelectorEl'

export default function datepicker(
  selector: Selector,
  options: DatepickerOptions | DaterangePickerOptions
): DatepickerInstance | DaterangePickerInstance {
  const el = getSelectorEl(selector)
}
