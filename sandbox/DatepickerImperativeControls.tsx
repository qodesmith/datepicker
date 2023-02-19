import {SyntheticEvent, useMemo} from 'react'
import {
  DatepickerInstance,
  DatepickerOptions,
  DaterangePickerInstance,
  DaterangePickerOptions,
} from '../src/types'
import './datepickerImperativeControls.scss'

type Props = {
  picker: DatepickerInstance | DaterangePickerInstance | null
  options?: DatepickerOptions | DaterangePickerOptions
}

export default function DatepickerImperativeControls({
  picker,
  options = {},
}: Props) {
  const {
    handleLeftArrowClick,
    handleRightArrowClick,
    handleShow,
    handleHide,
    handleToggleCalendar,
    handleToggleOverlay,
  } = useCreateControls(picker)
  const {alwaysShow, exemptIds} = options
  const [exemptId] = exemptIds ?? []

  return (
    <div className="datepicker-imperative-controls">
      <button
        onClick={handleLeftArrowClick}
        disabled={!handleLeftArrowClick}
        data-exempt-id={exemptId}>
        ⬅
      </button>
      <button
        onClick={handleRightArrowClick}
        disabled={!handleRightArrowClick}
        className="arrow-reversed"
        data-exempt-id={exemptId}>
        ⬅
      </button>
      <button
        onClick={handleShow}
        disabled={!handleShow || alwaysShow}
        data-exempt-id={exemptId}>
        🙉 Show
      </button>
      <button
        onClick={handleHide}
        disabled={!handleHide || alwaysShow}
        data-exempt-id={exemptId}>
        🙈 Hide
      </button>
      <button
        onClick={handleToggleCalendar}
        disabled={!handleToggleCalendar || alwaysShow}
        data-exempt-id={exemptId}>
        📆 Toggle Calendar
      </button>
      <button
        onClick={handleToggleOverlay}
        disabled={!handleToggleOverlay}
        data-exempt-id={exemptId}>
        Toggle Overlay
      </button>
    </div>
  )
}

type Controls = {
  handleLeftArrowClick: (e: SyntheticEvent) => void
  handleRightArrowClick: (e: SyntheticEvent) => void
  handleShow: (e: SyntheticEvent) => void
  handleHide: (e: SyntheticEvent) => void
  handleToggleCalendar: (e: SyntheticEvent) => void
  handleToggleOverlay: (e: SyntheticEvent) => void
}

function useCreateControls(
  picker: DatepickerInstance | DaterangePickerInstance | null
): Controls {
  return useMemo(() => {
    if (!picker)
      return {
        handleLeftArrowClick: noop,
        handleRightArrowClick: noop,
        handleShow: noop,
        handleHide: noop,
        handleToggleCalendar: noop,
        handleToggleOverlay: noop,
      }

    return {
      handleLeftArrowClick(e) {
        const {currentDate} = picker
        picker.navigate({
          date: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
          ),
        })
      },
      handleRightArrowClick(e) {
        const {currentDate} = picker
        picker.navigate({
          date: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
          ),
        })
      },
      handleShow(e) {
        picker.show()
      },
      handleHide(e) {
        picker.hide()
      },
      handleToggleCalendar(e) {
        picker.toggleCalendar()
      },
      handleToggleOverlay(e) {
        picker.toggleOverlay()
      },
    }
  }, [picker])
}

function noop() {}
