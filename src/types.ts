import type {Expand, ExpandRecursively} from './types/expand'
import {userEvents} from './constants'
import {datepicker} from './datepicker'
import {PrivatePicker} from './types/privatePicker'

// TODO - ensure all types are being used. Remove export if not being consumed elsewhere.

export type Datepicker = typeof datepicker
export type TriggerType = 'user' | 'imperative'
export type ImperativeMethod =
  | 'selectDate'
  | 'setMin'
  | 'setMax'
  | 'navigate'
  | 'show'
  | 'hide'
export type UserEvent = typeof userEvents[number]
export type Trigger = ImperativeMethod | UserEvent
type CallbackData = {
  /**
   * The explicit source of what triggered the callback. This can be imperative
   * methods, such as `selectDate` and `show` or user interactions with the DOM,
   * such as `click`.
   */
  trigger: Trigger

  /**
   * The category source of what triggered the callback. `user` for user
   * interactions with the DOM, such as `click`, or `imperative` for imperative
   * methods, such as `selectDate` or `show`.
   */
  triggerType: TriggerType

  /**
   * Providing the datepicker instance as a convenience. This allows the user to
   * avoid having to import the instance from wherever it was created.
   */
  instance: DatepickerInstance
}
type RangeCallbackData = Expand<
  {
    /**
     * Providing the datepicker instance as a convenience. This allows the user
     * to avoid having to import the instance from wherever it was created.
     */
    instance: DaterangePickerInstance
  } & Omit<CallbackData, 'instance'>
>

export type DatepickerOptions = ExpandRecursively<{
  ///////////////
  // CALLBACKS //
  ///////////////

  /**
   * Callback function when the calendar is hidden.
   */
  onHide?(data: CallbackData): void

  /**
   * Callback function when the month has changed.
   */
  onMonthChange?(
    onMonthChangeOptions: Expand<{prevDate: Date; newDate: Date} & CallbackData>
  ): void

  /**
   * Callback function after a date has been selected. It will receive the
   * previous and newly selected dates. If `newDate` is `undefined`, that means
   * the calendar date has been de-selected.
   */
  onSelect?(
    onSelectOptions: Expand<
      {
        prevDate: Date | undefined
        newDate: Date | undefined
      } & CallbackData
    >
  ): void

  /**
   * Callback function when the calendar is shown.
   */
  onShow?(data: CallbackData): void

  ////////////////////
  // CUSTOMIZATIONS //
  ////////////////////

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
   * This option gives you the ability to format the day numbers on the calendar.
   */
  formatDay?(day: number): string

  /**
   * Using an input field with your datepicker? Want to customize its value
   * anytime a date is selected? Provide a function that returns a string to set
   * the input value with.
   *
   * NOTE: The formatInputValue function will only run if the datepicker
   * instance is associated with an <input> field.
   */
  formatInputValue?(date: Date): string

  /**
   * This option gives you the ability to format the year on the calendar from
   * the value that JavaScript date's give you to whatever you'd like.
   */
  formatYear?(year: number): string

  /**
   * Custom text for the year overlay submit button.
   *
   * Default - 'Submit'
   */
  overlayButtonText?: string

  /**
   * Custom placeholder text for the year overlay.
   *
   * Default - '4-digit year'
   */
  overlayPlaceholder?: string

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
   * This function will be used to convert the user's input in the overlay input
   * field back to a value that JavaScript date's can consume. You should
   * provide this option if you are using the `formatYear` option as well.
   */
  unformatYear?(foramttedYear: string): number

  //////////////
  // SETTINGS //
  //////////////

  /**
   * By default, the datepicker will hide & show itself automatically depending
   * on where you click on the page. If you want the calendar to always be on
   * the screen, use this option.
   *
   * Default - false
   */
  alwaysShow?: boolean

  /**
   * An array of dates which indicate something is happening - a meeting,
   * birthday, etc. I.e. an event.
   */
  events?: Date[]

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
   * This will start the calendar with a date already selected. If Datepicker is
   * used with an <input> element, that field will be populated with this date
   * as well.
   */
  selectedDate?: Date

  /**
   * By default, the datepicker will not put date numbers on calendar days that
   * fall outside the current month. They will be empty squares. Sometimes you
   * want to see those preceding and trailing days. This is the option for you.
   *
   * Dates are not clickable by default. To make them clickable, use the
   * `showAllDatesClickable` option.
   *
   * Default - false
   */
  showAllDates?: boolean

  /**
   * Makes dates outside the current month (shown with `showAllDates`) clickable.
   *
   * Default - false
   */
  showAllDatesClickable?: boolean

  /**
   * The date you provide will determine the month that the calendar starts on.
   *
   * Default - today's month
   */
  startDate?: Date

  /**
   * `<input />`'s can have a `disabled` or `readonly` attribute applied to
   * them. Native date inputs (`<input type="date" />`) with `disabled` or
   * `readonly` attributes will not show the HTML calendar associated with them.
   *
   * Similarly, if you use one of these two attributes with a regular input
   * (`<input type="text" readonly />`), datepicker will show the calendar, but
   * it will prevent you from selecting a date or changing the input's initial
   * value.
   *
   * Set this option to `true` if that's what you want. The datepicker calendar
   * will still be functional in that you can change months and enter a year,
   * but dates will not be selectable (or deselectable).
   *
   * Default - false
   */
  respectDisabledReadOnly?: boolean

  //////////////////////
  // DISABLING THINGS //
  //////////////////////

  /**
   * Clicking the year or month name on the calendar triggers an overlay to
   * show, allowing you to enter a year manually. If you want to disable this
   * feature, set this option to `true`.
   *
   * Default - false
   */
  disableYearOverlay?: boolean

  /**
   * Provide an array of JS date objects that will be disabled on the calendar.
   * This array cannot include the same date as `selectedDate`. If you need more
   * control over which dates are disabled, see the `disabler` option.
   */
  disabledDates?: Date[]

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
   * Provide `true` to disable selecting weekends. Weekends are Saturday &
   * Sunday. If your weekends are a set of different days or you need more
   * control over disabled dates, check out the `disabler` option.
   *
   * Default - false
   */
  noWeekends?: boolean

  /**
   * THIS PROPERTY ISN'T INTENDED FOR PUBLIC USE.
   *
   * It is used internally to  wire up a rangepicker (2 datepickers connected).
   * While it's possibly to do this manually yourself, please use the
   * `rangepicker` function instead.
   */
  _id?: unknown
}>

export type DaterangePickerOptions = ExpandRecursively<
  {
    ///////////////
    // CALLBACKS //
    ///////////////

    /**
     * Callback function when the calendar is hidden.
     */
    onHide?(data: RangeCallbackData): void

    /**
     * Callback function when the month has changed.
     */
    onMonthChange?(
      onMonthChangeOptions: Expand<
        {prevDate: Date; newDate: Date} & RangeCallbackData
      >
    ): void

    /**
     * Callback function after a date has been selected. It will receive the
     * previous and newly selected dates. If `newDate` is `undefined`, that
     * means the calendar date has been de-selected.
     */
    onSelect?(
      onSelectOptions: Expand<
        {
          prevDate: Date | undefined
          newDate: Date | undefined
        } & RangeCallbackData
      >
    ): void

    /**
     * Callback function when the calendar is shown.
     */
    onShow?(data: RangeCallbackData): void
  } & Omit<
    DatepickerOptions,
    'onHide' | 'onMonthChange' | 'onSelect' | 'onShow'
  >
>

export type DaterangeOptionsArg = DatepickerOptions | DatepickerOptions[]

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

export type Selector = string | HTMLElement | null
export type RangeSelector =
  | string
  | [string, string]
  | HTMLElement
  | [HTMLElement, HTMLElement]
  | null

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

export type DatepickerInstance = {
  readonly calendarContainer: HTMLDivElement
  readonly currentDate: Date
  readonly selectedDate: Date | undefined
  readonly remove: (cb?: () => void) => void
  readonly navigate: (date: Date) => void
  readonly selectDate: (date?: Date, changeCalendar?: boolean) => void
  readonly setMin: (date?: Date) => void
  readonly setMax: (date?: Date) => void
  readonly show: () => void
  readonly hide: () => void
  readonly toggleCalendar: () => void
  readonly toggleOverlay: () => void
}

export type DaterangePickerInstanceOnlyProps = {
  /**
   * This method is only available on daterange pickers. It will return an
   * object with `start` and `end` properties whose values are JavaScript date
   * objects representing what the user selected on both calendars.
   */
  readonly getRange: () => ReturnType<PrivatePicker['_getRange']>

  /**
   * This method exists because it's possible to individually remove one of the
   * instances in a daterange pair. For convenience, you can call this method
   * and remove them both at once.
   *
   */
  readonly removePair: (cb?: () => void) => void

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

  /**
   * A reference to the other picker in this rangepicker pair.
   */
  readonly sibling: DaterangePickerInstance
}

export type DaterangePickerInstance = Expand<
  DatepickerInstance & DaterangePickerInstanceOnlyProps
>

export type DaterangePickerInstancePair = [
  DaterangePickerInstance,
  DaterangePickerInstance
]
