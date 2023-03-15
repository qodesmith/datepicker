import {DatepickerOptions} from '../src/types'
import DatepickerImperativeControls from './DatepickerImperativeControls'
import {useDatepicker} from './useDatepicker'
import useSliderValuesCheckbox from './useSliderValuesCheckbox'
import './datepickerAttachedToInput.scss'

export default function DatepickerAttachedToInput() {
  const exemptId = 'DatepickerAttachedToInput1'
  const options: DatepickerOptions = {
    position: 'bl',
    exemptIds: [exemptId, 'row1-slider'],
    alwaysShow: true,
    noWeekends: true,
    showAllDates: true,
    showAllDatesClickable: true,
    startDay: 1,
    disableYearOverlay: true,
    defaultView: 'overlay',
  }
  const [jsx, picker] = useDatepicker({
    pickerKey: 'DatepickerAttachedToInput2',
    type: 'input',
    options,
  })
  const checkbox = useSliderValuesCheckbox(picker, exemptId)

  window.x = picker

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
