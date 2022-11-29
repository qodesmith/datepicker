declare module 'js-datepicker' {
    interface DatepickerOptions {
        /** Callback function used to fire when the date has been selected */
        onSelect?(datepickerInstance, date: Date | undefined): void;
        /** Callback function used to fire when the datepicker is shown */
        onshow?(datepickerInstance): void;
        /** Callback function used to fire when the datepicker is hidden */
        onHide?(datepickerInstance): void;
        /** Callback function used to fire when the month has changed */
        onMonthChange?(datepickerInstance): void;
        /** Provide a function that manually sets the provided input's value with your own formatting when a date is selected */
        formatter?(inputElement: HTMLInputElement, date: Date, instance): void;
        /** This option positions the calendar relative to the <input> field it's associated with, values are: tr = top-right, tl = top-left, br = bottom-right, bl = bottom-left, c = center. Default - bl */
        position?: 'tr' | 'tl' | 'br' | 'bl' | 'c';
        /** Specify the day of the week your calendar starts on, 0 = Sunday, 1 = Monday etc. Default - 0 (Sunday)  */
        startDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
        /** You can customize the display of days on the calendar by providing an array of 7 values. Default - ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] */
        customDays?: [string, string, string, string, string, string, string];
        /** You can customize the display of the month name at the top of the calendar by providing an array of 12 strings. Default - ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] */
        customMonths?: [string, string, string, string, string, string, string, string, string, string, string, string];
        /** You can customize the display of the month names in the overlay view by providing an array of 12 strings. Default - The first 3 characters of each item in customMonths property */
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
        ];
        /** Set the overlay to be the default view when opening the calendar by providing 'overlay' value. Default - 'calendar' */
        defaultView?: 'calendar' | 'overlay';
        /** Custom text for the year overlay submit button. Default - 'Submit' */
        overlayButton?: string;
        /** Custom placeholder text for the year overlay. Default - '4-digit year' */
        overlayPlaceholder?: string;
        /** An array of dates which indicate something is happening - a meeting, birthday, etc. I.e. an event. */
        events?: Date[];
        /** Determine when calendar must be always on the screen. Default - false */
        alwaysShow?: boolean;
        /** Set selected date by provided Date object */
        dateSelected?: Date;
        /** Set maximum threshold of selectable dates. */
        maxDate?: Date;
        /** Set minumum threshold of selectable dates. */
        minDate?: Date;
        /** Determine the month that the calendar starts off at. */
        startDate?: Date;
        /** By default, the datepicker will not put date numbers on calendar days that fall outside the current month. They will be empty squares. Sometimes you want to see those preceding and trailing days */
        showAllDates?: boolean;
        /** input can have a disabled or readonly attribute applied to them. In those cases, you might want to prevent Datepicker from selecting a date and changing the input's value. Set this option to true if that's the case. */
        respectDisabledReadOnly?: boolean;
        /** Determine is selecting weekends are possible */
        noWeekends?: boolean;
        /** Provide a function that takes a JavaScript date as it's argument and returns true if the date should be disabled */
        disabler?(date: Date): boolean;
        /** Provide an array of JS date objects that will be disabled on the calendar */
        disabledDates?: Date[];
        /** Determine is Datepicker should be available on mobile devices */
        disableMobile?: boolean;
        /** Determine is clicking on year or month name on the calendar should triggers an overlay for providing date manually */
        disableYearOverlay?: boolean;
        /** Number used to link two instances together to help form a daterange picker when you have more than one datepicker */
        id?: number;
    }
    interface DatepickerInstance {
        /** This will remove the current instance from the DOM, leaving all others in tact */
        remove(): void;
        /** Programmatically navigates the calendar to the date you provide, second argument is used to trigger the onMonthChange callback, default is false */
        navigate(date: Date, runOnMonthChangeCallback: boolean): void;
        /** Allows you to programmatically select or unselect a date on the calendar. If you set a date on a month other than what's currently displaying and you want the calendar to automatically change to it, pass in true as the 2nd argument. */
        setDate(date: Date, changeCalendar: boolean): void;
        /** Allows you to programmatically set the minimum selectable date or unset it. */
        setMin(date: Date): void;
        /** Allows you to programmatically set the maximum selectable date or unset it. */
        setMax(date: Date): void;
        /** Allows you to programmatically show the calendar. Using this method will trigger the onShow callback if your instance has one. */
        show(): void;
        /** Allows you to programmatically hide the calendar.If the alwaysShow property was set on the instance then this method will have no effect. Using this method will trigger the onHide callback if your instance has one. */
        hide(): void;
        /** Call this method on the picker to programmatically toggle the overlay. This will only work if the calendar is showing */
        toggleOverlay(): void;
        /** This method is only available on daterange pickers. */
        getRange(): { start: Date, end: Date };
        /** The calendar element */
        calendar: Element;
        /** The container element that houses the calendar. */
        calendarContainer: Element
        /** A 0-index number representing the current month. For example, 0 represents January. */
        currentMonth: number;
        /** Calendar month in plain english */
        currentMonthName: string;
        /** The current year. E.x. 2099 */
        currentYear: number;
        /** The value of the selected date. This will be undefined if no date has been selected yet. */
        dateSelected: Date;
        /** The element datepicker is relatively positioned against (unless centered). */
        el: Element;
        /** The minimum selectable date. */
        minDate: Date;
        /** The maximum selectable date. */
        maxDate: Date;
        /** If two datepickers have the same id option then this property will be available and refer to the other instance. */
        sibling: DatepickerInstance;
    }

    function datepicker(selectorOrElement: string | Element, options?: DatepickerOptions): DatepickerInstance;
}
