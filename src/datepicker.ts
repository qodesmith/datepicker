import type {
  DatepickerOptions,
  InternalPickerData,
  DaterangePickerOptions,
  PickerType,
  Selector,
  DatepickerInstance,
} from './types'

import './datepicker.scss'
import {createCalendarHTML} from './utilsCreateCalendar'
import {datepickersMap, defaultOptions, noop} from './constants'
import {renderCalendar} from './utilsRenderCalendar'
import {
  checkForExistingRangepickerPair,
  getOverlayClassName,
  getSelectorData,
  getSiblingDateForNavigate,
  hasMonthChanged,
  isDateWithinRange,
  stripTime,
} from './utils'

let listnerAttached = false

// TODO - allow daterange pickers to have the same selector element except for inputs.
// TODO - throw error when trying to attach Datepicker to a void element.

export default function datepicker(
  selector: Selector,
  options?: DatepickerOptions | DaterangePickerOptions
) /*: DatepickerInstance | DaterangePickerInstance*/ {
  const selectorData = getSelectorData(selector)
  const pickerType: PickerType =
    options?.hasOwnProperty('id') === true ? 'rangepicker' : 'picker'

  if (pickerType === 'rangepicker') {
    checkForExistingRangepickerPair(options?.id)
  }

  // HANDLE POSITIONING OF CONTAINING ELEMENT.

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
    onMonthChange: options?.onMonthChange ?? noop,
    onSelect: options?.onSelect ?? noop,

    /**
     * An internal function that is aware of a daterange pair and won't call
     * navigate more than once on either instance in the pair. It conditionally
     * calls the sibling's navigate only if `isFirstRun` is true.
     */
    _navigate(isFirstRun: boolean, {date, triggerOnMonthChange}) {
      const {currentDate, onMonthChange, isFirst, sibling} = internalPickerItem

      internalPickerItem.currentDate = stripTime(date)
      renderCalendar(internalPickerItem)

      // Only trigger `onMonthChange` if the month has actually changed.
      if (triggerOnMonthChange && hasMonthChanged(currentDate, date)) {
        onMonthChange({
          prevDate: stripTime(currentDate),
          newDate: stripTime(date),
        })
      }

      // Prevent an infinite loop of sibling methods calling eachother.
      if (sibling && isFirstRun) {
        const siblingDate = getSiblingDateForNavigate(isFirst, date)

        sibling._navigate(false, {date: siblingDate, triggerOnMonthChange})
      }
    },
    _selectDate(
      isFirstRun,
      {date, changeCalendar, triggerOnMonthChange, triggerOnSelect} = {}
    ) {
      const {currentDate, onMonthChange, onSelect, isFirst, sibling} =
        internalPickerItem

      // Do nothing if the date is out of range.
      if (
        date &&
        !isDateWithinRange({
          date,
          minDate: internalPickerItem.minDate,
          maxDate: internalPickerItem.maxDate,
        })
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

      if (triggerOnMonthChange && date && hasMonthChanged(currentDate, date)) {
        onMonthChange({
          prevDate: stripTime(currentDate),
          newDate: stripTime(date),
        })
      }

      if (triggerOnSelect) {
        onSelect({
          prevDate: stripTime(currentDate),
          newDate: date ? stripTime(date) : undefined,
        })
      }

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
          triggerOnMonthChange,
          triggerOnSelect,
        })
      }
    },
    _setMinOrMax(isFirstRun, minOrMax, {date, triggerOnSelect} = {}): void {
      const {minDate, maxDate, sibling, onSelect} = internalPickerItem
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

        if (triggerOnSelect) {
          onSelect({prevDate: selectedDate, newDate: undefined})
        }
      }

      // Update the DOM with these changes.
      renderCalendar(internalPickerItem)

      // Prevent an infinite loop of sibling methods calling eachother.
      if (sibling && isFirstRun) {
        sibling._setMinOrMax(false, minOrMax, {date, triggerOnSelect})
      }
    },
    isCalendarShowing: !!options?.alwaysShow,
    defaultView: options?.defaultView ?? defaultOptions.defaultView,
    isOverlayShowing: options?.defaultView === 'overlay',
  }

  // Flags for the public picker.
  let isRemoved = false
  let isPairRemoved = false

  // CREATE PUBLIC PICKER DATA
  const publicPicker: DatepickerInstance = {
    calendarContainer: pickerElements.calendarContainer,
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
      datepickersMap.delete(selectorData.el)

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

      if (datepickersMap.size === 0) {
        // TODO - remove event listeners.
        listnerAttached = false
      }
    },

    /**
     * This method exists because it's possible to individually remove one of
     * the instances in a daterange pair. For convenience, you can call this
     * method and remove them both at once.
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
      internalPickerItem._navigate(true, data)
    },

    /**
     * `changeCalendar` only runs if `date` was provided.
     * `triggerOnMonthChange` only runs if `date` was provided and the month actually changed.
     */
    selectDate(data): void {
      internalPickerItem._selectDate(true, data)
    },

    /**
     * `data.triggerOnSelect` will only run if there was a selected date that
     * falls outside the new min/max range.
     */
    setMin(data): void {
      internalPickerItem._setMinOrMax(true, 'min', data)
    },
    setMax(data): void {
      internalPickerItem._setMinOrMax(true, 'max', data)
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

    /*
      TODO - check for the "gotcha" scenario with show / hide.
      https://github.com/qodesmith/datepicker#show--hide-gotcha
    */
    show(): void {
      const {defaultView} = internalPickerItem
      const isOverlayShowing = defaultView === 'overlay'

      internalPickerItem.isOverlayShowing = isOverlayShowing
      pickerElements.calendarContainer.classList.remove('dp-dn')
      pickerElements.overlay.overlayContainer.className = getOverlayClassName({
        action: 'calendarOpen',
        defaultView,
      })
      internalPickerItem.isCalendarShowing = true

      if (isOverlayShowing) {
        pickerElements.overlay.input.focus()
      }
    },
    hide(): void {
      pickerElements.calendarContainer.classList.add('dp-dn')
      pickerElements.calendarContainer.classList.remove('dp-blur')
      pickerElements.overlay.input.value = ''
      internalPickerItem.isCalendarShowing = false
    },
    toggleOverlay(): void {
      const {
        isCalendarShowing,
        isOverlayShowing: oldIsOverlayShowing,
        defaultView,
      } = internalPickerItem
      const {overlay, calendarContainer} = pickerElements

      if (!isCalendarShowing) return

      const overlayCls = getOverlayClassName({
        action: 'overlayToggle',
        defaultView,
        isOverlayShowing: oldIsOverlayShowing,
      })

      if (oldIsOverlayShowing) {
        calendarContainer.classList.remove('dp-blur')
      } else {
        calendarContainer.classList.add('dp-blur')
        pickerElements.overlay.input.value = ''
        pickerElements.overlay.input.focus()
      }

      internalPickerItem.isOverlayShowing = !oldIsOverlayShowing
      overlay.overlayContainer.className = overlayCls
    },
  }

  internalPickerItem.publicPicker = publicPicker

  if (pickerType === 'rangepicker') {
    // TODO - are we even storing these on the internalPickerItem?
    internalPickerItem.id = options?.id
  }

  // STORE THE NEWLY CREATED PICKER ITEM
  datepickersMap.set(selectorData.el, internalPickerItem)

  // ADJUST DATES FOR RANGE PICKERS

  // ADD EVENT LISTENERS - ONLY ADD THEM ONCE

  // RENDER CALENDAR

  // TODO - remove this. Just temporary for testing. Appending the calendar is actually more complex than this.
  selectorData.el.append(pickerElements.calendarContainer)

  return publicPicker
}
