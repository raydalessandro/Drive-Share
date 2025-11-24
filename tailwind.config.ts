import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // DRIVE SHARE - Colori Moto 🏍️
        vercel: {
          // Neri e grigi asfalto
          black: "#000000",
          "gray-900": "#0a0a0a",
          "gray-800": "#171717",
          "gray-700": "#262626",
          "gray-600": "#404040",
          "gray-500": "#525252",
          "gray-400": "#737373",
          "gray-300": "#a3a3a3",
          "gray-200": "#d4d4d4",
          "gray-100": "#f5f5f5",

          // ROSSO MOTO (sostituisce purple)
          purple: "#dc2626",        // ⬅️ ROSSO MOTO
          "purple-dark": "#991b1b", // ⬅️ ROSSO SCURO
          
          // Altri colori Drive Share
          blue: "#0ea5e9",          // Info/Links
          "blue-dark": "#0284c7",
          green: "#22c55e",         // Success
          "green-dark": "#16a34a",
          orange: "#f97316",        // Warning/Sunset rides
          "orange-dark": "#ea580c",
          red: "#ef4444",           // Danger/Primary
          "red-dark": "#dc2626",

          white: "#ffffff",
          "off-white": "#fafafa",
        },
        
        // Colori Drive Share custom
        moto: {
          red: "#dc2626",
          "red-light": "#ef4444",
          "red-dark": "#991b1b",
          black: "#000000",
          asphalt: "#262626",
          "road-line": "#fbbf24",
          chrome: "#e5e7eb",
          leather: "#7c2d12",
        },
        
        // Override goon con colori moto
        goon: {
          purple: "#dc2626",        // ⬅️ ROSSO invece di purple
          "dark-purple": "#991b1b", // ⬅️ ROSSO SCURO
          "deep-bg": "#000000",
          gray: "#737373",
          charcoal: "#262626",
          white: "#ffffff",
          "dark-charcoal": "#171717",
        },
      },
      
      // Gradienti custom
      backgroundImage: {
        'gradient-speed': 'linear-gradient(135deg, #dc2626 0%, #000000 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f97316 0%, #dc2626 50%, #7c2d12 100%)',
        'gradient-chrome': 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
      },
      
      // Ombre rosse
      boxShadow: {
        'moto': '0 10px 40px rgba(220, 38, 38, 0.2)',
        'moto-lg': '0 20px 60px rgba(220, 38, 38, 0.3)',
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        // Animazioni moto
        "speed-lines": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "rev-engine": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "speed": "speed-lines 2s ease-in-out infinite",
        "rev": "rev-engine 0.3s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
