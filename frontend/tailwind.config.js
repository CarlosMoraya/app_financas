
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#6b7280',
        background: '#f9fafb',
        surface: '#ffffff',
        error: '#dc2626',
        warning: '#f59e0b',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
}
