import type {
  RangeSelector,
  DaterangePickerInstancePair,
  DaterangePickerOptions,
} from './types'
import {datepicker} from './datepicker'
import {throwError} from './utils'

export function rangepicker(
  rangeSelector: RangeSelector,
  options?: DaterangePickerOptions | DaterangePickerOptions[]
): DaterangePickerInstancePair {
  const id = uuid()
  const [optionsStart, optionsEnd]: [
    DaterangePickerOptions,
    DaterangePickerOptions
  ] = (() => {
    if (Array.isArray(options)) {
      return [
        {...options[0], id},
        {...options[1], id},
      ]
    }

    const opts = {...options, id}
    return [opts, opts]
  })()

  if (Array.isArray(rangeSelector)) {
    if (rangeSelector.length !== 2) {
      throwError('A rangepicker selector array needs to have a length of 2')
    }

    const pickerStart = datepicker(rangeSelector[0], optionsStart)
    const pickerEnd = datepicker(rangeSelector[1], optionsEnd)

    // TODO - Why is `as DaterangePickerInstancePair` needed to satisfy TypeScript? It *should* work  without it.
    return [pickerStart, pickerEnd] as DaterangePickerInstancePair
  }

  // TODO - Why is `as DaterangePickerInstancePair` needed to satisfy TypeScript? It *should* work  without it.
  return [
    datepicker(rangeSelector, optionsStart),
    datepicker(rangeSelector, optionsEnd),
  ] as DaterangePickerInstancePair
}

// http://bit.ly/2Xmuwqf - micro UUID!
function uuid(a?: number): string {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : // @ts-expect-error
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}
