import React ,{ StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/inter'
import ErrorBoundary from "./components/ErrorBoundary";
import App from './App.jsx'        // Make sure extension is .jsx

createRoot(document.getElementById('root')).render(
                   
   <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
  
)