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

  const type = getType(selector)

  if (type.includes('Element')) {
    return selector
  }

  if (type === 'ShadowRoot') {
    throwError('Using a shadow DOM as your selector is not supported.')
  }

  throwError('The selector provided is not a valid HTML element.')
}
