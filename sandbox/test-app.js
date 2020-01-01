/*
  The Cypress tests will instantiate and remove the datepicker instances we wish to test.
  Here we're simply making the datepicker library available to Cypress via a global variable.
*/
window.dp = datepicker
