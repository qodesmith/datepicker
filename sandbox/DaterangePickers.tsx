import {useEffect, useRef, useState} from 'react'
import {rangepicker} from '../src/rangepicker'
import './daterangePickers.scss'
import {DaterangePickerOptions, DaterangePickerInstancePair} from '../src/types'

export default function DaterangePickersManual() {
  const inputRef1 = useRef<HTMLInputElement>(null)
  const inputRef2 = useRef<HTMLInputElement>(null)

  const [[picker1, picker2], setRangePair] = useState<
    DaterangePickerInstancePair | []
  >([])

  useEffect(() => {
    if (inputRef1.current && inputRef2.current) {
      const options: DaterangePickerOptions = {
        alwaysShow: true,
        onMonthChange({triggerType, newDate, instance}) {
          if (triggerType !== 'user') return
          const {isFirst} = instance
        },
      }

      const rangePair = rangepicker(
        [inputRef1.current, inputRef2.current],
        [
          {
            ...options,
            position: 'br',
            // onMonthChange(onMonthChangeOptions) {
            //   console.log(
            //     onMonthChangeOptions.triggerType,
            //     rangePair[0].isFirst
            //   )
            //   if (onMonthChangeOptions.triggerType !== 'user') return
            //   rangePair[1].navigate(onMonthChangeOptions.newDate)
            // },
          },
          {
            ...options,
            position: 'bl',
            // onMonthChange(onMonthChangeOptions) {
            //   console.log(onMonthChangeOptions.triggerType, performance.now())
            //   if (onMonthChangeOptions.triggerType !== 'user') return
            //   rangePair[0].navigate(onMonthChangeOptions.newDate)
            // },
          },
        ]
      )

      setRangePair(rangePair)

      return () => {
        // Calling this on either instance in the pair would work.
        rangePair[0].removePair()
      }
    }
  }, [])

  return (
    <section className="daterange-pickers-section">
      <h3>Daterange Pickers</h3>
      <div className="daterange-pickers-container">
        <input type="text" ref={inputRef1} />
        <input type="text" ref={inputRef2} />
      </div>
    </section>
  )
}
