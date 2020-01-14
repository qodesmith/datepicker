window.start = undefined
window.end = undefined
window.nope = undefined


document.addEventListener('DOMContentLoaded', () => {
  window.range = document.querySelector('input[type=range]')
  window.range.addEventListener('input', e => {
    const num = e.target.value / 10
    const el = document.querySelector('.qs-datepicker-container')
    el.style.setProperty('font-size', `${num}em`)
  })

  window.start = datepicker('.start', {
    id: 1,
    events: [
      new Date(2019, 10, 1),
      new Date(2019, 10, 10),
      new Date(2019, 10, 20),
    ],
    onHide: () => console.log('START HIDDEN')
  })

  window.end = datepicker('.end', {
    id: 1,
    onHide: () => console.log('END HIDDEN')
  })

  //----------------------------------------

  window.nope = datepicker('.nope', {
    position: 'tr',
    events: [
      new Date(2019, 10, 1),
      new Date(2019, 10, 10),
      new Date(2019, 10, 20),
      new Date(2019, 9, 31)
    ],
    onHide: () => console.log('NOPE HIDDEN')
  })

  window.dp = datepicker('#dp')

  document.querySelector('button').addEventListener('click', e => {
    e.stopPropagation() // Without this, the `oneHandler` event listener that Datepicker uses will kick in and hide the calendar.
    const isHidden = nope.calendarContainer.classList.contains('qs-hidden')
    nope[isHidden ? 'show' : 'hide']()
  })
})
