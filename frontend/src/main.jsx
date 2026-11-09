import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'

// Polyfill window.runtime when running outside Wails
if (typeof window !== 'undefined' && !window.runtime) {
  window.runtime = {
    WindowSetSize: () => {},
    WindowMinimise: () => {},
    Quit: () => {},
    BrowserOpenURL: (url) => window.open(url, '_blank'),
    LogPrint: console.log,
  };
}

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
