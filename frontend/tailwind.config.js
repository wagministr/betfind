/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateZ(-2000px) scale(0.3) rotateX(20deg)',
          },
          '30%': {
            opacity: '0.3',
            transform: 'translateZ(-1500px) scale(0.5) rotateX(15deg)',
          },
          '60%': {
            opacity: '0.6',
            transform: 'translateZ(-800px) scale(0.8) rotateX(8deg)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateZ(0) scale(1) rotateX(0)',
          },
        },
        horizontalBounce: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        subtlePulse: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(-5px)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-15px)' },
          '75%': { transform: 'translateX(5px)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeInUp: 'fadeInUp 0.5s ease-out',
        popIn: 'popIn 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'horizontal-bounce': 'horizontalBounce 3s ease-in-out infinite',
        'pulse-subtle': 'subtlePulse 3s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} 