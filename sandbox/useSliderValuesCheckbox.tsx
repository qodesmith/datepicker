import {useRecoilValue} from 'recoil'
import {DatepickerInstance, DaterangePickerInstance} from '../src/types'
import {sliderAtomFamily} from './state'
import {initialSliderValues} from './state'
import {useCallback, useLayoutEffect, useState} from 'react'

export default function useSliderValuesCheckbox(
  picker: DatepickerInstance | DaterangePickerInstance | null,
  exemptId?: string
) {
  const [isChecked, setIsChecked] = useState(false)
  const fontSize = useRecoilValue(sliderAtomFamily(initialSliderValues[0]))
  const dpSize = useRecoilValue(sliderAtomFamily(initialSliderValues[1]))
  const dpWidth = useRecoilValue(sliderAtomFamily(initialSliderValues[2]))

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked)
    },
    []
  )

  useLayoutEffect(() => {
    if (isChecked) {
      picker?.calendarContainer.parentElement?.style.setProperty(
        'font-size',
        `${fontSize}em`
      )
      picker?.calendarContainer.style.setProperty('--dp-size', `${dpSize}em`)
      picker?.calendarContainer.style.setProperty('--dp-width', `${dpWidth}em`)
    }
  }, [fontSize, dpSize, dpWidth, isChecked])

  useLayoutEffect(() => {
    if (!isChecked) {
      picker?.calendarContainer.parentElement?.style.setProperty(
        'font-size',
        `${initialSliderValues[0].initialValue}em`
      )
      picker?.calendarContainer.style.setProperty(
        '--dp-size',
        `${initialSliderValues[1].initialValue}em`
      )
      picker?.calendarContainer.style.setProperty(
        '--dp-width',
        `${initialSliderValues[2].initialValue}em`
      )
    }
  }, [isChecked])

  const jsx = (
    <div className="checkbox-container">
      <span className="checkbox-text">check to apply slider styles</span>
      <input
        type="checkbox"
        onChange={handleOnChange}
        data-exempt-id={exemptId}
      />
    </div>
  )

  return jsx
}
