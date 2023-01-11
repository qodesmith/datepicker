import {useOldDatepicker} from './useOldDatepicker'

export default function DaterangePickersOLD() {
  const options = {id: 'range', alwaysShow: true}
  const [jsx1, picker1] = useOldDatepicker({
    pickerKey: 'DaterangePickers1',
    type: 'div',
    className: 'old-range-1',
    options,
  })
  const [jsx2, picker2] = useOldDatepicker({
    pickerKey: 'DaterangePickers2',
    type: 'div',
    className: 'old-range-2',
    options,
  })

  return (
    <section className="daterange-pickers-section">
      <h3>
        Old Date<em>range</em> Pickers attached to <code>&lt;div&gt;'s</code>
      </h3>
      <div className="daterange-pickers-old-container">
        {jsx1}
        {jsx2}
      </div>
    </section>
  )
}
