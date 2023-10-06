/** @type {import('tailwindcss').Config} */
import { fontFamily as defaultFontFamily } from 'tailwindcss/defaultTheme'
const fontFamily = defaultFontFamily

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
