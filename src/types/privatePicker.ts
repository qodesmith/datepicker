import type {
  DatepickerInstance,
  DatepickerOptions,
  DaterangePickerInstance,
} from '../types'
import type {PickerElements} from '../utilsCreateCalendar'
import type {Expand} from './expand'
import type {SanitizedOptions, ViewType} from './options'
import type {SelectorData} from './selectorData'
import type {CallbackData, UserEvent} from './callbackData'

/*
  TODO - how do we strongly type this? 
  (e: HTMLElementEventMap[keyof HTMLElementEventMap]) => void doesn't work.

  Inspiration from `addEventListener`:
  HTMLElement.addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined
  ): void (+1 overload)
*/
export type ListenersMapValue = (e: any) => void
export type ListenersMapKey = {type: keyof HTMLElementEventMap; el: HTMLElement}

// TODO - remove properties not needed.
export type PrivatePicker = {
  /**
   * All the existing DOM elements associated with the calendar.
   */
  selectorData: SelectorData

  // TODO - Should we have a PrivateRangePicker item to house this instead?
  /**
   * This property will only be present on rangepickers.
   */
  id?: unknown

  /**
   * Represents DOM elements with the attribute `data-exempt-id`. Any DOM
   * element with this attribute that matches one of the ids in this set will
   * not cause the picker to close if clicked on. This is helpful in setting
   * up buttons that trigger the picker's methods. For example, clicking those
   * buttons should not cause the calendar to hide.
   */
  exemptIds: Set<string>

  /**
   * All the DOM elements created for the calendar.
   */
  pickerElements: PickerElements

  /**
   * Either the default months or those provided by the user.
   */
  months: readonly string[]

  /**
   * This date drives rendering the calendar. Only the month and year are used.
   */
  currentDate: Date

  // TODO - how many of these types should come from DatepickerOptions?
  selectedDate: Date | undefined
  disabledDates: Set<number>
  minDate: Date | undefined
  maxDate: Date | undefined
  minMaxDates: null | {min: Date | undefined; max: Date | undefined}
  noWeekends: boolean
  events: Set<number>
  startDay: number // Start day of the week.
  disableYearOverlay: DatepickerOptions['disableYearOverlay']
  alwaysShow: boolean
  showAllDates: DatepickerOptions['showAllDates'] // Shows a date in every square rendered on the calendar (preceding and trailing month days).
  showAllDatesClickable: DatepickerOptions['showAllDatesClickable']
  respectDisabledReadOnly: DatepickerOptions['respectDisabledReadOnly'] // Prevents Datepicker from selecting dates when attached to inputs that are `disabled` or `readonly`.

  publicPicker: DatepickerInstance | DaterangePickerInstance // The object returned to the user.
  isFirst?: boolean // Indicates this is the 1st instance in a daterange pair.
  sibling?: PrivatePicker // Just a reference to the other internal object in the daterange pair.

  _navigate(
    data: Expand<
      {
        date: Date
        trigger: 'navigate' | UserEvent
      } & Pick<CallbackData, 'triggerType'>
    >
  ): void
  _selectDate(
    data: Expand<
      {
        date?: Date
        changeCalendar?: boolean
        trigger: 'selectDate' | UserEvent
      } & Pick<CallbackData, 'triggerType'>
    >
  ): void
  _setMinOrMax(
    isFirstRun: boolean,
    minOrMax: 'min' | 'max',
    data: Expand<
      {
        date?: Date
        trigger: 'setMin' | 'setMax' | UserEvent
      } & Pick<CallbackData, 'triggerType'>
    >
  ): void
  _show(
    data: Expand<Omit<CallbackData, 'instance'> & {trigger: 'show' | UserEvent}>
  ): void
  _hide(
    data: Expand<Omit<CallbackData, 'instance'> & {trigger: 'hide' | UserEvent}>
  ): void
  _getRange(): {start: Date | undefined; end: Date | undefined}
  formatDay: SanitizedOptions['formatDay']
  formatYear: SanitizedOptions['formatYear']
  unformatYear: SanitizedOptions['unformatYear']
  disabler: SanitizedOptions['disabler']

  isCalendarShowing: boolean
  isOverlayShowing: boolean
  defaultView: ViewType
  listenersMap: Map<Expand<ListenersMapKey>, Expand<ListenersMapValue>>
}
