import {useEffect} from 'react'
import datepicker from '../src/datepicker'
import QodesmithElement from './QodesmithElement'

// @ts-expect-error We set this globally so it can render.
window.QodesmithElement = QodesmithElement

function App() {
  useEffect(() => {
    const picker = datepicker('.dp-test', {id: 1})
  }, [])

  return (
    <>
      <div>Hello world!</div>
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
