import {DatepickerOptions} from '../src/types'
import DatepickerImperativeControls from './DatepickerImperativeControls'
import {useDatepicker} from './useDatepicker'
import useSliderValuesCheckbox from './useSliderValuesCheckbox'
import './datepickerAttachedToInput.scss'

export default function DatepickerAttachedToInput() {
  const exemptId = 'DatepickerAttachedToInput'
  const options: DatepickerOptions = {
    position: 'bl',
    minDate: new Date(),
    exemptIds: [exemptId],
  }
  const [jsx, picker] = useDatepicker({
    pickerKey: 'DatepickerAttachedToInput',
    type: 'input',
    options,
  })
  const checkbox = useSliderValuesCheckbox(picker, exemptId)

  return (
    <section>
      {checkbox}
      <h3>
        Datepicker attached to an <code>&lt;input&gt;</code>
      </h3>
      <DatepickerImperativeControls picker={picker} options={options} />

      <div className="dual-input-container">
        {/* Datepicker is attached to div in `jsx`. */}
        {jsx}
        <div>
          <input type="date" placeholder="nothing attached..." />
          <input type="text" placeholder="nothing attached..." />
        </div>
      </div>
    </section>
  )
}
