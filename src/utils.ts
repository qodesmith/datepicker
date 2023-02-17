import {
  datepickersMap,
  defaultFormatter,
  defaultOptions,
  noop,
  overlayContainerCls,
} from './constants'
import {
  DatepickerOptions,
  DaterangePickerOptions,
  InternalPickerData,
  Position,
  SanitizedOptions,
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
export function getType(item: unknown): string {
  const type = {}.toString.call(item) as string
  return type.slice(8, -1)
}

export function throwError(message: string): never {
  throw new Error(message)
}

export function throwAlreadyRemovedError(): never {
  throwError("Unable to run a function from a picker that's already removed.")
}

function throwRangeProperyDifferenceError(
  property: keyof SanitizedOptions
): never {
  throwError(
    `"options.${property}" cannot have different values for range pickers.`
  )
}

function throwSelectedDateMinMaxError(
  type: 'minDate' | 'maxDate' | 'selectedDate'
): never {
  const lessOrMore = type === 'maxDate' ? 'more' : 'less'

  throwError(
    `"options.selectedDate" from the 1st calendar cannot be ${lessOrMore} than "options.${type}" from the 2nd calendar.`
  )
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
  position: Position,
  isInput: Boolean
) {
  const {selectorData, pickerElements} = internalPickerItem
  const {calendarContainer} = pickerElements

  if (isInput) {
    if (position === 'mc') {
      return calendarContainer.classList.add('dp-centered')
    }

    /**
     * Position the calendar absolutely, taking it out of the layout flow so we
     * can get accurate measurements of both the calendar itself and the input.
     *
     * For example, if the input field is rendered in a flexbox container, the
     * size of the calendar could alter the input field's size prior to us
     * taking measurements. Absolute positioning prior to measuring avoids this.
     */
    calendarContainer.style.setProperty('position', 'absolute')

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

    calendarContainer.style.setProperty('top', top)
    calendarContainer.style.setProperty('left', left)
  }
}

function px(val: number) {
  return `${val}px`
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
 * Returns an ordered array of InternalPickerData objects that are rangepickers
 * for a given id.
 */
export function getRangepickers(id: unknown): InternalPickerData[] {
  const rangepickers: InternalPickerData[] = []

  datepickersMap.forEach(pickerSet => {
    pickerSet.forEach(picker => {
      if ('id' in picker && Object.is(picker.id, id)) {
        /**
         * unshift - add to the beginning of the array
         * push - add to the end of the array
         */
        rangepickers[picker.isFirst ? 'unshift' : 'push'](picker)
      }
    })
  })

  return rangepickers
}

export function addPickerToMap(internalPickerItem: InternalPickerData): void {
  const {el} = internalPickerItem.selectorData
  const pickerSet = datepickersMap.get(el)

  if (pickerSet) {
    pickerSet.add(internalPickerItem)
  } else {
    datepickersMap.set(el, new Set([internalPickerItem]))
  }
}

export function removePickerFromMap(
  internalPickerItem: InternalPickerData
): void {
  const {el} = internalPickerItem.selectorData
  const pickerSet = datepickersMap.get(el)

  if (!pickerSet) return

  if (pickerSet.size === 1) {
    datepickersMap.delete(el)
  } else {
    pickerSet.delete(internalPickerItem)
  }
}

export function getIsInput(el: unknown): el is HTMLInputElement {
  return getType(el) === 'HTMLInputElement'
}

/**
 * Clicking a date on a range pair will always adjust the sibling calendar's
 * min/max date.
 */
export function adjustRangepickerMinMaxDates(
  picker: InternalPickerData,
  date: Date | undefined
): void {
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

/**
 * Runs a number of checks against various date values and throws errors if
 * there is a conflict. Does this for daterange pickers as well.
 */
export function sanitizeAndCheckAndSyncOptions(
  options: DatepickerOptions | DaterangePickerOptions | undefined
): SanitizedOptions {
  const selectedDate = options?.selectedDate
    ? stripTime(options?.selectedDate)
    : undefined
  let minDate = options?.minDate ? stripTime(options?.minDate) : undefined
  let maxDate = options?.maxDate ? stripTime(options?.maxDate) : undefined
  const dateToNum = (date: Date) => +stripTime(date)
  let disabledDates = new Set((options?.disabledDates ?? []).map(dateToNum))
  let events = new Set((options?.events ?? []).map(dateToNum))

  if (minDate && maxDate) {
    if (minDate > maxDate) {
      throwError('"options.minDate" cannot be greater than "options.maxDate"')
    }
    if (maxDate < minDate) {
      throwError('"options.maxDate" cannot be less than "options.minDate"')
    }
  }

  // Only check for conflicts here, not daterange scenarios.
  if (selectedDate) {
    if (minDate && selectedDate < minDate) {
      throwError('"options.selectedDate" cannot be less than "options.minDate"')
    }

    if (maxDate && selectedDate > maxDate) {
      throwError(
        '"options.selectedDate" cannot be greater than "options.maxDate"'
      )
    }

    if (disabledDates.has(+selectedDate)) {
      throwError(
        '"options.selectedDate" cannot be a date found in "options.disabledDates"'
      )
    }
  }

  // Daterange picker.
  let minMaxDates: SanitizedOptions['minMaxDates'] = null
  if (options && 'id' in options) {
    const {id} = options

    /**
     * If we get 2 values back here, we already have a range pair.
     * If we only get the 1st value back (picker1), that means we're currently
     * working on the 2nd picker which hasn't been added to the map yet.
     */
    const [picker1, picker2] = getRangepickers(id)

    if (id === undefined) {
      throwError('"options.id" cannot be assigned the value of undefined.')
    }

    if (picker2) {
      throwError(`There is already a set of rangepickers for this id: "${id}"`)
    }

    /**
     * All the single-calendar scenario's have been handled already. Option
     * values should not clash with eachother, so we can check that certain
     * values are equal to eachother for safety.
     */
    if (picker1) {
      if (areValuesPresentAndDifferent(minDate, picker1.minDate)) {
        throwRangeProperyDifferenceError('minDate')
      }

      if (areValuesPresentAndDifferent(maxDate, picker1.maxDate)) {
        throwRangeProperyDifferenceError('maxDate')
      }

      if (areValuesPresentAndDifferent(disabledDates, picker1.disabledDates)) {
        throwRangeProperyDifferenceError('disabledDates')
      }

      /**
       * At this point we need to sync disabledDates, events, minDate, & maxDate
       * if only 1 picker has them set. We've already handled potential clashes.
       */

      // Sync disabledDates if only 1 picker explicitly has set it.
      if (!picker1.disabledDates.size && disabledDates.size) {
        picker1.disabledDates = new Set(disabledDates)
      } else if (!disabledDates.size && picker1.disabledDates.size) {
        disabledDates = new Set(picker1.disabledDates)
      }

      // Sync events if only 1 picker explicitly has set it.
      if (!picker1.events.size && events.size) {
        picker1.events = new Set(events)
      } else if (!events.size && picker1.events.size) {
        events = new Set(picker1.events)
      }

      // Sync minDate if only 1 picker explicitly has set it.
      if (!picker1.minDate && minDate) {
        picker1.minDate = stripTime(minDate)
      } else if (!minDate && picker1.minDate) {
        minDate = stripTime(picker1.minDate)
      }

      // Sync maxDate if only 1 picker explicitly has set it.
      if (!picker1.maxDate && maxDate) {
        picker1.maxDate = stripTime(maxDate)
      } else if (!maxDate && picker1.maxDate) {
        maxDate = stripTime(picker1.maxDate)
      }

      if (picker1.selectedDate) {
        if (minDate && minDate > picker1.selectedDate) {
          throwSelectedDateMinMaxError('minDate')
        }

        if (maxDate && maxDate < picker1.selectedDate) {
          throwSelectedDateMinMaxError('maxDate')
        }

        // Both calendars have selected dates - a daterange is selected.
        if (selectedDate && selectedDate < picker1.selectedDate) {
          throwSelectedDateMinMaxError('selectedDate')
        }

        minMaxDates = {min: minDate, max: maxDate}
        minDate = picker1.selectedDate
      }

      if (selectedDate) {
        picker1.minMaxDates = {min: picker1.minDate, max: picker1.maxDate}
        picker1.maxDate = selectedDate
      }
    }
  }

  const defaultView = options?.defaultView ?? defaultOptions.defaultView

  return {
    ...options,
    selectedDate,
    minDate,
    maxDate,
    minMaxDates,
    disabledDates,
    events,
    startDate: stripTime(options?.startDate ?? new Date()),
    position: options?.position ?? 'tl',
    customDays: (options?.customDays ?? defaultOptions.days).slice(),
    months: options?.customMonths ?? defaultOptions.months,
    defaultView,
    isOverlayShowing: defaultView === 'overlay',
    overlayButton: options?.overlayButton ?? defaultOptions.overlayButtonText,
    overlayPlaceholder:
      options?.overlayPlaceholder ?? defaultOptions.overlayPlaceholder,
    // TODO - do we need to default these function values to noop?
    onShow: options?.onShow ?? noop,
    onHide: options?.onHide ?? noop,
    onMonthChange: options?.onMonthChange ?? noop,
    onSelect: options?.onSelect ?? noop,
    formatter: options?.formatter ?? defaultFormatter,
  }
}

function areValuesPresentAndDifferent<T>(
  val1: T | undefined,
  val2: T | undefined
): boolean {
  if (!val1 || !val2) return false

  if (val1 instanceof Date && val2 instanceof Date) {
    return +stripTime(val1) !== +stripTime(val2)
  }

  if (val1 instanceof Set && val2 instanceof Set) {
    const sameSize = val1.size === val2.size
    let hasSameItems = Array.from(val1.values()).some(val => !val2.has(val))

    if (!sameSize || (val1.size && val2.size && !hasSameItems)) {
      return true
    }
  }

  return false
}
