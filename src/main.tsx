import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-redirect direct browser paths to HashRouter format and capture Supabase recovery tokens
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const search = window.location.search;

  if (hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('action=reset') || search.includes('action=reset') || search.includes('token=') || hash.includes('token=')) {
    sessionStorage.setItem('slidebee_password_recovery', 'true');
    const searchParams = new URLSearchParams(search);
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);
    for (const [k, v] of hashParams.entries()) {
      searchParams.set(k, v);
    }
    searchParams.set('action', 'reset');
    const target = '/#/login?' + searchParams.toString();
    if (!hash.startsWith('#/login')) {
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
