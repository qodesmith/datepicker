import {createElement, useRef, useEffect, ReactNode} from 'react'
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
  selector?: string
  options?: DatepickerOptions | DaterangePickerOptions
}

export function useDatepicker({
  pickerKey,
  type,
  selector,
  options = {},
}: UseDatepickerProps): [ReactNode, DatepickerInstance | null] {
  const ref = useRef(null)
  const reactNode = selector
    ? null
    : createElement(type, {
        ...(type === 'div' ? {dangerouslySetInnerHTML: {__html: ''}} : {}),
        ref,
      })

  // Using Recoil in case we want access to the picker anywhere else in the app.
  const [picker, setPicker] = useRecoilState(datepickerAtomFamily(pickerKey))
  const resetPicker = useResetRecoilState(datepickerAtomFamily(pickerKey))

  useEffect(() => {
    const picker = datepicker(selector ?? ref.current, options)
    setPicker(picker)

    return () => {
      picker?.remove()
      resetPicker()
    }
  }, [])

  return [reactNode, picker as DatepickerInstance | null]
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
}: UseDaterangePickerProps): [ReactNode, DaterangePickerInstance | null] {
  if (!('id' in options)) {
    throw new Error('No id found for daterange picker.')
  }

  const [element, picker] = useDatepicker({pickerKey, type, options})
  return [element, picker as DaterangePickerInstance | null]
}
