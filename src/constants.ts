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

export function noop() {}

export function defaultFormatter(date: Date): string {
  return date.toDateString()
}

/**
 * This map will contain all the created datepickers that haven't been removed.
 * It maps the datepicker element (not the calendar HTML, but the DOM element
 * that the calendar is initialized with) to a set of internal picker items. We
 * use a set because multiple datepickers can be attached to the same element
 * except in case of inputs. Inputs have a 1:1 relationship with datepickers.
 */
export const datepickersMap = new Map<HTMLElement, Set<InternalPickerData>>()

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

export const userEvents = ['click', 'keydown', 'input'] as const

export const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  // 'input', // We handle this specifically.
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
] as const
