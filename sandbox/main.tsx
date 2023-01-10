import React from 'react'
import ReactDOM from 'react-dom/client'
import {RecoilRoot} from 'recoil'
import NewApp from './NewApp'
import './main.scss'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <NewApp />
    </RecoilRoot>
  </React.StrictMode>
)
