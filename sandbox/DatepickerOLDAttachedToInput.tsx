import {useOldDatepicker} from './useOldDatepicker'

export default function DatepickerOLDAttachedToInput() {
  const [jsx, picker] = useOldDatepicker({
    pickerKey: 'DatepickerOLDAttachedToInput',
    type: 'div',
  })

  return (
    <section>
      <h3>
        Old Datepicker attached to an <code>&lt;input&gt;</code>
      </h3>
      {jsx}
    </section>
  )
}
