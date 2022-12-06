import {datepickersMap} from './constants'
import throwError from './throwError'

/**
 * Checks if a picker already exists on a given element. If so, it throws.
 */
export function checkForExistingPickerOnElement(el: HTMLElement): void {
  if (datepickersMap.has(el)) {
    throwError('A datepicker already exists on that element.')
  }
}

/**
 * Throws an error if a set of rangepickers already exists for a given id.
 */
export function checkForExistingRangepickerPair(id: any): void {
  let rangepickersFound = 0

  datepickersMap.forEach(picker => {
    if (picker.type === 'rangepicker' && picker.id === id) {
      rangepickersFound++
    }
  })

  if (rangepickersFound > 1) {
    throwError(`There is already a set of rangepickers for this id: "${id}"`)
  }
}
