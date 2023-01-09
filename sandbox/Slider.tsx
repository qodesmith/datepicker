import {ReactNode} from 'react'
import {useRecoilState} from 'recoil'
import {sliderAtomFamily} from './state'
import './slider.scss'

type ButtonConfig = {
  value: number
  display: string
}[]

type Props = {
  sliderKey: string
  message: ReactNode
  initialValue: number
  buttonConfig: ButtonConfig
  step?: number
  min?: number
  max?: number
  toFixed?: number
}

export default function Slider({
  sliderKey,
  message,
  initialValue,
  buttonConfig,
  step = 0.01,
  min = 0.3,
  max = 4,
  toFixed = 2,
}: Props) {
  const [sliderValue, setSliderValue] = useRecoilState(
    sliderAtomFamily({sliderKey, initialValue})
  )

  return (
    <div className="slider-container">
      {message}
      <div className="slider-input-container">
        <input
          type="range"
          step={step}
          min={min}
          max={max}
          value={sliderValue}
          onChange={e => setSliderValue(+e.target.value)}
        />
        <code className="slider-value">{sliderValue.toFixed(toFixed)}em</code>
      </div>
      <div className="slider-button-container">
        <button onClick={() => setSliderValue(initialValue)}>🔄 Reset</button>
        {buttonConfig.map(({display, value}, i) => {
          return (
            <button key={i} onClick={() => setSliderValue(value)}>
              {display}
            </button>
          )
        })}
      </div>
    </div>
  )
}
