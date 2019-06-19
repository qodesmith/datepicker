window.start = undefined
window.end = undefined
window.nope = undefined

document.addEventListener('DOMContentLoaded', () => {
  window.start = datepicker('.start', {
    id: 1,
    alwaysShow: 1,
    minDate: new Date(),
    dateSelected: new Date(),
    showAllDates: 1,
    onSelect: (instance, date) => {
      instance.setMin(date)
    },
    onShow: () => {
      console.log('SHOWN')
    }
  })

  window.end = datepicker('.end', {
    id: 1,
    // alwaysShow: 1,
    onSelect: (instance, date) => {
      instance.setMax(date)
    }
  })

  window.nope = datepicker('.nope', {
    alwaysShow: 1,
    showAllDates: 1
  })
})
