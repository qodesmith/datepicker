import {PickerElements} from './utilsCreateCalendar'
import {imperativeMethods, userEvents} from './constants'
import datepicker from './datepicker'

/**
 * TODO - ensure all types are being used. Remove export if not being consumed elsewhere.
 * TODO - make sure all class updates are classList.add/remove and not setting
 * the class name wholesale (except during creation) to avoid clashes
 * with the user potentially having set some class names themselves.
 */

type PrettyFxn<T> = T extends (...args: infer A) => infer R
  ? (...args: PrettifyNonRecursive<A>) => PrettifyNonRecursive<R>
  : never
export type PrettifyNonRecursive<T> = T extends Function
  ? PrettyFxn<T>
  : unknown extends T
  ? T
  : {
      [K in keyof T]: T[K]
    } & {}
export type Prettify<T> = T extends Function
  ? PrettyFxn<T>
  : T extends Date
  ? Date
  : unknown extends T
  ? T
  : {
      [K in keyof T]: Prettify<T[K]>
    } & {}

export type Datepicker = typeof datepicker
export type TriggerType = 'user' | 'imperative'
export type ImperativeMethod = typeof imperativeMethods[number]
export type UserEvent = typeof userEvents[number]
export type Trigger = ImperativeMethod | UserEvent
type CallbackData = {
  /**
   * The explicit source of what triggered the callback. This can be imperative methods, such as `selectDate` and `show` or user interactions with the DOM, such as `click`.
   */
  trigger: Trigger

  /**
   * The category source of what triggered the callback. `user` for user interactions with the DOM, such as `click`, or `imperative` for imperative methods, such as `selectDate` or `show`.
   */
  triggerType: TriggerType

  /**
   * Providing the datepicker instance as a convenience. This allows the user to avoid having to import the instance from wherever it was created.
   */
  instance: DatepickerInstance
}

export type DatepickerOptions = {
  /**
   * Callback function after a date has been selected. It will receive the previous and newly selected dates. If `newDate` is `undefined`, that means the calendar date has been de-selected.
   */
  onSelect?(
    onSelectOptions: CallbackData & {
      prevDate: Date | undefined
      newDate: Date | undefined
    }
  ): void

  /**
   * Callback function when the calendar is shown.
   */
  onShow?(data: CallbackData): void

  /**
   * Callback function when the calendar is hidden.
   */
  onHide?(data: CallbackData): void

  /**
   * Callback function when the month has changed.
   */
  onMonthChange?(
    onMonthChangeOptions: CallbackData & {prevDate: Date; newDate: Date}
  ): void

  /**
   * Using an input field with your datepicker? Want to customize its value
   * anytime a date is selected? Provide a function that returns a string to set
   * the input value with.
   *
   * NOTE: The formatter function will only run if the datepicker instance is associated with an <input> field.
   */
  formatter?(date: Date): string

  /**
   * If you would like to render the calendar inside the provided selector,
   * don't provide a value for this option. Providing a value for this option
   * positions the calendar relative to the <input> field (or other element)
   * it's associated with.
   * This can be 1 of 5 values: 'tr', 'tl', 'br', 'bl', 'mc' representing
   * top-right, top-left, bottom-right, bottom-left, and mobile-centered.
   * Datepicker will position itself accordingly relative to the element you
   * reference in the 1st argument. For a value of 'mc', Datepicker will
   * position itself fixed, smack in the middle of the screen.
   * This can be desirable for mobile devices.
   *
   * Default - undefined
   */
  position?: Position

  /**
   * Specify the day of the week your calendar starts on. 0 = Sunday,
   * 1 = Monday, etc. Plays nice with the `customDays` option.
   *
   * Default - 0
   */
  startDay?: number

  /**
   * You can customize the display of days on the calendar by providing an array
   * of 7 values. This can be used with the `startDay` option if your week
   * starts on a day other than Sunday.
   *
   * Default - ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
   */
  customDays?: string[]

  /**
   * You can customize the display of the month name at the top of the calendar
   * by providing an array of 12 strings. This will also affect the names of the
   * months in the overlay - they will be the firt 3 characters of the 12 values
   * provided here.
   *
   * Default - ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
   */
  customMonths?: string[]

  /**
   * You can customize the display of the month names in the overlay view by
   * providing an array of 12 strings. Keep in mind that if the values are too
   * long, it could produce undesired results in the UI.
   *
   * In the case that `customMonths` was provided, this value will *only* affect
   * the overlay month names.
   *
   * Default - The first 3 characters of each item in `customMonths`.
   */
  customOverlayMonths?: string[]

  /**
   * Want the overlay to be the default view when opening the calendar? This
   * property is for you. Simply set this property to 'overlay' and you're done.
   * This is helpful if you want a month picker to be front and center.
   *
   * Default - 'calendar'
   */
  defaultView?: ViewType

  /**
   * Custom text for the year overlay submit button.
   *
   * Default - 'Submit'
   */
  overlayButton?: string

  /**
   * Custom placeholder text for the year overlay.
   *
   * Default - '4-digit year'
   */
  overlayPlaceholder?: string

  /**
   * An array of dates which indicate something is happening - a meeting,
   * birthday, etc. I.e. an event.
   */
  events?: Date[]

  /**
   * By default, the datepicker will hide & show itself automatically depending
   * on where you click on the page. If you want the calendar to always be on
   * the screen, use this option.
   *
   * Default - false
   */
  alwaysShow?: boolean

  /**
   * This will start the calendar with a date already selected. If Datepicker is
   * used with an <input> element, that field will be populated with this date
   * as well.
   */
  selectedDate?: Date

  /**
   * This will be the maximum threshold of selectable dates. Anything after it
   * will be unselectable.
   *
   * NOTE: When using a daterange pair, if you set `maxDate` on the first
   * instance options it will be ignored on the 2nd instance options.
   */
  maxDate?: Date

  /**
   * This will be the minumum threshold of selectable dates. Anything prior will
   * be unselectable.
   *
   * NOTE: When using a daterange pair, if you set `minDate` on the first
   * instance options it will be ignored on the 2nd instance options.
   */
  minDate?: Date

  /**
   * The date you provide will determine the month that the calendar starts on.
   *
   * Default - today's month
   */
  startDate?: Date

  /**
   * By default, the datepicker will not put date numbers on calendar days that
   * fall outside the current month. They will be empty squares. Sometimes you
   * want to see those preceding and trailing days. This is the option for you.
   *
   * Default - false
   */
  showAllDates?: boolean

  /**
   * <input />'s can have a `disabled` or `readonly` attribute applied to them.
   * In those cases, you might want to prevent Datepicker from selecting a date
   * and changing the input's value. Set this option to `true` if that's the
   * case. The calendar will still be functional in that you can change months
   * and enter a year, but dates will not be selectable (or deselectable).
   *
   * Default - false
   */
  respectDisabledReadOnly?: boolean

  /**
   * Provide `true` to disable selecting weekends. Weekends are Saturday &
   * Sunday. If your weekends are a set of different days or you need more
   * control over disabled dates, check out the `disabler` option.
   *
   * Default - false
   */
  noWeekends?: boolean

  /**
   * Sometimes you need more control over which dates to disable. The
   * `disabledDates` option is limited to an explicit array of dates and the
   * `noWeekends` option is limited to Saturdays & Sundays. Provide a function
   * that takes a JavaScript date as it's only argument and returns `true` if
   * the date should be disabled. When the calendar builds, each date will be
   * run through this function to determine whether or not it should be
   * disabled.
   */
  disabler?(date: Date): boolean

  /**
   * Provide an array of JS date objects that will be disabled on the calendar.
   * This array cannot include the same date as `selectedDate`. If you need more
   * control over which dates are disabled, see the `disabler` option.
   */
  disabledDates?: Date[]

  /**
   * Optionally disable Datepicker on mobile devices. This is handy if you'd
   * like to trigger the mobile device's native date picker instead. If that's
   * the case, make sure to use an input with a type of "date" -
   * <input type="date" />
   *
   * Default - false
   */
  disableMobile?: boolean

  /**
   * Clicking the year or month name on the calendar triggers an overlay to
   * show, allowing you to enter a year manually. If you want to disable this
   * feature, set this option to `true`.
   *
   * Default - false
   */
  disableYearOverlay?: boolean

  /**
   * Represents DOM elements with the attribute `data-exempt-id`. Any DOM
   * element with this attribute that matches one of the ids in this set will
   * not cause the picker to close if clicked on. This is helpful in setting
   * up buttons that trigger the picker's methods. For example, clicking those
   * buttons should not cause the calendar to hide.
   *
   * Default - undefined
   */
  exemptIds?: string[]
}

export type DaterangePickerOptions = {
  /**
   * This can be any value aside from `undefined`.
   *
   * Now we're getting fancy! If you want to link two instances together to help
   * form a daterange picker, this is your option. Only two picker instances can
   * share an `id`. The datepicker instance declared first will be considered
   * the "start" picker in the range. There's a fancy `getRange` method for you
   * to use as well.
   */
  id: unknown
} & DatepickerOptions

export type SanitizedOptions = PrettifyNonRecursive<
  (
    | Omit<DatepickerOptions, 'disabledDates' | 'events' | 'exemptIds' | 'customDays'>
    | Omit<DaterangePickerOptions, 'disabledDates' | 'events' | 'exemptIds' | 'customDays'
  ) & {
    disabledDates: InternalPickerData['disabledDates']
    events: InternalPickerData['events']
    exemptIds: InternalPickerData['exemptIds']
    startDate: Date
    customDays: readonly string[]
    months: readonly string[]
    overlayMonths: readonly string[]
    isOverlayShowing: boolean
    minMaxDates: InternalPickerData['minMaxDates']
  } & Required<
      Pick<
        DatepickerOptions,
        | 'noWeekends'
        | 'position'
        | 'onShow'
        | 'onHide'
        | 'onMonthChange'
        | 'onSelect'
        | 'formatter'
        | 'defaultView'
        | 'overlayButton'
        | 'overlayPlaceholder'
        | 'startDay'
        // | 'alwaysShow' // Do NOT include this.
      >
    >
>

export type Selector = string | HTMLElement | null

/**
 * `t`, `r`, `b`, and `l` are all positioned relatively to the input the calendar is attached to.
 * `c` fixes the calendar smack in the middle of the screen. Useful for mobile devices.
 */
export type Sides = {
  t: 'top'
  r: 'right'
  b: 'bottom'
  l: 'left'
  c: 'c'
}

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
export type InternalPickerData = {
  /**
   * All the existing DOM elements associated with the calendar.
   */
  selectorData: SelectorData

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

  startDate: Date
  selectedDate: Date | undefined
  disabledDates: Set<number>
  minDate: Date | undefined
  maxDate: Date | undefined
  minMaxDates: null | {min: Date | undefined; max: Date | undefined}
  noWeekends: boolean
  events: Set<number>
  startDay: number // Start day of the week.
  overlayMonths: string[] // Will also be sliced to 1st 3 characters.
  overlayPlaceholder: string
  overlayButtonText: string
  disableOverlay: boolean
  disabledMobile: boolean // Disable the datepicker on mobile devices. Allows the use of native datepicker if the input type is 'date'.
  isMobile: boolean // 'ontouchstart' in window
  alwaysShow: boolean
  showAllDates: boolean // Shows a date in every square rendered on the calendar (preceding and trailing month days).
  respectDisabledReadOnly: boolean // Prevents Datepicker from selecting dates when attached to inputs that are `disabled` or `readonly`.

  publicPicker: DatepickerInstance | DaterangePickerInstance // The object returned to the user.
  isFirst?: boolean // Indicates this is the 1st instance in a daterange pair.
  sibling?: InternalPickerData // Just a reference to the other internal object in the daterange pair.

  _navigate(
    data: Parameters<DatepickerInstance['navigate']>[0] &
      Pick<CallbackData, 'triggerType'> & {trigger: 'navigate' | UserEvent}
  ): void
  _selectDate(
    data: Parameters<DatepickerInstance['selectDate']>[0] &
      Pick<CallbackData, 'triggerType'> & {trigger: 'selectDate' | UserEvent}
  ): void
  _setMinOrMax(
    isFirstRun: boolean,
    minOrMax: 'min' | 'max',
    data: Pick<CallbackData, 'triggerType'> & {
      date?: Date
      trigger: 'setMin' | 'setMax' | UserEvent
    }
  ): void
  _show(
    data: Omit<CallbackData, 'instance'> & {trigger: 'show' | UserEvent}
  ): void
  _hide(
    data: Omit<CallbackData, 'instance'> & {trigger: 'hide' | UserEvent}
  ): void
  _getRange(): {start: Date | undefined; end: Date | undefined}

  isCalendarShowing: boolean
  isOverlayShowing: boolean
  defaultView: ViewType
  listenersMap: Map<
    PrettifyNonRecursive<ListenersMapKey>,
    PrettifyNonRecursive<ListenersMapValue>
  >
}

export type DatepickerInstance = {
  readonly calendarContainer: HTMLDivElement
  readonly currentDate: Date
  readonly selectedDate: Date | undefined
  readonly remove: (cb?: () => void) => void
  readonly navigate: ({date}: {date: Date}) => void
  readonly selectDate: (data?: {date?: Date; changeCalendar?: boolean}) => void
  readonly setMin: (data?: {date?: Date}) => void
  readonly setMax: (data?: {date?: Date}) => void
  readonly show: () => void
  readonly hide: () => void
  readonly toggleCalendar: () => void
  readonly toggleOverlay: () => void
}

type DaterangePickerInstanceOnlyProps = {
  /**
   * This method is only available on daterange pickers. It will return an
   * object with `start` and `end` properties whose values are JavaScript date
   * objects representing what the user selected on both calendars.
   */
  readonly getRange: () => ReturnType<InternalPickerData['_getRange']>

  /**
   * If two datepickers have the same `id` option then this property will be
   * available and refer to the other instance.
   */
  // TODO - do we need a public reference to sibling?
  // sibling?: DaterangePickerInstance

  /**
   * This method exists because it's possible to individually remove one of the
   * instances in a daterange pair. For convenience, you can call this method
   * and remove them both at once.
   *
   */
  readonly removePair: () => void

  /**
   * Daterange pickers are "connected" via the `id` property. This can be any
   * value except `undefined`. Datepicker will use `Object.is(...)` to check for
   * value equality across instances.
   *
   * This property will be set to `undefined` when one of the pickers in the
   * pair is removed.
   *
   * https://github.com/microsoft/TypeScript/issues/7648
   * Unfortunately, there is now way to express the type "any value but
   * undefined" so we prevent `undefined` by throwing an error in JavaScript.
   */
  readonly id: unknown

  /**
   * Indicates if this is the first instance in a daterange picker pair.
   *
   * This property will be set to `undefined` when one of the pickers in the
   * pair is removed.
   */
  readonly isFirst: boolean | undefined
}

export type DaterangePickerInstance = DatepickerInstance &
  DaterangePickerInstanceOnlyProps

export type SelectorData = {
  el: HTMLElement

  /**
   * The main use of datepicker is to associate it with an element (an <input /> in most cases) and have it positioned relative to that element. In order to accomplish this, a parent element needs to be explicitly positioned. This property is that element. If it doesn't contain any positioning already, `position: relative` will be added to it.
   */
  elementForPositioning: HTMLElement

  /**
   * The value of having run `getComputedStyle(elementForPositioning)`.
   */
  calculatedPosition: string

  /**
   * If the parent element already had an inline style set for position, this will be that value. Otherwise, it will be null.
   */
  originalPositionStyle: string | null
  shadowDom: ShadowRoot | null
  customElement: Element | null
}
