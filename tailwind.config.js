/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-instrument)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'var(--font-instrument)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          bg: '#0B0A0C',
          surface: '#131114',
          border: '#1E1B1F',
          borderStrong: '#2A2529',
          text: '#F5F2ED',
          sub: '#B5ADA6',
          tert: '#9A938C',
          dim: '#6B6560',
          accent: '#FF5A2B',
          accentHover: '#FF7A52',
          green: '#7A9A4E',
          red: '#4A4348',
        },
        primary: {
          50: '#fff0ea', 100: '#ffd5c4', 200: '#ffb79e', 300: '#ff9a7a',
          400: '#ff7a52', 500: '#ff5a2b', 600: '#ea4b1d', 700: '#d63d12',
          800: '#b53310', 900: '#8f290d',
        },
        dark: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617' },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #FF5A2B 0%, #FF9A7A 55%, #FFB79E 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(255,90,43,0.15) 0%, rgba(255,122,82,0.07) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'letter': 'letterPop 0.5s ease-out both',
        'aurora': 'aurora 12s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        glow: { '0%': { boxShadow: '0 0 20px rgba(255,90,43,0.25)' }, '100%': { boxShadow: '0 0 40px rgba(255,90,43,0.5)' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        letterPop: { '0%': { opacity: '0', transform: 'translateY(15px) scale(0.5)', filter: 'blur(4px)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' } },
        aurora: { '0%, 100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(40px,-30px) scale(1.1)' }, '66%': { transform: 'translate(-30px,20px) scale(0.95)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [],
}
