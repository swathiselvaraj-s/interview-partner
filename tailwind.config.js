/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: '#DABBE0',
        'soft-sky': '#BED1E3',
        flamingo: '#EEBFD1',
        mauve: '#ECAAC2',
        denim: '#93AECA',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(147, 174, 202, 0.15)',
        'hover': '0 8px 30px rgba(147, 174, 202, 0.25)',
      },
    },
  },
  plugins: [],
}