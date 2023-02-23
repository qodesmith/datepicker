import datepicker from '../src/datepicker'
import {DatepickerInstance} from '../src/types'

export default function ShadowDOMExample() {
  return (
    <section>
      <h3>Shadow DOM Example</h3>
      <div
        className="shadow-dom-test"
        dangerouslySetInnerHTML={{
          __html: '<qodesmith-element></qodesmith-element>',
        }}
      />
    </section>
  )
}

class QodesmithElement extends HTMLElement {
  root: ShadowRoot
  input: HTMLInputElement
  directChild: HTMLDivElement
  picker: DatepickerInstance | undefined

  constructor() {
    super()
    this.root = this.attachShadow({mode: 'open'})

    /**
     * Shadow DOM's don't share styles with the document - they maintain their
     * own "scope". To get the calendar styled, we find the CSS text from the
     * document.head and put it into the custom element.
     */
    const styleNode = Array.from(document.head.querySelectorAll('style')).find(
      node => {
        const filePath = node.getAttribute('data-vite-dev-id')
        return filePath?.endsWith('/datepicker.scss')
      }
    )

    this.root.innerHTML = `
      <style>
        ${styleNode?.textContent ?? ''}
        input {width: 100%;}
      </style>
      <input id="qodesmith-custom-element-input" type="text" placeholder="qodesmith-custom-element-input" />
      <div id="direct-shadow-child">I'm a shadow dom child div</div>
    `
    this.input = this.root.querySelector('input')!
    this.directChild = this.root.querySelector('#direct-shadow-child')!
  }

  connectedCallback() {
    this.picker = datepicker(this.directChild, {alwaysShow: false})
  }
}

if (!customElements.get('qodesmith-element')) {
  // Add this custom element to the global registry once.
  customElements.define('qodesmith-element', QodesmithElement)
}

// @ts-expect-error We set this globally so it can render.
window.QodesmithElement = QodesmithElement
