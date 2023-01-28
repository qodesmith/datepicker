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
import {defaultFormatter, defaultOptions, noop} from './constants'
import {renderCalendar} from './utilsRenderCalendar'
import {
  addPickerToMap,
  adjustMinMaxDates,
  checkForExistingRangepickerPair,
  getIsFirstRangepicker,
  getIsInput,
  getOverlayClassName,
  getRangepickers,
  getSelectorData,
  hasMonthChanged,
  isDateWithinRange,
  positionCalendar,
  removePickerFromMap,
  stripTime,
  throwAlreadyRemovedError,
  throwError,
} from './utils'
import {addEventListeners, removeEventListeners} from './utilsEventListeners'

// TODO - allow daterange pickers to have the same selector element except for inputs.
// TODO - throw error when trying to attach Datepicker to a void element.
// TODO - should the public instance for rangepickers include `isFirst`?

function datepicker(selector: Selector): DatepickerInstance
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
  const formatter = options?.formatter ?? defaultFormatter
  const startDate = stripTime(options?.startDate ?? new Date())
  const position = options?.position ?? 'tl'
  const {minDate, maxDate} = options ?? {}
  const disabledDates = new Set(
    (options?.disabledDates ?? []).map(disabledDate => {
      return +stripTime(disabledDate)
    })
  )
  let isRemoved = false // TODO - ensure all methods check this first.
  let isPairRemoved = false

  function safeUpdateInput(value: string) {
    if (isInput) {
      ;(selectorData.el as HTMLInputElement).value = value
    }
  }

  // CREATE CALENDAR HTML
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
  // TODO - should this be called `privatePicker` to keep in line with `publicPicker`?
  const internalPickerItem: InternalPickerData = {
    selectorData,
    pickerElements,
    months: options?.customMonths ?? defaultOptions.months,
    disabledDates,
    currentDate: startDate,
    selectedDate: options?.selectedDate
      ? stripTime(options.selectedDate)
      : undefined,
    minDate,
    maxDate,
    minMaxDates: null,

    _navigate({date, trigger, triggerType}) {
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
    },
    // TODO add intellisense comments to all these internal methods.
    _selectDate({date, changeCalendar, trigger, triggerType}) {
      const {
        currentDate,
        sibling,
        selectedDate: prevSelectedDate,
      } = internalPickerItem
      const isDateDisabled = date ? disabledDates.has(+stripTime(date)) : false

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

      // Update min/max dates only for rangepickers.
      if (sibling) {
        adjustMinMaxDates({picker: internalPickerItem, date})
      }

      // Update the DOM with these changes.
      renderCalendar(internalPickerItem)
      if (sibling) {
        renderCalendar(sibling)
      }

      // Change input.
      safeUpdateInput(date ? formatter(stripTime(date)) : '')

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

      // TODO - ensure all comments are consistently styled.
      /**
       * This needs to come from the publicPicker because the field is a getter
       * which returns a new Date object with the correct values. This avoids
       * issues stemming from the user potentially mutating the date object.
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

        safeUpdateInput('')

        // TODO - does the '_setMinOrMax' trigger ever get set anywhere?
        if (trigger !== '_setMinOrMax') {
          onSelect({
            prevDate: selectedDate,
            newDate: undefined,
            instance: publicPicker,
            trigger,
            triggerType,
          })
        }
      }

      // Update the DOM with these changes.
      renderCalendar(internalPickerItem)

      // Prevent an infinite loop of sibling methods calling eachother.
      // TODO - does this need to happen? Why are we updating the sibling?
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
      if (isRemoved) throwAlreadyRemovedError()
      isRemoved = true

      // Remove the picker from our tracking Map.
      removePickerFromMap(internalPickerItem)

      // Remove the picker from the DOM.
      pickerElements.calendarContainer.remove()

      /**
       * For daterange pickers, turn the sibling into a regular datepicker.
       *
       * Deleting properties from the user-facing picker object has the
       * potential to cause problems if the object was frozen. For example,
       * if the user were to save the public picker object in a state management
       * library such as Recoil.js, the object is frozen and trying to delete
       * a property will cause Recoil to throw an error.
       *
       * It is safe to delete properties of the internal picker objects because
       * they are never in danger of being frozen.
       */
      if (internalPickerItem.sibling) {
        const {sibling} = internalPickerItem
        const publicPicker =
          internalPickerItem.publicPicker as DaterangePickerInstance

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

        /**
         * There are 2 properties to process on the public picker object:
         * 1. id
         * 2. isFirst
         *
         * These 2 properties will be set to `undefined`.
         * All methods on public pickers throw an error if removed.
         */
        // @ts-expect-error - we're intentionally setting a readonly property.
        publicPicker.id = undefined
        // @ts-expect-error - we're intentionally setting a readonly property.
        publicPicker.isFirst = undefined
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

      internalPickerItem._selectDate({
        ...data,
        trigger: 'selectDate',
        triggerType: 'imperative',
      })
    },
    setMin(data): void {
      if (isRemoved) throwAlreadyRemovedError()

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

    /**
     * TODO - check for the "gotcha" scenario with show / hide.
     * https://github.com/qodesmith/datepicker#show--hide-gotcha
     */
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

  function finalSteps() {
    // STORE PICKER IN MAP
    addPickerToMap(internalPickerItem)

    // ADD EVENT LISTENERS
    addEventListeners(internalPickerItem)

    // ADD THE CALENDAR TO THE DOM
    const container = isInput ? selectorData.el.parentElement : selectorData.el
    container?.append(pickerElements.calendarContainer)

    // UPDATE CALENDAR POSITION
    positionCalendar(internalPickerItem, position, isInput)
  }

  if (isRangePicker) {
    const {id} = options
    if (id === undefined) throwError('`options.id` cannot be `undefined`.')

    checkForExistingRangepickerPair(id)
    const isFirst = getIsFirstRangepicker(id)

    internalPickerItem.id = id
    internalPickerItem.isFirst = isFirst

    if (!isFirst) {
      const [sibling] = getRangepickers(id)
      // Add a reference to the 1st picker on this one.
      internalPickerItem.sibling = sibling

      // Add a reference to this picker on the 1st one.
      sibling.sibling = internalPickerItem
    }

    const rangepicker: DaterangePickerInstance = {
      ...publicPicker,
      id,
      isFirst,
      getRange() {
        if (isRemoved) throwAlreadyRemovedError()

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
