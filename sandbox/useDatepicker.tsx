import {createElement, useRef, useEffect} from 'react'
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
  type: 'div' | 'input'
  options?: DatepickerOptions | DaterangePickerOptions
}

export function useDatepicker({
  pickerKey,
  type,
  options,
}: UseDatepickerProps): [JSX.Element, DatepickerInstance | null] {
  const ref = useRef()
  const element = createElement(type, {
    ref,
    ...(type === 'div' ? {dangerouslySetInnerHTML: {__html: ''}} : {}),
  })

  // Using Recoil in case we want access to the picker anywhere else in the app.
  const [picker, setPicker] = useRecoilState(datepickerAtomFamily(pickerKey))
  const resetPicker = useResetRecoilState(datepickerAtomFamily(pickerKey))

  useEffect(() => {
    const pickerInstance = datepicker(ref.current!, options ?? {})
    setPicker(pickerInstance)

    return () => {
      // Native picker remove function.
      pickerInstance.remove()

      // Remove the picker atom from the atomFamily.
      resetPicker()
    }
  }, [])

  return [element, picker as DatepickerInstance | null]
}

type UseDaterangePickerProps = {
  pickerKey: string
  type: 'div' | 'input'
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
