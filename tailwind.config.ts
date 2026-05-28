import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'accent-red': 'var(--accent-red)',
        'accent-amber': 'var(--accent-amber)',
        text1: 'var(--text1)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
      },
      borderRadius: { xl2: '1rem', xl3: '1.25rem', xl4: '1.5rem' },
      boxShadow: {
        card: '0 2px 20px rgba(0,0,0,0.4)',
        accent: '0 0 20px rgba(124,109,250,0.3)',
        glow: '0 0 40px rgba(124,109,250,0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
export default config
