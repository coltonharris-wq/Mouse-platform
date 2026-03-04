/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mouse-navy': '#0B1F3B',
        'mouse-teal': '#0F6B6E',
        'mouse-orange': '#F97316',
        'mouse-red': '#DC2626',
        'mouse-green': '#10B981',
        // Updated for better contrast - lighter grays for dark backgrounds
        'mouse-slate': '#E5E7EB', // Was darker, now light gray for dark backgrounds
        'mouse-offwhite': '#F8FAFC',
        'mouse-charcoal': '#1F2937',
      },
      fontSize: {
        // Minimum sizes for 50+ demographic
        'xs': ['14px', { lineHeight: '1.5' }], // Was 12px
        'sm': ['15px', { lineHeight: '1.5' }], // Was 14px
        'base': ['16px', { lineHeight: '1.6' }], // Was 16px, added lineHeight
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
}
