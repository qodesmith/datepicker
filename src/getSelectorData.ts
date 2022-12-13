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
  const parentElement = element.parentElement

  checkForExistingPickerOnElement(element)

  /**
   * There are only 2 possible root (top-level) nodes supported:
   *   * document
   *   * a shadow DOM
   */
  if (rootNodeType === 'HTMLDocument') {
    // Elements not in a shadow DOM should always have a parent.
    if (!parentElement) {
      throwError('No parent to selector found.')
    }

    const calculatedPosition = getComputedStyle(parentElement).position
    const originalStyle = parentElement.getAttribute('style')
    const originalPositionStyle = originalStyle ? calculatedPosition : null
    if (calculatedPosition === '' || calculatedPosition === 'static') {
      parentElement.style.setProperty('position', 'relative')
    }

    return {
      el: element,
      elementForPositioning: parentElement,
      calculatedPosition,
      originalPositionStyle,
      shadowDom: null,
      customElement: null,
    }
  }

  if (rootNodeType === 'ShadowRoot') {
    const customElement = (rootNode as ShadowRoot).host as HTMLElement
    const elementForPositioning = element.parentElement ?? customElement
    const calculatedPosition = getComputedStyle(elementForPositioning).position
    const originalStyle = elementForPositioning.getAttribute('style')
    const originalPositionStyle = originalStyle ? calculatedPosition : null

    if (calculatedPosition === '' || calculatedPosition === 'static') {
      elementForPositioning.style.setProperty('position', 'relative')
    }

    /**
     * In the case of the selector being a direct child of the shadow DOM, we
     * won't be able to apply css positioning styles to the parent which would
     * be the shadow DOM itself. Rather, we move one step further up the chain
     * and apply those styles to the custom element rendered in the DOM.
     */
    return {
      el: element,
      elementForPositioning,
      calculatedPosition,
      originalPositionStyle,
      shadowDom: rootNode as ShadowRoot,
      customElement,
    }
  }

  // We should never get here.
  throwError(`Invalid root node found for selector: ${rootNodeType}`)
}
