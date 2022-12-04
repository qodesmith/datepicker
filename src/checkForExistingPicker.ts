import {datepickersMap} from './constants'
import throwError from './throwError'

/**
 * Checks if a picker already exists on a given element. If so, it throws.
 */
export default function checkForExistingPicker(el: HTMLElement): void {
  if (datepickersMap.has(el)) {
    throwError('A datepicker already exists on that element.')
  }
}
