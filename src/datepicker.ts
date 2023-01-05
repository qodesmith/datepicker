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
import {defaultOptions, noop} from './constants'
import {renderCalendar} from './utilsRenderCalendar'
import {
  addPickerToMap,
  checkForExistingRangepickerPair,
  getIsInput,
  getOverlayClassName,
  getSelectorData,
  getSiblingDateForNavigate,
  hasMonthChanged,
  isDateWithinRange,
  removePickerFromMap,
  stripTime,
} from './utils'
import {addEventListeners, removeEventListeners} from './utilsEventListeners'

// TODO - allow daterange pickers to have the same selector element except for inputs.
// TODO - throw error when trying to attach Datepicker to a void element.

function datepicker(selector: Selector): void
function datepicker(
  selector: Selector,
  options: DatepickerOptions
): DatepickerInstance
function datepicker(
  selector: Selector,
  options: DaterangePickerOptions
): DaterangePickerInstance
function datepicker(
  selector: Selector,
  options?: DatepickerOptions | DaterangePickerOptions
): DatepickerInstance | DaterangePickerInstance {
  const isRangePicker = options && 'id' in options
  const selectorData = getSelectorData(selector)
  const isInput = getIsInput(selectorData.el)
  const onShow = options?.onShow ?? noop
  const onHide = options?.onHide ?? noop
  const onMonthChange = options?.onMonthChange ?? noop
  const onSelect = options?.onSelect ?? noop

  if (isRangePicker) {
    checkForExistingRangepickerPair(options.id)
  }

  // CREATE CALENDAR HTML
  const startDate = stripTime(options?.startDate ?? new Date())
  const disabledDates = new Set(
    (options?.disabledDates ?? []).map(disabledDate => {
      return +stripTime(disabledDate)
    })
  )
  const pickerElements = createCalendarHTML({
    date: startDate,
    customMonths: (options?.customMonths ?? defaultOptions.months).slice(),
    customDays: (options?.customDays ?? defaultOptions.days).slice(),
    defaultView: options?.defaultView ?? defaultOptions.defaultView,
    overlayButtonText:
      options?.overlayButton ?? defaultOptions.overlayButtonText,
    overlayPlaceholder:
      options?.overlayPlaceholder ?? defaultOptions.overlayPlaceholder,
    // TODO - handle the clash between selectedDate also being a disabledDate.
    selectedDate: options?.selectedDate,
    disabledDates,
    selectorEl: selectorData.el, // For inputs, the calendar will default to no show.
    alwaysShow: !!options?.alwaysShow,
  })

  // CREATE INTERNAL PICKER DATA
  const internalPickerItem: InternalPickerData = {
    selectorData,
    pickerElements,
    months: options?.customMonths ?? defaultOptions.months,
    disabledDates,
    currentDate: startDate,
    selectedDate: options?.selectedDate
      ? stripTime(options.selectedDate)
      : undefined,

    /**
     * An internal function that is aware of a daterange pair and won't call
     * navigate more than once on either instance in the pair. It conditionally
     * calls the sibling's navigate only if `isFirstRun` is true.
     */
    _navigate(isFirstRun: boolean, {date, trigger, triggerType}) {
      const {currentDate, isFirst, sibling} = internalPickerItem

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

      // Prevent an infinite loop of sibling methods calling eachother.
      if (sibling && isFirstRun) {
        const siblingDate = getSiblingDateForNavigate(isFirst, date)

        sibling._navigate(false, {date: siblingDate, trigger, triggerType})
      }
    },
    _selectDate(isFirstRun, {date, changeCalendar, trigger, triggerType}) {
      const {
        currentDate,
        isFirst,
        sibling,
        selectedDate: prevSelectedDate,
      } = internalPickerItem
      const isDateDisabled = date ? disabledDates.has(+stripTime(date)) : false

      // Do nothing if the date is disabled or out of range.
      if (
        date &&
        (isDateDisabled ||
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

      // Re-render the calendar.
      if (changeCalendar && date) {
        // Update the month/year the calendar is visually at.
        internalPickerItem.currentDate = stripTime(date)
        renderCalendar(internalPickerItem)
      }

      if (changeCalendar && date && hasMonthChanged(currentDate, date)) {
        onMonthChange({
          prevDate: stripTime(currentDate),
          newDate: stripTime(date),
          instance: publicPicker,
          trigger,
          triggerType,
        })
      }

      onSelect({
        prevDate: prevSelectedDate ? stripTime(prevSelectedDate) : undefined,
        newDate: date ? stripTime(date) : undefined,
        instance: publicPicker,
        trigger,
        triggerType,
      })

      // Update the DOM with these changes.
      renderCalendar(internalPickerItem)

      // Prevent an infinite loop of sibling methods calling eachother.
      if (sibling && isFirstRun) {
        const siblingDate = date
          ? getSiblingDateForNavigate(isFirst, date)
          : undefined

        sibling._selectDate(false, {
          date: siblingDate,
          changeCalendar,
          trigger,
          triggerType,
        })
      }
    },
    _setMinOrMax(isFirstRun, minOrMax, {date, trigger, triggerType}): void {
      const {minDate, maxDate, sibling} = internalPickerItem
      const dateType = minOrMax === 'min' ? 'minDate' : 'maxDate'

      /*
        This needs to come from the publicPicker because the field is a getter
        which returns a new Date object with the correct values. This avoids
        issues stemming from the user potentially mutating the date object.
      */
      const {selectedDate} = publicPicker

      // Update the min/max date.
      internalPickerItem[dateType] = date ? stripTime(date) : undefined

      // Unselect the selected date if it's out of range.
      if (
        selectedDate &&
        date &&
        !isDateWithinRange({date, minDate, maxDate})
      ) {
        internalPickerItem.selectedDate = undefined

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
      if (sibling && isFirstRun) {
        sibling._setMinOrMax(false, minOrMax, {date, trigger, triggerType})
      }
    },
    isCalendarShowing: options?.alwaysShow ?? !isInput,
    defaultView: options?.defaultView ?? defaultOptions.defaultView,
    isOverlayShowing: options?.defaultView === 'overlay',
    listenersMap: new Map(),
    alwaysShow: !!options?.alwaysShow,
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
  }

  // Flags for the public picker.
  let isRemoved = false
  let isPairRemoved = false

  // CREATE PUBLIC PICKER DATA
  const publicPicker: DatepickerInstance = {
    get calendarContainer() {
      return pickerElements.calendarContainer
    },
    get currentDate() {
      return new Date(internalPickerItem.currentDate)
    },
    get selectedDate() {
      return internalPickerItem.selectedDate
        ? new Date(internalPickerItem.selectedDate)
        : undefined
    },
    remove(): void {
      // Ensure the logic below is only executed once.
      if (isRemoved) return
      isRemoved = true

      // Remove the picker from our tracking Map.
      removePickerFromMap(selectorData.el, internalPickerItem)

      // Remove the picker from the DOM.
      pickerElements.calendarContainer.remove()

      // For daterange pickers, turn the sibling into a regular datepicker.
      if (internalPickerItem.sibling) {
        const {sibling} = internalPickerItem

        // Delete the sibling reference to this picker that is being removed.
        delete sibling.sibling

        // Delete the sibling's isFirst property, since it's no longer a pair.
        delete sibling.isFirst

        // Delete sibling.id
        delete sibling.id
      }

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
    },

    /**
     * This method exists because it's possible to individually remove one of
     * the instances in a daterange pair. For convenience, you can call this
     * method and remove them both at once.
     *
     *
     */
    removePair(): void {
      // Ensure the logic below is only executed once for daterange pairs.
      if (isPairRemoved || !internalPickerItem.sibling) return
      isPairRemoved = true

      publicPicker.remove()

      /*
        Conditionally call this because sibling.remove() may have already been
        called which means the reference here won't exist. Or, this might just
        be a regular datepicker with no sibling at all.
      */
      if (internalPickerItem.sibling) {
        internalPickerItem.sibling.publicPicker.remove()
      }
    },
    navigate(data): void {
      internalPickerItem._navigate(true, {
        ...data,
        trigger: 'navigate',
        triggerType: 'imperative',
      })
    },

    /**
     * Imperative method.
     */
    selectDate(data): void {
      // TODO - for event listener, don't use the public instance method,
      // use internalPickerItem._selectDate with `isImperative: false`.
      internalPickerItem._selectDate(true, {
        ...data,
        trigger: 'selectDate',
        triggerType: 'imperative',
      })
    },

    /**
     * Imperative method.
     */
    setMin(data): void {
      internalPickerItem._setMinOrMax(true, 'min', {
        ...data,
        trigger: 'setMin',
        triggerType: 'imperative',
      })
    },

    /**
     * Imperative method.
     */
    setMax(data): void {
      internalPickerItem._setMinOrMax(true, 'max', {
        ...data,
        trigger: 'setMax',
        triggerType: 'imperative',
      })
    },
    getSelectedRange() {
      if (internalPickerItem.sibling) {
        const {isFirst} = internalPickerItem

        // Ensure the dates are taken from the public picker getters.
        const {selectedDate} = publicPicker
        const {selectedDate: siblingSelectedDate} =
          internalPickerItem.sibling.publicPicker

        return {
          start: isFirst ? selectedDate : siblingSelectedDate,
          end: !isFirst ? selectedDate : siblingSelectedDate,
        }
      }
    },

    /**
     * Imparative method.
     * TODO - check for the "gotcha" scenario with show / hide.
     * https://github.com/qodesmith/datepicker#show--hide-gotcha
     */
    show(): void {
      internalPickerItem._show({trigger: 'show', triggerType: 'imperative'})
    },

    /**
     * Imperative method.
     */
    hide(): void {
      internalPickerItem._hide({trigger: 'hide', triggerType: 'imperative'})
    },
    toggleCalendar(): void {
      if (internalPickerItem.isCalendarShowing) {
        publicPicker.hide()
      } else {
        publicPicker.show()
      }
    },
    toggleOverlay(): void {
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

  internalPickerItem.publicPicker = publicPicker

  if (isRangePicker) {
    // TODO - are we even storing these on the internalPickerItem?
    internalPickerItem.id = options.id
  }

  // STORE THE NEWLY CREATED PICKER ITEM
  addPickerToMap(selectorData.el, internalPickerItem)

  // TODO - ADJUST DATES FOR RANGE PICKERS

  // ADD EVENT LISTENERS
  addEventListeners(internalPickerItem)

  // ADD THE CALENDAR TO THE DOM
  const container = isInput ? selectorData.el.parentElement : selectorData.el
  container?.append(pickerElements.calendarContainer)

  return publicPicker
}

export default datepicker
