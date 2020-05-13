'use strict'

/*
  The Cypress tests will instantiate and remove the datepicker instances we wish to test.
  Here we're simply making the datepicker library available to Cypress via a global variable.
*/
window.dp = datepicker

window.x = null
window.y = null

window.go = function() {
  const inputs = document.querySelectorAll('input')
  x = dp(inputs[0], { id: 1, alwaysShow: 1, onMonthChange: instance => console.log('NOW SHOWING:', new Date(instance.currentYear, instance.currentMonth).toLocaleDateString()) })
  y = dp(inputs[1], { id: 1, alwaysShow: 1 })
}
