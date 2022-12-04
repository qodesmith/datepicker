import {datepickersMap} from './constants'
import throwError from './throwError'

export default function checkForExistingPicker(el: HTMLElement): void {
  if (datepickersMap.has(el)) {
    throwError('A datepicker already exists on that element.')
  }
}
