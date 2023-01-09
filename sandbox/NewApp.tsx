import Data from './Data'
import DatepickerAttachedToDiv from './DatepickerAttachedToDiv'
import DatepickerAttachedToInput from './DatepickerAttachedToInput'
import DatepickerOLDAttachedToInput from './DatepickerOLDAttachedToInput'
import DaterangePickers from './DaterangePickers'

export default function NewApp() {
  return (
    <>
      <Data />
      <div className="horizontal-gap"></div>
      <div className="datepickers">
        <DatepickerAttachedToDiv />
        <DatepickerAttachedToInput />
        <DatepickerOLDAttachedToInput />
        <DaterangePickers />
      </div>
    </>
  )
}
