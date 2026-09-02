import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (inrAmount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates & clean price mapping
const conversionRates: Record<Currency, { rate: number; symbol: string; prefix: string }> = {
  INR: { rate: 1, symbol: '₹', prefix: '₹' },
  USD: { rate: 0.012, symbol: '$', prefix: '$' },
  GBP: { rate: 0.0095, symbol: '£', prefix: '£' },
  EUR: { rate: 0.011, symbol: '€', prefix: '€' },
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('INR');

  useEffect(() => {
    // 1. Check if user already manually selected currency
    const saved = localStorage.getItem('slidebee_currency') as Currency;
    if (saved && conversionRates[saved]) {
      setCurrency(saved);
      return;
    }

    // 2. Auto-detect country via Timezone / Locale
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const userLocale = navigator.language || '';

      if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || userLocale.includes('en-IN') || userLocale.includes('hi')) {
        setCurrency('INR');
      } else if (timeZone.includes('London') || userLocale.includes('en-GB')) {
        setCurrency('GBP');
      } else if (timeZone.includes('Europe') || userLocale.includes('fr') || userLocale.includes('de') || userLocale.includes('es') || userLocale.includes('it')) {
        setCurrency('EUR');
      } else {
        // Default to USD for US, Canada, and rest of world
        setCurrency('USD');
      }
    } catch {
      setCurrency('INR');
    }
  }, []);

  const handleSetCurrency = (cur: Currency) => {
    setCurrency(cur);
    localStorage.setItem('slidebee_currency', cur);
  };

  const formatPrice = (inrAmount: number): string => {
    const config = conversionRates[currency];
    if (currency === 'INR') {
      return `${config.prefix}${inrAmount}`;
    }
    // Clean formatted pricing for international (e.g. ₹299 -> $3.99, ₹499 -> $6.99, ₹799 -> $9.99, ₹999 -> $12.99)
    if (inrAmount <= 299) return `${config.prefix}3.99`;
    if (inrAmount <= 499) return `${config.prefix}6.99`;
    if (inrAmount <= 799) return `${config.prefix}9.99`;
    if (inrAmount <= 999) return `${config.prefix}12.99`;
    
    const converted = (inrAmount * config.rate).toFixed(2);
    return `${config.prefix}${converted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatPrice,
        symbol: conversionRates[currency].symbol,
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
