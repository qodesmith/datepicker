import {DatepickerOptions, DaterangePickerOptions} from '../types'
import {Expand} from './expand'
import {PrivatePicker} from './privatePicker'

/**
 * The position of the calendar relative to its associated input field. This option will have no effect if the picker isn't associated with an input field.
 * The `mc` option is special in that it will center the calendar in the middle of the screen. This can be useful for mobile devices.
 *
 * `tl` - top left
 * `tr` - top right
 * `bl` - bottom left
 * `br` - bottom right
 * `mc` - mobile centered (centered in the middle of the screen for mobile devices)
 */
export type Position = 'tl' | 'tr' | 'bl' | 'br' | 'mc'
export type ViewType = 'calendar' | 'overlay'

export type SanitizedOptions = Expand<
  (
    | Omit<
        DatepickerOptions,
        'disabledDates' | 'events' | 'exemptIds' | 'customDays'
      >
    | Omit<
        DaterangePickerOptions,
        'disabledDates' | 'events' | 'exemptIds' | 'customDays'
      >
  ) & {
    disabledDates: PrivatePicker['disabledDates']
    events: PrivatePicker['events']
    exemptIds: PrivatePicker['exemptIds']
    startDate: Date
    customDays: readonly string[]
    months: readonly string[]
    overlayMonths: readonly string[]
    isOverlayShowing: boolean
    minMaxDates: PrivatePicker['minMaxDates']
  } & Required<
      Omit<
        Pick<
          DatepickerOptions,
          | 'noWeekends'
          | 'position'
          | 'onShow'
          | 'onHide'
          | 'onMonthChange'
          | 'onSelect'
          | 'formatDay'
          | 'formatYear'
          | 'unformatYear'
          | 'formatInputValue'
          | 'defaultView'
          | 'overlayButtonText'
          | 'overlayPlaceholder'
          | 'startDay'
          | 'disabler'
        >,
        // Prevent 'alwaysShow' from being included in the required props above.
        'alwaysShow'
      >
    >
>
