/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#1e1e2e',
          hover: '#313244',
          active: '#45475a',
          text: '#cdd6f4',
          muted: '#6c7086',
        },
        panel: {
          bg: '#f8f9fa',
          border: '#dee2e6',
        },
      },
      spacing: {
        'sidebar': '56px',
        'sidebar-expanded': '200px',
        'panel': '360px',
      },
    },
  },
  plugins: [],
}
