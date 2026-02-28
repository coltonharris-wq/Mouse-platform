/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mouse: {
          navy: "#0B1F3B",
          teal: "#0F6B6E",
          orange: "#F97316",
          green: "#16A34A",
          red: "#DC2626",
          offwhite: "#F8FAFC",
          charcoal: "#1E293B",
          slate: "#CBD5E1",
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
