import {overlayContainerCls} from './constants'
import {InternalPickerData} from './types'

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
  action: 'calendarOpen' | 'overlayToggle'
  defaultView: InternalPickerData['defaultView']
  isOverlayShowing: InternalPickerData['isOverlayShowing']
}
export function getOverlayClassName({
  action,
  defaultView,
  isOverlayShowing,
}: GetOverlayClassInputType): string {
  const isOverlayDefaultView = defaultView === 'overlay'
  let otherCls = ''

  if (action === 'calendarOpen') {
    otherCls = `dp-overlay-${isOverlayDefaultView ? 'shown' : 'hidden'}`
  } else {
    otherCls = `dp-overlay-${isOverlayShowing ? 'out' : 'in'}`
  }

  return `${overlayContainerCls} ${otherCls}`
}
