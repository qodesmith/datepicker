window.start = undefined
window.end = undefined
window.nope = undefined

document.addEventListener('DOMContentLoaded', () => {
  start = datepicker('.start', {
    id: 1,
    alwaysShow: 1,
    minDate: new Date(),
    dateSelected: new Date(),
    onSelect: (instance, date) => {
      instance.setMin(date)
    }
  })

  end = datepicker('.end', {
    id: 1,
    alwaysShow: 1,
    onSelect: (instance, date) => {
      instance.setMax(date)
    }
  })

  nope = datepicker('.nope', {
    alwaysShow: 1
  })

})
