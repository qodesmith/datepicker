import React from 'react'
import ReactDOM from 'react-dom/client'
import {RecoilRoot} from 'recoil'
import App from './App'
import './main.scss'
import '../src/datepicker.scss'
import datepicker from '../src/datepicker'

const shouldRenderReactApp = true

if (shouldRenderReactApp) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </React.StrictMode>
  )
}

if (!shouldRenderReactApp) {
  const documentHtml = `
    <h1>Plain HTML App</h1>
    <div class="datepicker-imperative-controls">
      <button data-exempt-id="controls" id="prev">⬅</button>
      <button data-exempt-id="controls" id="next" class="arrow-reversed">⬅</button>
      <button data-exempt-id="controls" id="show">🙉 Show</button>
      <button data-exempt-id="controls" id="hide">🙈 Hide</button>
      <button data-exempt-id="controls" id="toggle-calendar">📆 Toggle Calendar</button>
      <button data-exempt-id="controls" id="toggle-overlay">Toggle Overlay</button>
    </div>
    <div id="dp"></div>
  `
  document.body.innerHTML = documentHtml

  // @ts-expect-error - giving global access to play around in devtools.
  window.datepicker = datepicker

  const picker = datepicker('#dp', {exemptIds: ['controls']})
  const controls = document.querySelector(
    '.datepicker-imperative-controls'
  ) as HTMLDivElement

  if (controls) {
    controls.addEventListener('click', e => {
      const {id} = e.target as HTMLButtonElement

      switch (id) {
        case 'prev':
        case 'next':
          const date = new Date(picker.currentDate)
          date.setMonth(date.getMonth() + (id === 'next' ? 1 : -1))
          picker.navigate(date)
          break
        case 'show':
          picker.show()
          break
        case 'hide':
          picker.hide()
          break
        case 'toggle-calendar':
          picker.toggleCalendar()
          break
        case 'toggle-overlay':
          picker.toggleOverlay()
          break
        default:
          throw 'unrecognized element'
      }
    })
  }
}
