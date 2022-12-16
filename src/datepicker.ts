import type {
  DatepickerOptions,
  InternalPickerData,
  DaterangePickerOptions,
  PickerType,
  Selector,
  DatepickerInstance,
} from './types'

import './datepicker.scss'
import getSelectorData from './getSelectorData'
import {checkForExistingRangepickerPair} from './checkForExistingPicker'
import {createCalendarHTML} from './createCalendarUtils'
import {datepickersMap, days, months, noop} from './constants'
import {renderCalendar} from './renderCalendarUtils'
import {hasMonthChanged, stripTime} from './generalUtils'

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
  const pickerElements = createCalendarHTML({
    date: new Date(2022, 1, 1),
    customMonths: months.slice(),
    customDays: days.slice(),
  })

  // CREATE INTERNAL PICKER DATA
  const internalPickerItem: InternalPickerData = {
    selectorData,
    pickerElements,
    months: options?.customMonths ?? months,
    currentDate: stripTime(options?.startDate ?? new Date()),
    selectedDate: options?.selectedDate
      ? stripTime(options.selectedDate)
      : undefined,
    onMonthChange: options?.onMonthChange ?? noop,
    onSelect: options?.onSelect ?? noop,
  }

  // Flags for the public picker.
  let isRemoved = false
  let isPairRemoved = false

  // CREATE PUBLIC PICKER DATA
  const publicPicker: DatepickerInstance = {
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
      selectorData.el.remove()

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
      }
    },
    removePair(): void {
      // Ensure the logic below is only executed once.
      if (isPairRemoved) return
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
    navigate(date: Date, triggerOnMonthChange?: boolean): void {
      const {currentDate, onMonthChange} = internalPickerItem

      internalPickerItem.currentDate = stripTime(date)
      renderCalendar(internalPickerItem)

      if (triggerOnMonthChange && hasMonthChanged(currentDate, date)) {
        onMonthChange({
          prevDate: stripTime(currentDate),
          newDate: stripTime(date),
        })
      }

      if (internalPickerItem.sibling) {
        const siblingDate = new Date(
          date.getFullYear(),
          date.getMonth() + (internalPickerItem.isFirst ? 1 : -1)
        )

        internalPickerItem.sibling.currentDate = siblingDate
        renderCalendar(internalPickerItem.sibling)
      }
    },

    /**
     * `changeCalendar` only runs if `date` was provided.
     * `triggerOnMonthChange` only runs if `date` was provided and the month actually changed.
     */
    selectDate({date, changeCalendar, triggerOnMonthChange, triggerOnSelect}) {
      const {currentDate, onMonthChange, onSelect} = internalPickerItem

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
          newDate: date ? stripTime(date) : date,
        })
      }
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
}
