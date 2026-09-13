import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-redirect direct browser paths to HashRouter format and capture Supabase recovery tokens
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const search = window.location.search;

  if (hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('action=reset') || search.includes('action=reset')) {
    sessionStorage.setItem('slidebee_password_recovery', 'true');
    if (!hash.startsWith('#/')) {
      const target = '/#/login?action=reset&' + hash.replace(/^#/, '');
      window.history.replaceState(null, '', target);
    }
  } else if (window.location.pathname && window.location.pathname !== '/' && !window.location.hash) {
    const target = '/#' + window.location.pathname + window.location.search;
    window.history.replaceState(null, '', target);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
