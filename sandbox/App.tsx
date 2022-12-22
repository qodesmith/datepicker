import {useEffect, useState} from 'react'
import datepicker from '../src/datepicker'
import QodesmithElement from './QodesmithElement'
// @ts-expect-error - this module loads fine.
import oldDatepicker from '../src/old-datepicker'
import {DatepickerInstance} from '../src/types'

// @ts-expect-error We set this globally so it can render.
window.QodesmithElement = QodesmithElement

function App() {
  const [picker, setPicker] = useState<DatepickerInstance>()
  const [parentElementFontSize, setParentElementFontSize] = useState(1)
  const [size, setSize] = useState(1)
  const [isShowing, setIsShowing] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const handleToggleCalendar = () => {
    isShowing ? picker?.hide() : picker?.show()
    setIsShowing(v => !v)
  }

  window.x = picker

  if (theme === 'light') {
    picker?.calendarContainer.classList.add('light')
  } else {
    picker?.calendarContainer.classList.remove('light')
  }

  // Instantiate Datepicker.
  useEffect(() => {
    const today = new Date()
    const pickerObj = datepicker('.dp-test', {
      alwaysShow: true,
      selectedDate: today,
      disabledDates: [
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth(), 3),
      ],
    })
    setPicker(pickerObj)
    const oldPicker = oldDatepicker('.old-dp-input', {alwaysShow: true})

    return () => {
      oldPicker.remove()
      pickerObj.remove()
    }
  }, [])

  // Set sizing properties on calendar DOM elements.
  if (picker?.calendarContainer) {
    if (picker.calendarContainer.parentElement) {
      picker.calendarContainer.parentElement.style.setProperty(
        'font-size',
        `${parentElementFontSize}em`
      )
    }

    picker.calendarContainer.style.setProperty('--dp-size', `${size}em`)
  }

  const fontSize = picker
    ? getComputedStyle(picker.calendarContainer).fontSize
    : null
  const width = picker ? getComputedStyle(picker.calendarContainer).width : null
  const parentElementFontSizeComputed =
    picker && picker.calendarContainer.parentElement
      ? getComputedStyle(picker.calendarContainer.parentElement).fontSize
      : null

  return (
    <>
      <div>
        'ontouchstart' in window:{' '}
        <code>
          {/* https://bit.ly/3Y9gtnJ */}
          {Boolean('ontouchstart' in document.documentElement).toString()}
        </code>
      </div>
      <div style={{display: 'flex', gap: '2em'}}>
        {/* DATA */}
        <section
          style={{
            border: '1px solid',
            padding: '.5em',
            margin: '.5em',
          }}>
          <h2 style={{margin: 0}}>Data</h2>
          <div>
            <code style={{fontSize: '.75em', color: 'gray'}}>
              getComputedStyle(picker.calendarContainer).fontSize
            </code>
          </div>
          <div>
            <code>.dp-calendar-container</code> font size:{' '}
            <code style={{color: 'lime'}}>{fontSize ?? 'null'}</code>
          </div>
          <br />
          <div>
            <code style={{fontSize: '.75em', color: 'gray'}}>
              getComputedStyle(picker.calendarContainer).width
            </code>
          </div>
          <div>
            <code>.dp-calendar-container</code> width:{' '}
            <code style={{color: 'lime'}}>{width ?? 'null'}</code>
          </div>
          <hr />
          <div>
            Change font size (em) of the calendar{' '}
            <strong>
              <em>container parent element</em>
            </strong>
            :
            <br />
            <input
              type="range"
              step=".01"
              min=".3"
              max="4"
              value={parentElementFontSize}
              onChange={e => setParentElementFontSize(+e.target.value)}
            />{' '}
            <code style={{color: 'lime'}}>
              {parentElementFontSize.toFixed(2)}em,{' '}
              {parentElementFontSizeComputed
                ? Number(
                    parentElementFontSizeComputed.replace('px', '')
                  ).toFixed(2) + 'px'
                : 'null'}
            </code>
            <div style={{display: 'flex', gap: '.5em'}}>
              <button onClick={() => setParentElementFontSize(0.5)}>
                .5em
              </button>
              <button onClick={() => setParentElementFontSize(1)}>1em</button>
              <button onClick={() => setParentElementFontSize(2)}>2em</button>
              <button onClick={() => setParentElementFontSize(3)}>3em</button>
              <button onClick={() => setParentElementFontSize(4)}>4em</button>
            </div>
          </div>
          <hr />
          <div>
            Change the <code>--dp-size</code> value on{' '}
            <code>
              <strong>
                <em>.dp-calendar-container</em>
              </strong>
            </code>
            :
            <br />
            <input
              type="range"
              step=".01"
              min=".1"
              max="3"
              value={size}
              onChange={e => setSize(+e.target.value)}
            />
            <code style={{color: 'lime'}}>{size.toFixed(3) + 'em'}</code>
            <div style={{display: 'flex', gap: '.5em'}}>
              <button onClick={() => setSize(0.5)}>.5em</button>
              <button onClick={() => setSize(0.75)}>.75em</button>
              <button onClick={() => setSize(1)}>1em</button>
              <button onClick={() => setSize(2)}>2em</button>
              <button onClick={() => setSize(3)}>3em</button>
            </div>
          </div>
        </section>

        {/* DATEPICKER */}
        <section style={{background: theme === 'dark' ? '#242424' : '#fff'}}>
          <div style={{marginBottom: '.5em', display: 'flex', gap: '.5em'}}>
            <button
              onClick={() => {
                const {currentDate} = picker!
                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1
                )
                picker?.navigate({date})
              }}>
              &lang;
            </button>
            <button
              onClick={() => {
                const {currentDate} = picker!
                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1
                )
                picker?.navigate({date})
              }}>
              &rang;
            </button>
            <button onClick={handleToggleCalendar}>Show / Hide</button>
            <button onClick={() => picker?.toggleOverlay()}>
              Toggle Overlay
            </button>
            <select
              name="background"
              value={theme}
              onChange={e => setTheme(e.target.value as 'light' | 'dark')}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div
            className="dp-test"
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '0 3em 3em',
            }}
            dangerouslySetInnerHTML={{
              __html: '',
            }}
          />
        </section>

        {/* OLD DATEPICKER */}
        <section>
          <div
            className="old-dp-test"
            dangerouslySetInnerHTML={{
              __html:
                '<input type="text" class="old-dp-input" placeholder="old-dp-input" />',
            }}
          />
        </section>
      </div>
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
