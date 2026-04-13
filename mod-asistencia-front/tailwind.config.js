export const darkMode = 'class';
export const theme = {
  extend: {
    keyframes: {
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      'scale-in': {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
    },
    animation: {
      'fade-in': 'fade-in 0.2s ease-out',
      'scale-in': 'scale-in 0.2s ease-out',
    },
  },
};
export const plugins = [];