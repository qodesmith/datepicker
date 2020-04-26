/*
  The Cypress tests will instantiate and remove the datepicker instances we wish to test.
  Here we're simply making the datepicker library available to Cypress via a global variable.
*/
window.dp = datepicker

window.go = function() {
  const inputs = document.querySelectorAll('input')
  x = dp(inputs[0], {
    id: 1,
    alwaysShow: 1,
    showAllDates: 1,
    disabledDates: [new Date(2020, 3, 22), new Date('3/29/2020'), new Date('4/2/2020')],
    events: [new Date('3/29/2020'), new Date('4/10/2020'), new Date('4/22/2020')],
  })

  y = dp(inputs[1], {
    id: 1,
    alwaysShow: 1,
    disabledDates: [new Date('3/29/2020')],
    events: [new Date('3/29/2020'), new Date('4/22/2020')],
  })
}

go()
