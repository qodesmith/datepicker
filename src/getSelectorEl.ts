import getType from './getType'
import throwError from './throwError'
import {Selector} from './types'

export default function getEl(selector: Selector): HTMLElement {
  if (typeof selector === 'string') {
    const el = document.querySelector(selector)

    if (el === null) {
      throwError(`No element found for selector "${selector}".`)
    }

    return el as HTMLElement
  }

  if (getType(selector).includes('Element')) {
    return selector
  }

  throwError('The selector provided is not a valid HTML element.')
}
