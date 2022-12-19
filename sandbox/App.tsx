import {useEffect, useRef, useState} from 'react'
import datepicker from '../src/datepicker'
import QodesmithElement from './QodesmithElement'
import oldDatepicker from '../src/old-datepicker'

// @ts-expect-error We set this globally so it can render.
window.QodesmithElement = QodesmithElement

function App() {
  const newPickerRan = useRef(false)
  const [range, setRange] = useState(1)

  useEffect(() => {
    if (!newPickerRan.current) {
      window.x = datepicker('.dp-test', {alwaysShow: true})
      newPickerRan.current = true
    }
    // const oldPicker = oldDatepicker('.old-dp-input', {alwaysShow: true})

    return () => {
      // oldPicker.remove()
    }
  }, [])

  return (
    <>
      <div>
        'ontouchstart' in window:{' '}
        <code>
          {/* https://bit.ly/3Y9gtnJ */}
          {Boolean('ontouchstart' in document.documentElement).toString()}
        </code>
      </div>
      <div
        className="old-dp-test"
        dangerouslySetInnerHTML={{
          __html:
            '<input type="text" class="old-dp-input" placeholder="old-dp-input" />',
        }}
      />
      <div>
        <div>
          Container font size: <code>{range.toFixed(2)}em</code>
        </div>
        <input
          type="range"
          min=".3"
          max="5"
          step=".01"
          value={range}
          onChange={e => setRange(+e.target.value)}
        />
      </div>
      <div
        style={{fontSize: `${range}em`}}
        className="dp-test"
        dangerouslySetInnerHTML={{
          __html: '<div>This is a div that will container a picker.</div>',
        }}
      />
      <div
        className="shadow-dom-test"
        dangerouslySetInnerHTML={{
          __html: '<qodesmith-element></qodesmith-element>',
        }}
      />
    </>
  )
}

export default App
