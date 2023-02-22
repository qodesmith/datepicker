import {useMemo} from 'react'
import {useDatepicker} from './useDatepicker'

export default function DatepickerWhatever() {
  const [jsx, picker] = useDatepicker({
    pickerKey: 'DatepickerWhatever',
    type: 'div',
    selector: '#world',
    options: {alwaysShow: true},
  })

  return (
    <section>
      <h3>Datepicker Whatever</h3>

      {/* Use this div to test string selectors with datepicker. */}
      <div
        className="hello"
        id="world"
        dangerouslySetInnerHTML={useMemo(() => ({__html: ''}), [])}
      />

      {jsx}
    </section>
  )
}
