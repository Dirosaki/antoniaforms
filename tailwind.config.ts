import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f6",
          100: "#d8efe7",
          600: "#1f7a63",
          700: "#195f4f"
        }
      }
    }
  },
  plugins: []
};

export default config;
