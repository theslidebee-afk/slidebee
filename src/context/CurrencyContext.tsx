import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (inrAmount: number, usdAmount?: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const detectIsIndia = (): boolean => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (
      timeZone.includes('Calcutta') ||
      timeZone.includes('Kolkata') ||
      timeZone.includes('Asia/Kolkata')
    ) {
      return true;
    }

    if (new Date().getTimezoneOffset() === -330) {
      return true;
    }

    const locale = (navigator.language || '').toLowerCase();
    const languages = (navigator.languages || []).map(l => l.toLowerCase());
    const allLocales = [locale, ...languages];

    const indianLocaleMatches = ['en-in', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'pa', 'bn'];
    if (allLocales.some(l => indianLocaleMatches.some(match => l.includes(match)))) {
      return true;
    }
  } catch {
    // Default to false if check fails
  }
  return false;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // 1. Check if user already manually selected currency in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('slidebee_currency') as Currency;
      if (saved === 'INR' || saved === 'USD') {
        return saved;
      }
      // 2. Synchronous client heuristic (India -> INR, otherwise USD)
      return detectIsIndia() ? 'INR' : 'USD';
    }
    return 'USD';
  });

  useEffect(() => {
    // If user has an explicit manual selection saved, honor it
    const saved = localStorage.getItem('slidebee_currency') as Currency;
    if (saved === 'INR' || saved === 'USD') {
      return;
    }

    // 3. Asynchronous Cloudflare edge geo-detection via /cdn-cgi/trace
    fetch('/cdn-cgi/trace')
      .then((res) => {
        if (!res.ok) throw new Error('Trace unavailable');
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('loc=')) {
            const countryCode = line.split('=')[1]?.trim()?.toUpperCase();
            if (countryCode === 'IN') {
              setCurrencyState('INR');
            } else if (countryCode) {
              setCurrencyState('USD');
            }
            break;
          }
        }
      })
      .catch(() => {
        // Fallback already handled by synchronous initial state
      });
  }, []);

  const handleSetCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    try {
      localStorage.setItem('slidebee_currency', cur);
    } catch {
      // Ignore storage errors
    }
  };

  const formatPrice = (inrAmount: number, usdAmount?: number): string => {
    if (currency === 'INR') {
      return `₹${Math.round(inrAmount).toLocaleString('en-IN')}`;
    }

    // Currency is USD
    if (usdAmount !== undefined && usdAmount !== null && !isNaN(usdAmount)) {
      return `$${usdAmount}`;
    }

    // If passed amount is already small (e.g. <= 100), treat as USD amount directly
    if (inrAmount <= 100) {
      return `$${inrAmount}`;
    }

    // Clean price mapping based on standard INR tier brackets
    if (inrAmount <= 299) return '$3.99';
    if (inrAmount <= 399) return '$5';
    if (inrAmount <= 499) return '$6.99';
    if (inrAmount <= 799) return '$9.99';
    if (inrAmount <= 999) return '$12.99';
    if (inrAmount <= 1499) return '$19';
    if (inrAmount <= 2299) return '$29';
    if (inrAmount <= 3499) return '$45';
    if (inrAmount <= 3899) return '$49';
    if (inrAmount <= 5999) return '$75';

    return `$${Math.round(inrAmount / 80)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatPrice,
        symbol: currency === 'INR' ? '₹' : '$',
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
