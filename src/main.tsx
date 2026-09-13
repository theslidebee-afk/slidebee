import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-redirect direct browser paths to HashRouter format (e.g. /templates -> /#/templates)
if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/' && !window.location.hash) {
  const target = '/#' + window.location.pathname + window.location.search;
  window.history.replaceState(null, '', target);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
