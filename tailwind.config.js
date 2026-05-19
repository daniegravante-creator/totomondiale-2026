/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tm-bg':           '#050f08',
        'tm-card':         '#0f2015',
        'tm-card-hover':   '#152a1c',
        'tm-accent':       '#00ff66',
        'tm-accent-dim':   '#00cc52',
        'tm-accent-dark':  '#003d19',
        'tm-border':       '#1a3a20',
        'tm-border-bright':'#2d6035',
        'tm-muted':        '#6b8f72',
        'tm-muted-light':  '#9ab89e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,255,102,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(0,255,102,0.15)' },
        },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
