import '../../src/datepicker.scss'
import './test-app.scss'

document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
  <div>
    <h1>Datepicker Test App</h1>
    
    <section id="single-standalone">
      <h2>Single Standalone</h2>
    </section>

    <section>
      <h2>Single Input</h2>
      <input id="single-input" />
    </section>

    <section id="range-standalone">
      <h2>Date Range Standalone</h2>
    </section>

    <section>
      <h2>Date Range Inputs</h2>
      <div id="range-inputs-container">
        <input id="range-input-start" />
        <input id="range-input-end" />
      </div>
    </section>
  </div>
`
