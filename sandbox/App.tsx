import {useEffect} from 'react'
import datepicker from '../src/datepicker'
import QodesmithElement from './QodesmithElement'
import oldDatepicker from '../src/old-datepicker'

// @ts-expect-error We set this globally so it can render.
window.QodesmithElement = QodesmithElement

function App() {
  const ua = window.navigator.userAgent

  useEffect(() => {
    // const picker = datepicker('.dp-test')
    const oldPicker = oldDatepicker('.old-dp-input', {alwaysShow: true})

    return () => {
      oldPicker.remove()
    }
  }, [])

  return (
    <>
      <div>Hello world!</div>
      <div>
        UA: <code>{ua}</code>
      </div>
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
      <div className="dp-test" dangerouslySetInnerHTML={{__html: ''}} />
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
