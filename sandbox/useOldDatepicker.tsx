import {createElement, useEffect, useRef} from 'react'
import {useRecoilState, useResetRecoilState} from 'recoil'
import {oldDatepickerAtomFamily} from './state'
import datepicker from '../src/old-datepicker'

type UseOldDatepickerProps = {
  pickerKey: string
  type: 'div' | 'input'
  options?: Record<string, unknown>
  className?: string
}

export function useOldDatepicker({
  pickerKey,
  type,
  options,
  className,
}: UseOldDatepickerProps): [JSX.Element, ReturnType<typeof datepicker> | null] {
  const ref = useRef()
  const element = createElement(type, {
    ref,
    className,
    ...(type === 'div' ? {dangerouslySetInnerHTML: {__html: ''}} : {}),
  })

  // Using Recoil in case we want access to the picker anywhere else in the app.
  const [picker, setPicker] = useRecoilState(oldDatepickerAtomFamily(pickerKey))
  const resetPicker = useResetRecoilState(oldDatepickerAtomFamily(pickerKey))

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

  return [element, picker]
}
