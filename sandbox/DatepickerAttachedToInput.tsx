import {DatepickerOptions} from '../src/types'
import DatepickerImperativeControls from './DatepickerImperativeControls'
import {useDatepicker} from './useDatepicker'

export default function DatepickerAttachedToInput() {
  const options: DatepickerOptions = {
    position: 'bl',
  }
  const [jsx, picker] = useDatepicker({
    pickerKey: 'DatepickerAttachedToInput',
    type: 'input',
    options,
  })

  return (
    <section>
      <h3>
        Datepicker attached to an <code>&lt;input&gt;</code>
      </h3>
      <DatepickerImperativeControls picker={picker} options={options} />

      {/* Datepicker is attached to this div. */}
      {jsx}
    </section>
  )
}
