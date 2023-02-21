import {createElement, useRef, useEffect, useCallback, useMemo} from 'react'
import {
  DatepickerInstance,
  DatepickerOptions,
  DaterangePickerInstance,
  DaterangePickerOptions,
} from '../src/types'
import datepicker from '../src/datepicker'
import {useRecoilState, useResetRecoilState} from 'recoil'
import {datepickerAtomFamily} from './state'

type UseDatepickerProps = {
  pickerKey: string
  type: string
  options?: DatepickerOptions | DaterangePickerOptions
}

export function useDatepicker({
  pickerKey,
  type,
  options,
}: UseDatepickerProps): [JSX.Element, DatepickerInstance | null] {
  // Using Recoil in case we want access to the picker anywhere else in the app.
  const [picker, setPicker] = useRecoilState(datepickerAtomFamily(pickerKey))

  // https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs
  const refFn = useCallback((domNode: HTMLElement | null) => {
    setPicker(datepicker(domNode, options ?? {}))
  }, [])
  const element = useMemo(() => {
    return createElement(type, {
      ...(type === 'div' ? {dangerouslySetInnerHTML: {__html: ''}} : {}),
      ref: refFn,
    })
  }, [])

  return [element, picker as DatepickerInstance | null]
}

type UseDaterangePickerProps = {
  pickerKey: string
  type: string
  options: DaterangePickerOptions
}

export function useDaterangePicker({
  pickerKey,
  type,
  options,
}: UseDaterangePickerProps): [JSX.Element, DaterangePickerInstance | null] {
  if (!('id' in options)) {
    throw new Error('No id found for daterange picker.')
  }

  const [element, picker] = useDatepicker({pickerKey, type, options})
  return [element, picker as DaterangePickerInstance | null]
}
