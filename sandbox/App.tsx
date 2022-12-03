import {useEffect} from 'react'
import datepicker from '../src/datepicker'

function App() {
  useEffect(() => {
    const picker = datepicker('test', {})
  }, [])
  return (
    <>
      <div>Hello world!</div>
      <div dangerouslySetInnerHTML={{__html: '<div class="test"></div>'}} />
    </>
  )
}

export default App
