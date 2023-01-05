import {InternalPickerData, Sides} from './types'

/**
 * `t`, `r`, `b`, and `l` are all positioned relatively to the input the calendar is attached to.
 * `c` fixes the calendar smack in the middle of the screen. Useful for mobile devices.
 */
export const sides: Sides = {
  //
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left',
  c: 'c',
} as const

/**
 * The default callback functions (onSelect, etc.) will be a noop function. Using this variable so we can simply reference the same function. Also, this allows us to check if the callback is a noop function by doing a `=== noop` anywhere we like.
 */
// TODO - do we actually need this noop?
export function noop() {}

/**
 * This map will contain all the created datepickers that haven't been removed.
 * It maps the datepicker element (not the calendar HTML, but the DOM element
 * that the calendar is initialized with) to a set of internal picker items. We
 * use a set because multiple datepickers can be attached to the same element
 * except in case of inputs. Inputs have a 1:1 relationship with datepickers.
 */
export const datepickersMap = new Map<HTMLElement, Set<InternalPickerData>>()

export const overlayContainerCls = 'dp-overlay-container'

export const overlayShownCls = 'dp-overlay-shown'

export const defaultOptions = {
  defaultView: 'calendar',
  overlayPlaceholder: 'Enter a year',
  overlayButtonText: 'Submit',
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
} as const

export const globalListenerData = {attached: false}

export const imperativeMethods = [
  'selectDate',
  'setMin',
  'setMax',
  'navigate',
  'show',
  'hide',
] as const

export const userEvents = ['click', 'focusin', 'keydown', 'input'] as const
