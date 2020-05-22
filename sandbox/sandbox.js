import datepicker from '../src/datepicker'
import './sandbox.css'

// Enable us to play with datepicker in the console.
window.datepicker = datepicker

window.test = () => {
  const picker = datepicker('[data-cy="single-datepicker-input"]', {
    alwaysShow: 1,
    showAllDates: 1,
  })
}
