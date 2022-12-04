import type {
  DatepickerInstance,
  DatepickerOptions,
  DatepickersMapItem,
  DaterangePickerInstance,
  DaterangePickerOptions,
  Selector,
} from './types'

import getSelectorData from './getSelectorData'

const datepickersMap = new Map<
  DatepickerInstance | DaterangePickerInstance,
  DatepickersMapItem
>()

datepickersMap.set

export default function datepicker(
  selector: Selector,
  options?: DatepickerOptions | DaterangePickerOptions
) /*DatepickerInstance | DaterangePickerInstance*/ {
  const {el, shadowDom, customElement} = getSelectorData(selector)
}
