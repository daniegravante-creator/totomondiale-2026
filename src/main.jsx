import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#0f2015',
          color: '#fff',
          border: '1px solid #1a3a20',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#00ff66', secondary: '#0f2015' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#0f2015' } },
        duration: 3500,
      }}
    />
  </React.StrictMode>
)
