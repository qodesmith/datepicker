import datepicker from '../src/datepicker'

export default class QodesmithElement extends HTMLElement {
  root: ShadowRoot
  div: HTMLDivElement
  input: HTMLInputElement
  picker: ReturnType<typeof datepicker> | undefined

  constructor() {
    super()
    this.root = this.attachShadow({mode: 'open'})
    this.root.innerHTML = `
      <div id="qodesmith-custom-elemen-div" style="border: 1px dashed">
        <div>Qodesmith Custom Element</div>
        <input id="qodesmith-custom-element-input type="text" />
      </div>
    `
    this.div = this.root.querySelector('div')!
    this.input = this.root.querySelector('input')!
  }

  connectedCallback() {
    this.picker = datepicker('html')
  }
}

// Add this custom element to the global registry once.
customElements.define('qodesmith-element', QodesmithElement)
