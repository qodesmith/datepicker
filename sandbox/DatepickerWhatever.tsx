import {useMemo} from 'react'
import {useDatepicker} from './useDatepicker'

export default function DatepickerWhatever() {
  const [jsx1, picker1] = useDatepicker({
    pickerKey: 'DatepickerWhatever1',
    type: 'div',
    selector: '#world',
    options: {
      alwaysShow: true,
      showAllDates: true,
      showAllDatesClickable: true,
      formatDay(num) {
        if (num === 1) return '!'
        return num.toString()
      },
      formatYear(year) {
        return year.toString().split('').reverse().join('')
      },
      unformatYear(formattedYear) {
        return +formattedYear.split('').reverse().join('')
      },
    },
  })
  // const [jsx2, picker2] = useDatepicker({
  //   pickerKey: 'DatepickerWhatever2',
  //   type: 'div',
  //   selector: '#world',
  //   options: {alwaysShow: true, selectedDate: new Date()},
  // })

  return (
    <section>
      <h3>Datepicker Whatever</h3>
      {/* Use this div to test string selectors with datepicker. */}
      <div
        className="hello"
        id="world"
        dangerouslySetInnerHTML={useMemo(() => ({__html: ''}), [])}
      />
      {jsx1}
      {/* {jsx2} */}
    </section>
  )
}
