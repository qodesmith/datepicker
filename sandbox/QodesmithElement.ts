import datepicker from '../src/datepicker'

export default class QodesmithElement extends HTMLElement {
  root: ShadowRoot
  div: HTMLDivElement
  input: HTMLInputElement
  directChild: HTMLDivElement
  picker: ReturnType<typeof datepicker> | undefined

  constructor() {
    super()
    this.root = this.attachShadow({mode: 'open'})
    this.root.innerHTML = `
      <div id="qodesmith-custom-elemen-div" style="border: 1px dashed">
        <div>Qodesmith Custom Element</div>
        <input id="qodesmith-custom-element-input type="text" />
      </div>
      <div id="direct-shadow-child">I'm a shadow dom child</div>
    `
    this.div = this.root.querySelector('div')!
    this.input = this.root.querySelector('input')!
    this.directChild = this.root.querySelector('#direct-shadow-child')!
  }

  connectedCallback() {
    this.picker = datepicker(this.directChild)
  }
}

// Add this custom element to the global registry once.
customElements.define('qodesmith-element', QodesmithElement)
