import {useRecoilState} from 'recoil'
import oldDatepicker from '../src/old-datepicker'
import {oldDatepickerAtom} from './state'
import {useEffect, useRef} from 'react'

export default function DatepickerOLDAttachedToInput() {
  const [picker, setPicker] = useRecoilState(oldDatepickerAtom)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const pickerInstance = oldDatepicker(inputRef.current!)
    setPicker(pickerInstance)

    return () => {
      setPicker(null)
      pickerInstance.remove()
    }
  }, [])

  return (
    <section>
      <h3>
        Old Datepicker attached to an <code>&lt;input&gt;</code>
      </h3>
      <input type="text" ref={inputRef} />
    </section>
  )
}
