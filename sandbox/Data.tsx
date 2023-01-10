import Slider from './Slider'
import {initialSliderValues} from './state'
import './data.scss'

const [slider1, slider2, slider3] = initialSliderValues

export default function Data() {
  return (
    <section className="data-container">
      <div className="data-sliders-container">
        <Slider
          sliderKey={slider1.sliderKey}
          message={
            <div>
              Change <code>font-size</code> (em) of the{' '}
              <em>
                calendar container <strong>parent</strong>
              </em>
              :
            </div>
          }
          initialValue={slider1.initialValue}
          buttonConfig={[0.5, 1, 2, 3, 4].map(value => {
            return {value, display: `${value}em`}
          })}
        />
        <div className="vertical-line" />
        <Slider
          sliderKey={slider2.sliderKey}
          message={
            <div>
              Change the <code>--dp-size</code> value on the{' '}
              <em>calendar container</em>:
            </div>
          }
          initialValue={slider2.initialValue}
          buttonConfig={[0.5, 0.75, 1, 2, 3].map(value => {
            return {value, display: `${value}em`}
          })}
          min={0.1}
          max={3}
        />
        <div className="vertical-line" />
        <Slider
          sliderKey={slider3.sliderKey}
          message={
            <div>
              Change the <code>--dp-width</code> value on the{' '}
              <em>calendar container</em>:
            </div>
          }
          initialValue={slider3.initialValue}
          buttonConfig={[10, 15.625, 30, 40, 50].map(value => {
            return {value, display: `${value}em`}
          })}
          min={10}
          max={50}
          step={0.1}
          toFixed={3}
        />
      </div>
    </section>
  )
}
