import Data from './Data'
import DatepickerAttachedToDiv from './DatepickerAttachedToDiv'
import DatepickerAttachedToInput from './DatepickerAttachedToInput'
import DatepickerOLDAttachedToInput from './DatepickerOLDAttachedToInput'

export default function NewApp() {
  return (
    <>
      <Data />
      <div className="horizontal-gap"></div>
      <div className="datepickers">
        <DatepickerAttachedToDiv />
        <DatepickerAttachedToInput />
        <DatepickerOLDAttachedToInput />
      </div>
    </>
  )
}
