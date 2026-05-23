/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Rose (SIGNAL) — primary brand accent
        primary: {
          DEFAULT: "#F472B6",
          foreground: "#120810",
          50:  "#FFF0F8",
          100: "#FFD6ED",
          200: "#FFADD9",
          300: "#FF80C3",
          400: "#F899CA",
          500: "#F472B6",
          600: "#E44E9E",
          700: "#C93585",
          800: "#A81F6C",
          900: "#870F55",
        },
        // Signal Gold (ALERT)
        gold: {
          DEFAULT: "#FBBF24",
          foreground: "#120810",
          400: "#FCD34D",
          500: "#FBBF24",
          600: "#D97706",
        },
        // Dusty Lilac (MUTED)
        lilac: {
          DEFAULT: "#8B7BA8",
          300: "#B4A5C8",
          400: "#9D8EBA",
          500: "#8B7BA8",
          600: "#6B5A88",
        },
        // Deep Dark scale — all surfaces built on #120810
        dark: {
          DEFAULT: "#120810",
          50:  "#F9F0F5",  // Ghost Lavender
          100: "#EDE8F3",
          200: "#D5CCDF",
          300: "#B4A5C8",
          400: "#8B7BA8",  // Dusty Lilac
          500: "#4A3557",
          600: "#2E1A3E",
          700: "#231530",
          800: "#1A0E1E",
          900: "#120810",  // Deep Dark
          950: "#080409",
        },
        secondary: {
          DEFAULT: "#8B7BA8",
          foreground: "#F9F0F5",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
