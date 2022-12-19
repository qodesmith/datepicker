import {overlayContainerCls} from './constants'
import {DatepickerOptions, InternalPickerData} from './types'

export function hasMonthChanged(prevDate: Date, newDate: Date): boolean {
  const prevYear = prevDate.getFullYear()
  const prevMonth = prevDate.getMonth()
  const newYear = newDate.getFullYear()
  const newMonth = newDate.getMonth()

  if (prevYear !== newYear) return true
  return prevMonth !== newMonth
}

export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

type IsDateWithinRangeInputType = {
  date: Date
  minDate: Date | undefined
  maxDate: Date | undefined
}
export function isDateWithinRange({
  date,
  minDate,
  maxDate,
}: IsDateWithinRangeInputType): boolean {
  const num = +stripTime(date)
  const min = minDate ? +stripTime(minDate) : -Infinity
  const max = maxDate ? +stripTime(maxDate) : Infinity

  return num > min && num < max
}

export function getSiblingDateForNavigate(
  isFirst: boolean | undefined,
  date: Date
): Date {
  return new Date(date.getFullYear(), date.getMonth() + (isFirst ? 1 : -1))
}

type GetOverlayClassInputType = {
  action: 'initialize' | 'calendarOpen' | 'overlayToggle'
  defaultView: DatepickerOptions['defaultView']
  isOverlayShowing?: InternalPickerData['isOverlayShowing']
}
export function getOverlayClassName({
  action,
  defaultView,
  isOverlayShowing,
}: GetOverlayClassInputType): string {
  const isOverlayDefaultView = defaultView === 'overlay'
  let otherCls = ''

  switch (action) {
    case 'initialize':
    case 'calendarOpen':
      otherCls = `dp-overlay-${isOverlayDefaultView ? 'shown' : 'hidden'}`
      break
    case 'overlayToggle':
      otherCls = `dp-overlay-${isOverlayShowing ? 'out' : 'in'}`
      break
  }

  return `${overlayContainerCls} ${otherCls}`.trim()
}
