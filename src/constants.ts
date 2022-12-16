import {InternalPickerData, Sides} from './types'

export const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const months = [
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
] as const

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
export function noop() {}

/**
 * This map will contain all the created datepickers that haven't been removed.
 * It maps the datepicker element (not the calendar HTML, but the DOM element
 * that the calendar is initialized with) to the internal picker item.
 */
export const datepickersMap = new Map<HTMLElement, InternalPickerData>()
