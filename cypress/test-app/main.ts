import '../../src/datepicker.scss'
import './test-app.scss'
import {datepicker} from '../../src/datepicker'

/**
 * To access datepicker withing the correct context, we first make it a global
 * variable in this app so we can access it in the tests, keeping datepickers
 * context the window used in the tests.
 */
// @ts-expect-error this is for test purposes
window.datepicker = datepicker

document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
  <div>
    <header>
      <h1>Datepicker Test App</h1>
      <div id="unfocus">Click me to unfocus...</div>
    </header>
    
    <section id="input-section">
      <h2>Single Input</h2>
      <input id="single-input" />
    </section>

    <section id="single-standalone">
      <h2>Single Standalone</h2>
    </section>

    <section id="range-input-section">
      <h2>Date Range Inputs</h2>
      <div id="range-inputs-container">
        <input id="range-input-start" />
        <input id="range-input-end" />
      </div>
    </section>

    <section id="range-standalone-section">
      <h2>Date Range Standalone</h2>
      <div id="range-standalone-one"></div>
      <div id="range-standalone-two"></div>
    </section>

    <section id="other-wacky-bits-section">
      <h2>Other Wacky Bits</h2>
      <div id="1-number-id"></div>
      <div class="wacky-div"></div>
      <span class="wacky-span"></span>
      <aside class="wacky-aside"></aside>
    </section>

    <section id="shadow-section">
      <h2>Shadow DOM</h2>
    </section>
  </div>
`
