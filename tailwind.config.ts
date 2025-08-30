import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: '#2563eb',
        'brand-dark': '#1d4ed8',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.05)'
      },
    },
  },
  plugins: [],
}
export default config
