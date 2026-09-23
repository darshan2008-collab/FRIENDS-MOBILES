// List of supported countries with dial codes, flags, and phone validation rules
export const COUNTRY_CODES = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10, pattern: '^[6-9]\\d{9}$', placeholder: '98765 43210', hint: '10-digit number starting with 6-9' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', minDigits: 9, maxDigits: 9, pattern: '^5\\d{8}$', placeholder: '50 123 4567', hint: '9-digit number starting with 5' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10, pattern: '^\\d{10}$', placeholder: '(555) 123-4567', hint: '10-digit mobile number' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minDigits: 10, maxDigits: 10, pattern: '^\\d{10}$', placeholder: '(555) 123-4567', hint: '10-digit mobile number' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minDigits: 10, maxDigits: 10, pattern: '^7\\d{9}$', placeholder: '7123 456789', hint: '10-digit number starting with 7' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', minDigits: 8, maxDigits: 8, pattern: '^[89]\\d{7}$', placeholder: '8123 4567', hint: '8-digit number starting with 8 or 9' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', minDigits: 9, maxDigits: 10, pattern: '^1\\d{8,9}$', placeholder: '12 345 6789', hint: '9-10 digit mobile number' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', minDigits: 9, maxDigits: 9, pattern: '^5\\d{8}$', placeholder: '50 123 4567', hint: '9-digit number starting with 5' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', minDigits: 8, maxDigits: 8, pattern: '^[3567]\\d{7}$', placeholder: '3312 3456', hint: '8-digit mobile number' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', minDigits: 8, maxDigits: 8, pattern: '^[569]\\d{7}$', placeholder: '9123 4567', hint: '8-digit mobile number' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', minDigits: 8, maxDigits: 8, pattern: '^9\\d{7}$', placeholder: '9123 4567', hint: '8-digit number starting with 9' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', minDigits: 8, maxDigits: 8, pattern: '^3\\d{7}$', placeholder: '3912 3456', hint: '8-digit number' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minDigits: 9, maxDigits: 9, pattern: '^4\\d{8}$', placeholder: '412 345 678', hint: '9-digit number starting with 4' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', minDigits: 9, maxDigits: 9, pattern: '^7\\d{8}$', placeholder: '71 234 5678', hint: '9-digit number starting with 7' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', minDigits: 10, maxDigits: 10, pattern: '^9[78]\\d{8}$', placeholder: '9812 345678', hint: '10-digit number starting with 97/98' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', minDigits: 10, maxDigits: 10, pattern: '^1[3-9]\\d{8}$', placeholder: '1712 345678', hint: '10-digit mobile number' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minDigits: 10, maxDigits: 11, pattern: '^1[567]\\d{8,9}$', placeholder: '151 23456789', hint: 'German mobile number' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', minDigits: 9, maxDigits: 9, pattern: '^[67]\\d{8}$', placeholder: '6 12 34 56 78', hint: '9-digit number starting with 6 or 7' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', minDigits: 9, maxDigits: 10, pattern: '^2\\d{7,8}$', placeholder: '21 123 4567', hint: 'Mobile number starting with 2' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', minDigits: 9, maxDigits: 9, pattern: '^[678]\\d{8}$', placeholder: '71 123 4567', hint: '9-digit mobile number' }
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // India (+91)
