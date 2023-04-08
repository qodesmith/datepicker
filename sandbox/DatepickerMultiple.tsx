import './datepickerMultiple.scss'

import {useCallback, useEffect, useRef, useState} from 'react'
import type {DatepickerInstance, DatepickerOptions} from '../src/types'
import {datepicker} from '../src/datepicker'

const options: DatepickerOptions = {alwaysShow: true}
const inputOptions: DatepickerOptions = {...options, position: 'bl'}

export default function DatepickerMultiple() {
  const divRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [picker1, setPicker1] = useState<DatepickerInstance>()
  const [picker2, setPicker2] = useState<DatepickerInstance>()
  const [picker3, setPicker3] = useState<DatepickerInstance>()

  useEffect(() => {
    const div = divRef.current
    const input = inputRef.current

    if (div && input) {
      const divPicker1 = datepicker(div, options)
      const divPicker2 = datepicker(div, options)
      setPicker1(divPicker1)
      setPicker2(divPicker2)

      const inputPicker1 = datepicker(input, inputOptions)
      setPicker3(inputPicker1)

      return () => {
        divPicker1?.remove()
        divPicker2?.remove()
        inputPicker1?.remove()
      }
    }
  }, [divRef.current, inputRef.current])

  return (
    <section className="datepicker-multiple">
      <h3>Datepicker Multiple</h3>
      <div className="container">
        <div className="datepicker-multiple-selector-target" ref={divRef} />
        <div>
          <input type="text" ref={inputRef} />
        </div>
      </div>
    </section>
  )
}
