/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        card: "#1E293B",
        primary: "#6366F1",
        secondary: "#8B5CF6",
        accent: "#06B6D4",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 15px rgba(99, 102, 241, 0.4)",
      },
    },
  },
  plugins: [],
}
