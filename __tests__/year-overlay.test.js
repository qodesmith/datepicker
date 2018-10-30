const datepicker = require('../datepicker')

describe('Year Overlay', () => {
  let picker = undefined

  beforeEach(() => {
    document.body.innerHTML = '<input type="text" id="input1" />'
    picker = datepicker('#input1')
  })

  // afterEach(picker.remove)

  it('should show the year overlay when the month / year is clicked', () => {})

  it('should only allow numbers to be typed into the input field', () => {})

  it('should only allow a max of 4 digits to be typed into the input field', () => {})

  it('should submit when pressing enter or clicking the submit button', () => {})

  it('should only enable submission when there are 4 digits entered in the input field', () => {})
})
