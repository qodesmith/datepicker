import {useDatepicker} from './useDatepicker'

export default function DatepickerWhatever() {
  const [jsx, picker] = useDatepicker({
    pickerKey: 'DatepickerWhatever',
    type: 'div',
    options: {},
  })

  return (
    <section>
      <h3>Datepicker Whatever</h3>
      {jsx}
    </section>
  )
}
