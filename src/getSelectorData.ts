import {checkForExistingPickerOnElement} from './checkForExistingPicker'
import getType from './getType'
import throwError from './throwError'
import {Selector, SelectorData} from './types'

export default function getSelectorData(selector: Selector): SelectorData {
  let element: HTMLElement | null = null
  const type = getType(selector)

  // Find the element via the provided string selector.
  if (typeof selector === 'string') {
    /**
     * In the case that the selector is an id beginning with a number
     * (e.x. #123), querySelector will fail. That's why we need to check and
     * conditionally use `getElementById`. Also, datepicker doesn't support
     * string selectors when using a shadow DOM, hence why we use `document`.
     */
    const el =
      selector[0] === '#'
        ? document.getElementById(selector.slice(1))
        : document.querySelector<HTMLElement>(selector)

    if (el === null) {
      throwError(`No element found for selector "${selector}".`)
    }

    element = el
  }

  // Here, the user has already passed in an HTML element.
  if (type.endsWith('Element')) {
    element = selector as HTMLElement
  }

  if (type === 'ShadowRoot') {
    throwError('Using a shadow DOM as your selector is not supported.')
  }

  if (!element) {
    throwError(`The selector provided is not a valid HTML element: ${type}`)
  }

  const rootNode = element.getRootNode()
  const rootNodeType = getType(rootNode)
  const parent = element.parentElement

  /**
   * There are only 2 possible root nodes supported:
   *   * document
   *   * a shadow DOM
   */
  if (rootNodeType === 'HTMLDocument') {
    checkForExistingPickerOnElement(element)

    if (!parent) {
      throwError('No parent to selector found.')
    }

    return {el: element, parent, shadowDom: null, customElement: null}
  }

  if (rootNodeType === 'ShadowRoot') {
    checkForExistingPickerOnElement(element)
    return {
      el: element,
      parent: parent || (rootNode as ShadowRoot),
      shadowDom: rootNode as ShadowRoot,
      customElement: (rootNode as ShadowRoot).host,
    }
  }

  throwError(`Invalid root node found for selector: ${rootNodeType}`)
}
