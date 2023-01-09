import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {RecoilRoot} from 'recoil'
import NewApp from './NewApp'
import './main.scss'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <NewApp />
      <App />
    </RecoilRoot>
  </React.StrictMode>
)
