import {datepickersMap, overlayContainerCls} from './constants'
import {
  DatepickerInstance,
  InternalPickerData,
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
export function isDateWithinRange({
  date,
  minDate,
  maxDate,
}: IsDateWithinRangeInputType): boolean {
  const num = +stripTime(date)
  const min = minDate ? +stripTime(minDate) : -Infinity
  const max = maxDate ? +stripTime(maxDate) : Infinity

  return num > min && num < max
}

export function getSiblingDateForNavigate(
  isFirst: boolean | undefined,
  date: Date
): Date {
  return new Date(date.getFullYear(), date.getMonth() + (isFirst ? 1 : -1))
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

export function addEventListeners(
  internalPickerItem: InternalPickerData,
  publicPicker: DatepickerInstance
) {
  const {listenersMap, pickerElements} = internalPickerItem
  const {controls, overlay} = pickerElements
  const {
    overlayMonthsContainer,
    overlayClose,
    overlaySubmitButton,
    input: overlayInput,
  } = overlay

  // ARROWS
  const {leftArrow, rightArrow} = controls
  const arrowListener = (e: MouseEvent) => {
    const isLeft = (e.currentTarget as HTMLDivElement).classList.contains(
      'dp-arrow-left'
    )
    const {currentDate, navigate} = publicPicker
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (isLeft ? -1 : 1),
      1
    )

    navigate({date: newDate, triggerOnMonthChange: true})
  }
  leftArrow.addEventListener('click', arrowListener)
  rightArrow.addEventListener('click', arrowListener)
  listenersMap.set({type: 'click', el: leftArrow}, arrowListener)
  listenersMap.set({type: 'click', el: rightArrow}, arrowListener)

  // MONTH/YEAR
  const {monthYearContainer} = controls
  monthYearContainer.addEventListener('click', publicPicker.toggleOverlay)
  listenersMap.set(
    {type: 'click', el: monthYearContainer},
    publicPicker.toggleOverlay
  )

  // DAYS
  const {daysContainer} = pickerElements
  const daysContainerListener = (e: MouseEvent) => {
    const {target} = e
    const currentTarget = e.currentTarget as HTMLDivElement
    const {classList, textContent} = target as HTMLDivElement

    // Do nothing for clicks on empty or disabled days.
    if (currentTarget === e.target || classList.contains('dp-disabled-date')) {
      return
    }

    // Select / de-select a day.
    const dayNum = Number(textContent as string)
    if (classList.contains('dp-selected-date')) {
      // De-select.
      publicPicker.selectDate({triggerOnSelect: true})
    } else {
      // Select.
      const {currentDate} = publicPicker
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dayNum
      )

      publicPicker.selectDate({date, triggerOnSelect: true})
    }
  }
  daysContainer.addEventListener('click', daysContainerListener)
  listenersMap.set({type: 'click', el: daysContainer}, daysContainerListener)

  // OVERLAY MONTH
  const monthsContainerListener = (e: MouseEvent) => {
    const {isOverlayShowing} = internalPickerItem

    /*
      Disallow clicks while the overlay is closing, avoid clicks that aren't on
      the month.
    */
    if (!isOverlayShowing || e.target === e.currentTarget) {
      return
    }

    const monthNum = +((e.target as HTMLDivElement).dataset.num as string)
    const {currentDate} = publicPicker
    const currentMonth = currentDate.getMonth()

    // Only navigate if a different month has been clicked.
    if (monthNum !== currentMonth) {
      const date = new Date(currentDate.getFullYear(), monthNum, 1)
      publicPicker.navigate({date, triggerOnMonthChange: true})
    }

    // Close overlay.
    publicPicker.toggleOverlay()
  }
  overlayMonthsContainer.addEventListener('click', monthsContainerListener)
  listenersMap.set(
    {type: 'click', el: overlayMonthsContainer},
    monthsContainerListener
  )

  // OVERLAY CLOSE
  const overlayCloseListner = () => {
    if (internalPickerItem.isOverlayShowing) {
      publicPicker.toggleOverlay()
    }
  }
  overlayClose.addEventListener('click', overlayCloseListner)
  listenersMap.set({type: 'click', el: overlayClose}, overlayCloseListner)

  // OVERLAY SUBMIT
  const overlaySubmitListener = (e: MouseEvent) => {
    const {disabled} = e.currentTarget as HTMLButtonElement

    if (!disabled) {
      submitOverlayYear(internalPickerItem, publicPicker)
    }
  }
  overlaySubmitButton.addEventListener('click', overlaySubmitListener)
  listenersMap.set(
    {type: 'click', el: overlaySubmitButton},
    overlaySubmitListener
  )

  // OVERLAY INPUT
  const overlayInputOnInputListener = (e: InputEvent) => {
    const {overlaySubmitButton} = internalPickerItem.pickerElements.overlay
    const target = e.target as HTMLInputElement
    const {selectionStart} = target
    const newValue = target.value
      .split('')
      // Prevent leading 0's.
      .reduce((acc, char) => {
        if (!acc && char === '0') return ''
        return acc + (char.match(/[0-9]/) ? char : '')
      }, '')
      .slice(0, 4)

    target.value = newValue
    overlaySubmitButton.disabled = !newValue

    // https://stackoverflow.com/a/70549192/2525633 - maintain cursor position.
    target.setSelectionRange(selectionStart, selectionStart)
  }
  const overlayInputKeydownListener = (e: KeyboardEvent) => {
    // Fun fact: 275760 is the largest year for a JavaScript date. #TrialAndError
    // Also this - https://bit.ly/3Q5BsEF
    if (e.key === 'Enter') {
      submitOverlayYear(internalPickerItem, publicPicker)
    } else if (e.key === 'Escape') {
      publicPicker.toggleOverlay()
    }
  }
  // @ts-ignore - the event type *is* InputEvent - https://mzl.la/3jmtjzb
  overlayInput.addEventListener('input', overlayInputOnInputListener)
  overlayInput.addEventListener('keydown', overlayInputKeydownListener)
  listenersMap.set(
    {type: 'input', el: overlayInput},
    overlayInputOnInputListener
  )
  listenersMap.set(
    {type: 'keydown', el: overlayInput},
    overlayInputKeydownListener
  )
}

function submitOverlayYear(
  internalPickerItem: InternalPickerData,
  publicPicker: DatepickerInstance
) {
  const {overlay} = internalPickerItem.pickerElements
  const overlayInput = overlay.input
  const {currentDate} = publicPicker

  if (!overlayInput.value) {
    return
  }

  const year = Number(overlayInput.value)

  // If the same year is entered, simply close the overlay.
  if (year !== currentDate.getFullYear()) {
    const newDate = new Date(year, currentDate.getMonth(), 1)
    publicPicker.navigate({date: newDate, triggerOnMonthChange: true})
  }

  publicPicker.toggleOverlay()
}

export function removeEventListeners(internalPickerItem: InternalPickerData) {
  const {listenersMap} = internalPickerItem
  listenersMap.forEach((listener, {type, el}) => {
    el.removeEventListener(type, listener)
  })
}
