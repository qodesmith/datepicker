declare module 'js-datepicer' {
  type DatepickerOptions = {
    /**
     * Callback function after a date has been selected. The 2nd argument is the selected date when a date is being selected and `undefined` when a date is being unselected. You unselect a date by clicking it again.
     */
    onSelect?(instance: DatepickerInstance, date?: Date): void

    /**
     * Callback function when the calendar is shown.
     */
    onShow?(instance: DatepickerInstance): void

    /**
     * Callback function when the calendar is hidden.
     */
    onHide?(instance: DatepickerInstance): void

    /**
     * Callback function when the month has changed.
     */
    onMonthChange?(instance: DatepickerInstance): void

    /**
     * Using an input field with your datepicker? Want to customize its value anytime a date is selected? Provide a function that manually sets the provided input's value with your own formatting.
     *
     * NOTE: The formatter function will only run if the datepicker instance is associated with an <input> field.
     */
    formatter?(
      input: HTMLInputElement,
      date: Date,
      instance: DatepickerInstance
    ): void

    /**
     * This option positions the calendar relative to the <input> field it's associated with. This can be 1 of 5 values: 'tr', 'tl', 'br', 'bl', 'c' representing top-right, top-left, bottom-right, bottom-left, and centered respectively. Datepicker will position itself accordingly relative to the element you reference in the 1st argument. For a value of 'c', Datepicker will position itself fixed, smack in the middle of the screen. This can be desirable for mobile devices.
     *
     * Default - 'bl'
     */
    position?: 'tr' | 'tl' | 'br' | 'bl' | 'c'

    /**
     * Specify the day of the week your calendar starts on. 0 = Sunday, 1 = Monday, etc. Plays nice with the `customDays` option.
     *
     * Default - 0
     */
    startDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6

    /**
     * You can customize the display of days on the calendar by providing an array of 7 values. This can be used with the `startDay` option if your week starts on a day other than Sunday.
     *
     * Default - ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
     */
    customDays?: [string, string, string, string, string, string, string]

    /**
     * You can customize the display of the month name at the top of the calendar by providing an array of 12 strings.
     *
     * Default - ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
     */
    customMonths?: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string
    ]

    /**
     * You can customize the display of the month names in the overlay view by providing an array of 12 strings. Keep in mind that if the values are too long, it could produce undesired results in the UI.
     *
     * Default - The first 3 characters of each item in `customMonths`.
     */
    customOverlayMonths?: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string
    ]

    /**
     * Want the overlay to be the default view when opening the calendar? This property is for you. Simply set this property to 'overlay' and you're done. This is helpful if you want a month picker to be front and center.
     *
     * Default - 'calendar'
     */
    defaultView?: 'calendar' | 'overlay'

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
     * An array of dates which indicate something is happening - a meeting, birthday, etc. I.e. an event.
     */
    events?: Date[]

    /**
     * By default, the datepicker will hide & show itself automatically depending on where you click or focus on the page. If you want the calendar to always be on the screen, use this option.
     *
     * Default - false
     */
    alwaysShow?: boolean

    /**
     * This will start the calendar with a date already selected. If Datepicker is used with an <input> element, that field will be populated with this date as well.
     */
    dateSelected?: Date

    /**
     * This will be the maximum threshold of selectable dates. Anything after it will be unselectable.
     *
     * NOTE: When using a daterange pair, if you set `maxDate` on the first instance options it will be ignored on the 2nd instance options.
     */
    maxDate?: Date

    /**
     * This will be the minumum threshold of selectable dates. Anything prior will be unselectable.
     *
     * NOTE: When using a daterange pair, if you set `minDate` on the first instance options it will be ignored on the 2nd instance options.
     */
    minDate?: Date

    /**
     * The date you provide will determine the month that the calendar starts off at.
     *
     * Default - today's month
     */
    startDate?: Date

    /**
     * By default, the datepicker will not put date numbers on calendar days that fall outside the current month. They will be empty squares. Sometimes you want to see those preceding and trailing days. This is the option for you.
     *
     * Default - false
     */
    showAllDates?: boolean

    /**
     * <input />'s can have a `disabled` or `readonly` attribute applied to them. In those cases, you might want to prevent Datepicker from selecting a date and changing the input's value. Set this option to `true` if that's the case. The calendar will still be functional in that you can change months and enter a year, but dates will not be selectable (or deselectable).
     *
     * Default - false
     */
    respectDisabledReadOnly?: boolean

    /**
     * Provide `true` to disable selecting weekends. Weekends are Saturday & Sunday. If your weekends are a set of different days or you need more control over disabled dates, check out the `disabler` option.
     *
     * Default - false
     */
    noWeekends: boolean

    /**
     * Sometimes you need more control over which dates to disable. The `disabledDates` option is limited to an explicit array of dates and the `noWeekends` option is limited to Saturdays & Sundays. Provide a function that takes a JavaScript date as it's only argument and returns `true` if the date should be disabled. When the calendar builds, each date will be run through this function to determine whether or not it should be disabled.
     */
    disabler?(date: Date): boolean

    /**
     * Provide an array of JS date objects that will be disabled on the calendar. This array cannot include the same date as `dateSelected`. If you need more control over which dates are disabled, see the `disabler` option.
     */
    disabledDates?: Date[]

    /**
     * Optionally disable Datepicker on mobile devices. This is handy if you'd like to trigger the mobile device's native date picker instead. If that's the case, make sure to use an input with a type of "date" - <input type="date" />
     *
     * Default - false
     */
    disableMobile?: boolean

    /**
     * Clicking the year or month name on the calendar triggers an overlay to show, allowing you to enter a year manually. If you want to disable this feature, set this option to `true`.
     *
     * Default - false
     */
    disableYearOverlay?: boolean
  }

  type DatepickerInstance = {}

  export default function datepicker(
    selector: string | HTMLElement,
    DatepickerOptions
  ): DatepickerInstance
}
