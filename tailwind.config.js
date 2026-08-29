/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A1B30',
          900: '#0F2A4A',
          800: '#163A63',
          700: '#1F4C80',
          600: '#2D5F9A',
          500: '#3E74B3',
        },
        amber: {
          700: '#8F6524',
          600: '#B5852E',
          500: '#C99A3C',
          400: '#DDB868',
          300: '#E9CD94',
          100: '#F6E9D2',
          50: '#FBF3E4',
        },
        teal: {
          700: '#0E5C56',
          600: '#137A70',
          500: '#189C8E',
          400: '#3FBBAC',
          100: '#DCF3EF',
          50: '#F0FAF8',
        },
        surface: {
          DEFAULT: '#F5F6F9',
          raised: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10, 27, 48, 0.04), 0 8px 24px -12px rgba(10, 27, 48, 0.10)',
        card: '0 1px 1px rgba(10,27,48,0.03), 0 1px 3px rgba(10,27,48,0.04)',
        elevated: '0 4px 10px rgba(10, 27, 48, 0.06), 0 20px 40px -18px rgba(10, 27, 48, 0.22)',
        glow: '0 0 0 1px rgba(201, 154, 60, 0.15), 0 8px 24px -8px rgba(201, 154, 60, 0.35)',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(180deg, #0F2A4A 0%, #0A1B30 100%)',
        'amber-gradient': 'linear-gradient(90deg, #DDB868 0%, #C99A3C 55%, #B5852E 100%)',
        'canvas-radial':
          'radial-gradient(1200px 480px at 12% -10%, rgba(31,76,128,0.06), transparent 60%), radial-gradient(900px 420px at 100% 0%, rgba(201,154,60,0.05), transparent 55%)',
      },
      keyframes: {
        'overlay-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'panel-in': {
          from: { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        'panel-out': {
          from: { opacity: 1, transform: 'translateY(0) scale(1)' },
          to: { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-in-right': {
          from: { opacity: 0, transform: 'translateX(-8px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'overlay-in': 'overlay-in 180ms ease-out',
        'panel-in': 'panel-in 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'panel-out': 'panel-out 160ms ease-in forwards',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'fade-in': 'fade-in 240ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
