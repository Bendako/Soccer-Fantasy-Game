/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',      // Small phones
        'sm': '640px',      // Large phones / small tablets
        'md': '768px',      // Tablets
        'lg': '1024px',     // Small laptops
        'xl': '1280px',     // Large laptops
        '2xl': '1536px',    // Desktops
        '3xl': '1920px',    // Large desktops
        
        // Custom breakpoints for specific components
        'pitch-sm': '480px',  // Formation pitch mobile
        'pitch-md': '768px',  // Formation pitch tablet
        'pitch-lg': '1024px', // Formation pitch desktop
        
        // Height-based breakpoints for mobile landscape
        'h-sm': { 'raw': '(max-height: 640px)' },
        'h-md': { 'raw': '(max-height: 768px)' },
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      fontSize: {
        'xxs': '0.625rem',
      },
      
      animation: {
        'bounce-subtle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // Custom utilities for touch interactions
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [
    // Custom plugin for responsive utilities
    function({ addUtilities }) {
      addUtilities({
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.safe-area-inset': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    }
  ],
} 