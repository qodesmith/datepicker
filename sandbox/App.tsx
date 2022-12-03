import {useEffect} from 'react'
import datepicker from '../src/datepicker'

function App() {
  useEffect(() => {
    const picker = datepicker('.test', {})
  }, [])
  return (
    <>
      <div>Hello world!</div>
      <div className="test" dangerouslySetInnerHTML={{__html: ''}} />
    </>
  )
}

export default App
