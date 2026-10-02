import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Auto-redirect direct browser paths to HashRouter format and capture recovery tokens
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const search = window.location.search;
  const pathname = window.location.pathname;

  const isOAuthCallback =
    pathname.startsWith('/auth/callback') ||
    pathname === '/auth/callback' ||
    hash.includes('/auth/callback') ||
    hash.includes('id_token=') ||
    hash.includes('access_token=') ||
    search.includes('id_token=') ||
    search.includes('access_token=') ||
    search.includes('code=');

  if (isOAuthCallback) {
    // Clear any stale recovery flags from previous aborted attempts
    sessionStorage.removeItem('slidebee_password_recovery');
    sessionStorage.removeItem('slidebee_recovery_token');
    sessionStorage.removeItem('slidebee_recovery_email');
  } else if (
    hash.includes('type=recovery') ||
    search.includes('type=recovery') ||
    hash.includes('action=reset') ||
    search.includes('action=reset') ||
    /(?:^|[?&#])token=[^&]+/.test(hash) ||
    /(?:^|[?&#])token=[^&]+/.test(search)
  ) {
    sessionStorage.setItem('slidebee_password_recovery', 'true');
    const searchParams = new URLSearchParams(search);
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);
    for (const [k, v] of hashParams.entries()) {
      searchParams.set(k, v);
    }
    searchParams.set('action', 'reset');
    const target = '/login?' + searchParams.toString();
    window.history.replaceState(null, '', target);
  } else if (hash.startsWith('#/')) {
    // Gracefully normalize legacy hash URLs (e.g. /#/blog/1 -> /blog/1)
    const cleanPath = hash.slice(1);
    window.history.replaceState(null, '', cleanPath);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
