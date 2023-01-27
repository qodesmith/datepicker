import {datepickersMap, overlayContainerCls} from './constants'
import {
  InternalPickerData,
  Position,
  Selector,
  SelectorData,
  ViewType,
} from './types'

/**
 * Returns the type of an item.
 * Examples:
 *    * [object HTMLElement] => HTMLElement
 *    * [object Object] => Object
 *    * [object Array] => Array
 */
export function getType(item: any): string {
  const type = {}.toString.call(item) as string
  return type.slice(8, -1)
}

export function throwError(message: string): never {
  throw new Error(message)
}

export function getSelectorData(selector: Selector): SelectorData {
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

  // Inputs are the only elements that can't have multiple datepickers.
  // TODO - remove/adjust this once allowing multiple pickers per same element.
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

/**
 * For datepickers associated with an input, this function positions the picker relative to that input.
 *
 * https://stackoverflow.com/q/8628005/2525633
 * This should run AFTER the calendar is rendered to the DOM! Otherwise, you'll get 'auto' as a value for height.
 */
export function positionCalendar(
  internalPickerItem: InternalPickerData,
  position: Position
) {
  const {selectorData, pickerElements} = internalPickerItem
  const {calendarContainer} = pickerElements
  const isInput = getIsInput(selectorData.el)

  if (isInput) {
    if (position === 'mc') {
      return calendarContainer.classList.add('dp-centered')
    }

    const [calendarWidth, calendarHeight] = (() => {
      const {width, height} = getComputedStyle(calendarContainer)

      // '250px' => 250
      return [width, height].map(v => +v.slice(0, -2))
    })()
    const {top: parentTop, left: parentLeft} =
      selectorData.elementForPositioning.getBoundingClientRect()
    const {
      top: inputTop,
      left: inputLeft,
      width: inputWidth,
      height: inputHeight,
    } = selectorData.el.getBoundingClientRect()
    const relativeTop = inputTop - parentTop
    const relativeLeft = inputLeft - parentLeft
    const [vertical, horizontal] = position.split('')
    const top =
      vertical === 't'
        ? px(relativeTop - calendarHeight) // 't'
        : px(relativeTop + inputHeight) // 'b'
    const left =
      horizontal === 'l'
        ? px(relativeLeft) // 'l'
        : px(relativeLeft + inputWidth - calendarWidth) // 'r'

    calendarContainer.style.setProperty('position', 'absolute')
    calendarContainer.style.setProperty('top', top)
    calendarContainer.style.setProperty('left', left)
  }
}

function px(val: number) {
  return `${val}px`
}

export function getDaysInMonth(date: Date): number {
  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return newDate.getDate()
}

export function hasMonthChanged(prevDate: Date, newDate: Date): boolean {
  const prevYear = prevDate.getFullYear()
  const prevMonth = prevDate.getMonth()
  const newYear = newDate.getFullYear()
  const newMonth = newDate.getMonth()

  if (prevYear !== newYear) return true
  return prevMonth !== newMonth
}

export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

type IsDateWithinRangeInputType = {
  date: Date
  minDate: Date | undefined
  maxDate: Date | undefined
}

/**
 * Inclusive of `minDate` and `maxDate`.
 */
export function isDateWithinRange({
  date,
  minDate,
  maxDate,
}: IsDateWithinRangeInputType): boolean {
  const num = +stripTime(date)
  const min = minDate ? +stripTime(minDate) : -Infinity
  const max = maxDate ? +stripTime(maxDate) : Infinity

  return num >= min && num <= max
}

type GetOverlayClassInputType = {
  action: 'initialize' | 'calendarOpen' | 'overlayToggle'
  defaultView: ViewType
  isOverlayShowing?: InternalPickerData['isOverlayShowing']
}
export function getOverlayClassName({
  action,
  defaultView,
  isOverlayShowing,
}: GetOverlayClassInputType): string {
  const isOverlayDefaultView = defaultView === 'overlay'
  let otherCls = ''

  switch (action) {
    case 'initialize':
    case 'calendarOpen':
      otherCls = `dp-overlay-${isOverlayDefaultView ? 'shown' : 'hidden'}`
      break
    case 'overlayToggle':
      otherCls = `dp-overlay-${isOverlayShowing ? 'out' : 'in'}`
      break
  }

  return `${overlayContainerCls} ${otherCls}`.trim()
}

export function getOffsetNumber(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 1
}

/**
 * Checks if a picker already exists on a given element. If so, it throws.
 */
function checkForExistingPickerOnElement(el: HTMLElement): void {
  const isInput = getIsInput(el)

  if (isInput && datepickersMap.has(el)) {
    throwError('A datepicker already exists on that element.')
  }
}

/**
 * Throws an error if a set of rangepickers already exists for a given id.
 * This should be called before the picker has been added to the datepickersMap.
 */
export function checkForExistingRangepickerPair(id: any): void {
  if (getRangepickers(id).length > 1) {
    throwError(`There is already a set of rangepickers for this id: "${id}"`)
  }
}

/**
 * Checks if this is the 1st picker in a rangepicker pair.
 * This should be called before the picker has been added to the datepickersMap.
 */
export function getIsFirstRangepicker(id: any): boolean {
  return getRangepickers(id).length === 0
}

/**
 * Returns an array of InternalPickerData objects that are rangepickers for a
 * given id.
 */
export function getRangepickers(id: any): InternalPickerData[] {
  const rangepickers: InternalPickerData[] = []

  datepickersMap.forEach(pickerSet => {
    pickerSet.forEach(picker => {
      if ('id' in picker && Object.is(picker.id, id)) {
        rangepickers.push(picker)
      }
    })
  })

  return rangepickers
}

export function addPickerToMap(
  el: HTMLElement,
  internalPickerItem: InternalPickerData
): void {
  const pickerSet = datepickersMap.get(el)

  if (pickerSet) {
    pickerSet.add(internalPickerItem)
  } else {
    datepickersMap.set(el, new Set([internalPickerItem]))
  }
}

export function removePickerFromMap(
  el: HTMLElement,
  internalPickerItem: InternalPickerData
): void {
  const pickerSet = datepickersMap.get(el)

  if (!pickerSet) return

  if (pickerSet.size === 1) {
    datepickersMap.delete(el)
  } else {
    pickerSet.delete(internalPickerItem)
  }
}

export function getIsInput(el: any): boolean {
  return getType(el) === 'HTMLInputElement'
}

type AdjustMinMxDatesInputType = {
  picker: InternalPickerData
  date: Date | undefined
}

/**
 * Clicking a date on a range pair will always adjust the sibling calendar's
 * min/max date.
 */
export function adjustMinMaxDates({
  picker,
  date,
}: AdjustMinMxDatesInputType): void {
  if (!picker.sibling) return

  const {isFirst, sibling} = picker

  if (date) {
    /**
     * Avoid setting minMaxDates more than once, which can happen if you have
     * selected dates on both calendars and are just changing the selected date
     * from one day to another.
     */
    if (!sibling.minMaxDates) {
      sibling.minMaxDates = {min: sibling.minDate, max: sibling.maxDate}
    }

    sibling[isFirst ? 'minDate' : 'maxDate'] = date
  } else {
    // Restore the other picker's min/max.
    sibling.minDate = sibling.minMaxDates?.min
    sibling.maxDate = sibling.minMaxDates?.max
    sibling.minMaxDates = null
  }
}
