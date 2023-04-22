import {DatepickerOptions, DaterangePickerOptions} from '../types'
import {Expand} from './expand'
import {PrivatePicker} from './privatePicker'

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
