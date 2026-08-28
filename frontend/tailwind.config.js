/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kijani: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        emeraldGlow: '#10b981',
        cyanGlow: '#06b6d4',
        sapphire: {
          800: '#0f172a',
          900: '#0a101d',
          950: '#030712'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-sm': '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass': '0 16px 40px 0 rgba(0, 0, 0, 0.35), inset 0 1px 2px 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 25px 60px -15px rgba(0, 0, 0, 0.6), inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)',
        'neon-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.5), 0 0 10px rgba(16, 185, 129, 0.3)',
        'neon-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.5), 0 0 10px rgba(6, 182, 212, 0.3)',
        'neon-purple': '0 0 25px -5px rgba(168, 85, 247, 0.5)',
        '3d-card': '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-fast': 'float 3.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.05)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
