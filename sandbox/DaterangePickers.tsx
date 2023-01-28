import {useDaterangePicker} from './useDatepicker'
import './daterangePickers.scss'

export default function DaterangePickers() {
  const options = {id: 'range', alwaysShow: true}
  const [jsx1, picker1] = useDaterangePicker({
    pickerKey: 'DaterangePickers1',
    type: 'div',
    options,
  })
  const [jsx2, picker2] = useDaterangePicker({
    pickerKey: 'DaterangePickers2',
    type: 'div',
    options,
  })

  // window.x = picker1
  // window.y = picker2

  return (
    <section className="daterange-pickers-section">
      <h3>
        Date<em>range</em> Pickers attached to <code>&lt;div&gt;'s</code>
      </h3>
      <div className="daterange-pickers-container">
        {jsx1}
        {jsx2}
      </div>
    </section>
  )
}
