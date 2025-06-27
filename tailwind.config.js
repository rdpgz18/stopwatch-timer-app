/** @type {import('tailwindcss').Config} */
module.exports = {
  // Pastikan untuk memindai file HTML dan JS Anda untuk kelas Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Mengaktifkan dark mode berdasarkan kelas 'dark' di HTML
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'], // Contoh font mono, tambahkan dari Google Fonts jika mau
      },
    },
  },
  plugins: [],
}

