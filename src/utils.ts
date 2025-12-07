
export const formatCurrency = (value: number) => {
  // Use browser locale, default to US if undefined
  const locale = navigator.language || 'en-US';
  
  // Simple heuristic to determine currency code from locale region
  // This allows "India-first" behavior (₹) if the browser is set to English (India) or Hindi
  let currency = 'USD';
  const region = locale.split('-')[1] || locale.split('-')[0]; // e.g. 'US' from 'en-US' or 'IN' from 'en-IN'

  if (locale.match(/IN/i)) currency = 'INR';
  else if (locale.match(/GB/i)) currency = 'GBP';
  else if (locale.match(/(DE|FR|IT|ES|NL|IE)/i) || locale.includes('EUR')) currency = 'EUR';
  else if (locale.match(/JP/i)) currency = 'JPY';
  else if (locale.match(/AU/i)) currency = 'AUD';
  else if (locale.match(/CA/i)) currency = 'CAD';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    // Fallback
    return '$' + value.toLocaleString();
  }
};
