import type {
  DatepickerOptions,
  InternalPickerData,
  DaterangePickerOptions,
  Selector,
  DatepickerInstance,
  DaterangePickerInstance,
} from './types'

import './datepicker.scss'
import {createCalendarHTML} from './utilsCreateCalendar'
import {renderCalendar} from './utilsRenderCalendar'
import {
  addPickerToMap,
  adjustRangepickerMinMaxDates,
  getIsInput,
  getOverlayClassName,
  getRangepickers,
  getSelectorData,
  hasMonthChanged,
  isDateWithinRange,
  isWeekendDate,
  positionCalendar,
  removePickerFromMap,
  sanitizeAndCheckAndSyncOptions,
  shouldSkipForDisabledReadOnly,
  stripTime,
  throwAlreadyRemovedError,
  throwError,
} from './utils'
import {addEventListeners, removeEventListeners} from './utilsEventListeners'

// TODO - allow daterange pickers to have the same selector element except for inputs.
// TODO - throw error when trying to attach Datepicker to a void element.
// TODO - should the public instance for rangepickers include `isFirst`?
// TODO - for internal fxns, see which ones take a single object arg that can be converted to explicit args.
// TODO - format all comment blocks so they look good for intellisense (just hover over the variable to see it).
// TODO - perhaps focusin/focusout/blur should be used to open pickers for accessibility - currently can't open a picker with a keyboard.
// TODO - should the picker methods return the picker instance for chainability?
// TODO - change cursor to pointer for showAllDatesClickable days.
// TODO - consistent code style - get rid of consts and use function declarations instead. Come back later to optimize for library size.
// TODO - wrap disabler fxn internally and use it to check noWeekends, disabledDates, etc., so we only ever run disabler(date) when rendering days.
/**
 * TODO - daterange scenarios to handle:
 * - starting with selected date on one of the calendars should adjust min/max dates accordingly
 * - certain picker options should not be different
 * - handle setting min/max after a single selected date and after a fully selected range
 */

function datepicker(selector: Selector): DatepickerInstance
function datepicker(
  selector: Selector,
  rawOptions: DatepickerOptions
): DatepickerInstance
function datepicker(
  selector: Selector,
  rawOptions: DaterangePickerOptions
): DaterangePickerInstance
function datepicker(
  selector: Selector,
  rawOptions?: DatepickerOptions | DaterangePickerOptions
): DatepickerInstance | DaterangePickerInstance {
  const options = sanitizeAndCheckAndSyncOptions(rawOptions)
  const selectorData = getSelectorData(selector)
  const isInput = getIsInput(selectorData.el)
  const {
    startDate,
    minDate,
    maxDate,
    minMaxDates,
    disabledDates,
    events,
    position,
    noWeekends,
    showAllDates,
    onShow,
    onHide,
    onMonthChange,
    onSelect,
    formatter,
  } = options
  let isRemoved = false
  let isPairRemoved = false

  function safeUpdateInput(date?: Date) {
    if (getIsInput(selectorData.el)) {
      selectorData.el.value = date ? formatter(stripTime(date)) : ''
    }
  }

  // CREATE CALENDAR HTML
  const pickerElements = createCalendarHTML(selectorData.el, options)

  // CREATE INTERNAL PICKER DATA
  // TODO - should this be called `privatePicker` to keep in line with `publicPicker`?
  const internalPickerItem: InternalPickerData = {
    selectorData,
    pickerElements,
    // TODO - is it safe to destructure these values instead?
    months: options.months,
    disabledDates,
    events,
    exemptIds: options.exemptIds,
    currentDate: startDate,
    selectedDate: options.selectedDate,
    minDate,
    maxDate,
    minMaxDates,
    startDay: options.startDay,
    isCalendarShowing: options?.alwaysShow ?? !isInput,
    defaultView: options.defaultView,
    isOverlayShowing: options.isOverlayShowing,
    listenersMap: new Map(),
    alwaysShow: !!options?.alwaysShow,
    noWeekends,
    showAllDates,
    showAllDatesClickable: options.showAllDatesClickable,
    respectDisabledReadOnly: options.respectDisabledReadOnly,
    disabler: options.disabler,
    _navigate({date, trigger, triggerType}) {
      const {currentDate} = internalPickerItem

      internalPickerItem.currentDate = stripTime(date)
      renderCalendar(internalPickerItem)

      // Only trigger `onMonthChange` if the month has actually changed.
      if (hasMonthChanged(currentDate, date)) {
        onMonthChange({
          prevDate: stripTime(currentDate),
          newDate: stripTime(date),
          instance: publicPicker,
          trigger,
          triggerType,
        })
      }
    },
    // TODO add intellisense comments to all these internal methods.
    _selectDate({date, changeCalendar, trigger, triggerType}) {
      const {
        currentDate,
        sibling,
        selectedDate: prevSelectedDate,
      } = internalPickerItem
      const isWeekendDateDisabled = date && noWeekends && isWeekendDate(date)
      const isDateDisabled = date
        ? disabledDates.has(+stripTime(date)) || isWeekendDateDisabled
        : false

      // Do nothing if the date is disabled or out of range.
      if (
        date &&
        (isDateDisabled ||
          /**
           * For daterange pickers, this within-range check should happen before
           * we update the min/max values which only happens on daterange
           * pickers as a result of clicking a day.
           */
          !isDateWithinRange({
            date,
            minDate: internalPickerItem.minDate,
            maxDate: internalPickerItem.maxDate,
          }))
      ) {
        return
      }

      // Update the selected date.
      internalPickerItem.selectedDate = date ? stripTime(date) : undefined

      // Update the month/year the calendar is visually at.
      if (changeCalendar && date) {
        internalPickerItem.currentDate = stripTime(date)
      }

      // Update min/max dates if this is a rangepicker.
      adjustRangepickerMinMaxDates(internalPickerItem, date)

      // Update the DOM with these changes.
      renderCalendar(internalPickerItem)
      renderCalendar(sibling)

      // Change input.
      safeUpdateInput(date)

      onSelect({
        prevDate: prevSelectedDate ? stripTime(prevSelectedDate) : undefined,
        newDate: date ? stripTime(date) : undefined,
        instance: publicPicker,
        trigger,
        triggerType,
      })

      if (changeCalendar && date && hasMonthChanged(currentDate, date)) {
        onMonthChange({
          prevDate: stripTime(currentDate),
          newDate: stripTime(date),
          instance: publicPicker,
          trigger,
          triggerType,
        })
      }
    },
    _setMinOrMax(isFirstRun, minOrMax, {date, trigger, triggerType}): void {
      const {minDate, maxDate, sibling} = internalPickerItem
      const dateType = minOrMax === 'min' ? 'minDate' : 'maxDate'
      const strippedDate = date ? stripTime(date) : undefined

      if (strippedDate) {
        if (minOrMax === 'min' && maxDate && +strippedDate > +maxDate) {
          throwError('`minDate` cannot be > `maxDate`')
        }
        if (minOrMax === 'max' && minDate && +strippedDate < +minDate) {
          throwError('`maxDate` cannot be < `minDate`')
        }
      }

      // TODO - ensure all comments are consistently styled.
      /**
       * This needs to come from the publicPicker because the field is a getter
       * which returns a new Date object with the correct values. This avoids
       * issues stemming from the user potentially mutating the date object.
       */
      const {selectedDate} = publicPicker

      // Update the min/max date.
      internalPickerItem[dateType] = strippedDate

      // Unselect the selected date if it's out of range.
      if (
        selectedDate &&
        date &&
        !isDateWithinRange({
          date: selectedDate,
          minDate: dateType === 'minDate' ? strippedDate : minDate,
          maxDate: dateType === 'maxDate' ? strippedDate : maxDate,
        })
      ) {
        internalPickerItem.selectedDate = undefined

        safeUpdateInput()

        onSelect({
          prevDate: selectedDate,
          newDate: undefined,
          instance: publicPicker,
          trigger,
          triggerType,
        })
      }

      // Update the DOM with these changes.
      renderCalendar(internalPickerItem)

      // Prevent an infinite loop of sibling methods calling eachother.
      // TODO - does this need to happen? Why are we updating the sibling?
      if (sibling && isFirstRun) {
        sibling._setMinOrMax(false, minOrMax, {date, trigger, triggerType})
      }
    },
    _show({trigger, triggerType}) {
      if (internalPickerItem.isCalendarShowing) {
        return
      }

      const {defaultView} = internalPickerItem
      const shouldOverlayShow = defaultView === 'overlay'

      internalPickerItem.isOverlayShowing = shouldOverlayShow
      if (shouldOverlayShow) {
        pickerElements.calendarContainer.classList.add('dp-blur')
      }
      pickerElements.calendarContainer.classList.remove('dp-dn')
      positionCalendar(internalPickerItem, position, isInput)
      pickerElements.overlay.overlayContainer.className = getOverlayClassName({
        action: 'calendarOpen',
        defaultView,
      })

      if (shouldOverlayShow) {
        pickerElements.overlay.input.focus()
      }

      internalPickerItem.isCalendarShowing = true

      onShow({
        trigger,
        triggerType,
        instance: publicPicker,
      })
    },
    _hide({trigger, triggerType}) {
      if (
        internalPickerItem.alwaysShow ||
        !internalPickerItem.isCalendarShowing
      ) {
        return
      }

      pickerElements.calendarContainer.classList.add('dp-dn')

      if (internalPickerItem.defaultView === 'calendar') {
        pickerElements.calendarContainer.classList.remove('dp-blur')
      }
      pickerElements.overlay.input.value = ''
      internalPickerItem.isCalendarShowing = false

      onHide({
        trigger,
        triggerType,
        instance: publicPicker,
      })
    },
    _getRange() {
      const selectedDate1 = publicPicker.selectedDate
      const selectedDate2 = internalPickerItem.sibling?.selectedDate
        ? new Date(internalPickerItem.sibling.selectedDate)
        : undefined

      return {
        start: internalPickerItem.isFirst ? selectedDate1 : selectedDate2,
        end: internalPickerItem.isFirst ? selectedDate2 : selectedDate1,
      }
    },
  }

  // CREATE PUBLIC PICKER DATA
  const publicPicker: DatepickerInstance = {
    get calendarContainer() {
      if (isRemoved) throwAlreadyRemovedError()
      return pickerElements.calendarContainer
    },
    get currentDate() {
      if (isRemoved) throwAlreadyRemovedError()
      return new Date(internalPickerItem.currentDate)
    },
    get selectedDate() {
      if (isRemoved) throwAlreadyRemovedError()
      return internalPickerItem.selectedDate
        ? new Date(internalPickerItem.selectedDate)
        : undefined
    },
    remove(cb): void {
      // Ensure the logic below is only executed once.
      if (isRemoved) throwAlreadyRemovedError()
      isRemoved = true

      // Remove the picker from our tracking Map.
      removePickerFromMap(internalPickerItem)

      // Remove the picker from the DOM.
      pickerElements.calendarContainer.remove()

      /**
       * For daterange pickers, turn the sibling into a regular datepicker since
       * this picker is being removed from the daterange pair. Ideally it would
       * be great to do this by removing any rangepicker-specific properties,
       * but that could cause errors if the user froze the picker.
       *
       * When an object is frozen with Object.freeze, JavaScript will throw
       * errors in strict mode when trying to delete properties or update
       * property values. This library doesn't freeze any objects but the object
       * might get frozen once in the user's hands.
       *
       * It is safe to delete properties on internal picker objects because they
       * aren't frozen and aren't publically accessible.
       */
      if (internalPickerItem.sibling) {
        const {sibling} = internalPickerItem

        /////////////////////
        // INTERNAL OBJECT //
        /////////////////////

        // Delete the sibling reference to this picker that is being removed.
        delete sibling.sibling

        // Delete the sibling's isFirst property, since it's no longer a pair.
        delete sibling.isFirst

        // Delete sibling.id
        delete sibling.id

        ///////////////////
        // PUBLIC OBJECT //
        ///////////////////

        // Nothing to do here. See the comment where the rangepicker is created.
      }

      // TODO - what do we do here if 2 pickers are attached to the same container?
      // Remove styles added to the parent element.
      if (selectorData.originalPositionStyle) {
        selectorData.elementForPositioning.style.setProperty(
          'position',
          selectorData.originalPositionStyle
        )
      } else {
        selectorData.elementForPositioning.style.removeProperty('position')
        if (selectorData.elementForPositioning.getAttribute('style') === '') {
          selectorData.elementForPositioning.removeAttribute('style')
        }
      }

      // Remove listeners.
      removeEventListeners(internalPickerItem)
      // TODO - ^^^ move as many private & public picker methods to importable functions like this one.

      // TODO - should remove be async and we return cb?.()?
      cb?.()
    },
    // TODO - many methods take a date as the argument, not an object with a date.
    navigate(data): void {
      if (isRemoved) throwAlreadyRemovedError()

      internalPickerItem._navigate({
        ...data,
        trigger: 'navigate',
        triggerType: 'imperative',
      })
    },
    selectDate(data): void {
      if (isRemoved) throwAlreadyRemovedError()
      if (shouldSkipForDisabledReadOnly(internalPickerItem)) return

      internalPickerItem._selectDate({
        ...data,
        trigger: 'selectDate',
        triggerType: 'imperative',
      })
    },
    setMin(data): void {
      if (isRemoved) throwAlreadyRemovedError()

      // TODO - handle scenario where we're in the middle of picking a range.
      // i.e. internalPickerItem.minMaxDates is truthy.

      // TODO - handle scenario when a date is already selected on a rangepicker pair.
      internalPickerItem._setMinOrMax(true, 'min', {
        ...data,
        trigger: 'setMin',
        triggerType: 'imperative',
      })
    },
    setMax(data): void {
      if (isRemoved) throwAlreadyRemovedError()

      // TODO - handle scenario when a date is already selected on a rangepicker pair.
      internalPickerItem._setMinOrMax(true, 'max', {
        ...data,
        trigger: 'setMax',
        triggerType: 'imperative',
      })
    },
    show(): void {
      if (isRemoved) throwAlreadyRemovedError()

      internalPickerItem._show({trigger: 'show', triggerType: 'imperative'})
    },
    hide(): void {
      if (isRemoved) throwAlreadyRemovedError()

      internalPickerItem._hide({trigger: 'hide', triggerType: 'imperative'})
    },
    toggleCalendar(): void {
      if (isRemoved) throwAlreadyRemovedError()

      if (internalPickerItem.isCalendarShowing) {
        publicPicker.hide()
      } else {
        publicPicker.show()
      }
    },
    toggleOverlay(): void {
      if (isRemoved) throwAlreadyRemovedError()

      const {isCalendarShowing, isOverlayShowing, defaultView} =
        internalPickerItem
      const {overlay, calendarContainer} = pickerElements
      const {input, overlaySubmitButton} = overlay

      if (!isCalendarShowing) return

      const overlayCls = getOverlayClassName({
        action: 'overlayToggle',
        defaultView,
        isOverlayShowing,
      })

      if (isOverlayShowing) {
        calendarContainer.classList.remove('dp-blur')
        input.blur()
      } else {
        calendarContainer.classList.add('dp-blur')
        overlaySubmitButton.disabled = true
        input.value = ''
        input.focus()
      }

      internalPickerItem.isOverlayShowing = !isOverlayShowing
      overlay.overlayContainer.className = overlayCls
    },
  }

  /**
   * addPickerToMap
   * addEventListeners
   * renderCalendar
   * Append the calendar to the DOM
   * positionCalendar
   */
  function finalSteps() {
    // UPDATE INPUT FIELD
    if (options.selectedDate) {
      safeUpdateInput(options.selectedDate)
    }

    // STORE PICKER IN MAP
    addPickerToMap(internalPickerItem)

    // ADD EVENT LISTENERS
    addEventListeners(internalPickerItem)

    // RENDER DATERANGE SIBLING (may have been updated by sanitizeAndCheckAndSyncOptions)
    renderCalendar(internalPickerItem.sibling)

    // VISUALLY UPDATE THE CALENDAR (month name, days, year)
    renderCalendar(internalPickerItem)

    // ADD THE CALENDAR TO THE DOM
    const container = isInput ? selectorData.el.parentElement : selectorData.el
    container?.append(pickerElements.calendarContainer)

    // UPDATE CALENDAR POSITION
    positionCalendar(internalPickerItem, position, isInput)
  }

  // Rangepicker.
  if ('id' in options) {
    const {id} = options
    const rangepickers = getRangepickers(id)
    const isFirst = !rangepickers.length
    internalPickerItem.isFirst = isFirst
    internalPickerItem.id = id

    // Update sibling references.
    if (!isFirst) {
      /**
       * There will only be 1 picker in the array because we haven't added the
       * one that we're creating here yet.
       */
      const [sibling] = rangepickers

      // Add a reference to the 1st picker on this one.
      internalPickerItem.sibling = sibling

      // Add a reference to this picker on the 1st one.
      sibling.sibling = internalPickerItem
    }

    const rangepickerProps = {
      /**
       * When an object is frozen with Object.freeze, JavaScript will throw
       * errors in strict mode when trying to delete properties or update
       * property values. This library doesn't freeze any objects but the object
       * might get frozen once in the user's hands.
       *
       * When a rangepicker is removed, ideally it would be great to turn its
       * sibling into a regular picker by removing any rangepicker-specific
       * properties. Since we want to avoid potential errors with Object.freeze,
       * we use getters to return `undefined` if the picker has been removed.
       */
      get id() {
        return isPairRemoved || isRemoved ? undefined : id
      },
      get isFirst() {
        return isPairRemoved || isRemoved ? undefined : isFirst
      },
      getRange() {
        if (isPairRemoved || isRemoved) throwAlreadyRemovedError()

        return internalPickerItem._getRange()
      },
      removePair(): void {
        if (isPairRemoved || isRemoved) throwAlreadyRemovedError()

        isPairRemoved = true
        publicPicker.remove()

        /**
         * Conditionally call this because sibling.remove() may have already
         * been called which means the reference here won't exist.
         */
        if (internalPickerItem.sibling) {
          internalPickerItem.sibling.publicPicker.remove()
        }
      },
    }

    /**
     * https://stackoverflow.com/a/34481052/2525633
     *
     * {...publicPicker, ...rangepickerProps} - Spreading fails because only the
     * values of getters and setters are copied over, not the actual getters and
     * setters themselves. So we do the following instead:
     */
    const rangepicker: DaterangePickerInstance = Object.create(
      Object.getPrototypeOf(publicPicker),
      {
        ...Object.getOwnPropertyDescriptors(publicPicker),
        ...Object.getOwnPropertyDescriptors(rangepickerProps),
      }
    )

    // STORE THE PUBLIC PICKER ITEM
    internalPickerItem.publicPicker = rangepicker

    finalSteps()

    return rangepicker
  }

  // STORE THE PUBLIC PICKER ITEM
  internalPickerItem.publicPicker = publicPicker

  finalSteps()

  return publicPicker
}

export default datepicker
