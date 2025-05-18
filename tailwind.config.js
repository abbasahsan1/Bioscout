/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DE954',        // Primary Green
        secondary: '#282828',      // Secondary Background (inputs, footer)
        background: '#1A1A1A',     // Primary Background
        panel: '#2D2D2D',          // UI panels/cards
        panelDark: '#3A3A3A',      // Darker UI panels/cards
        textPrimary: '#FFFFFF',    // Primary Text
        textSecondary: '#CCCCCC',  // Secondary Text
        textTertiary: '#AAAAAA',   // Tertiary Text (placeholder, secondary labels)
        textMuted: '#999999',      // Muted Text (navigation links, small annotations)
        accent: '#1DE954',         // Accent Green
        border: '#555555',         // Border/Divider Color
        blue: '#2196F3',           // Semantic Blue
        orange: '#FF9800',         // Semantic Orange
        purple: '#9C27B0',         // Semantic Purple
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}