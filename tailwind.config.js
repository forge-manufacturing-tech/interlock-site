/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
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
            fontFamily: {
                mono: ["JetBrains Mono", "monospace"],
                sans: ["Inter", "sans-serif"],
            },
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
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                // Preserving existing industrial theme just in case, but mapped to new logic if possible or left as is
                industrial: {
                    copper: {
                        50: '#fff3e0',
                        100: '#ffe0b2',
                        200: '#ffcc80',
                        300: '#ffb74d',
                        400: '#ffa726',
                        500: '#ff6b00',
                        600: '#e65100',
                        700: '#bf360c',
                        800: '#dd2c00',
                        900: '#bf360c',
                    },
                    steel: {
                        50: '#f8f9fa',
                        100: '#e9ecef',
                        200: '#c8cdd2',
                        300: '#a8b0b8',
                        400: '#6c757d',
                        500: '#495057',
                        600: '#343a40',
                        700: '#2b2f35',
                        800: '#1f2228',
                        900: '#13151a',
                        950: '#0a0b0e',
                    },
                    concrete: {
                        DEFAULT: '#3a3d42',
                        light: '#4a4e54',
                        dark: '#2a2d32',
                    },
                    caution: {
                        DEFAULT: '#ffc107',
                        dark: '#ff9800',
                    },
                    active: {
                        DEFAULT: '#4caf50',
                        dark: '#388e3c',
                    },
                    alert: {
                        DEFAULT: '#f44336',
                        dark: '#d32f2f',
                    },
                }
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
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "pulse-glow": {
                    "0%, 100%": { opacity: "0.4" },
                    "50%": { opacity: "1" },
                },
                "slide-in": {
                    "0%": { opacity: "0", transform: "translateX(-20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-up": "fade-up 0.8s ease-out forwards",
                "pulse-glow": "pulse-glow 3s ease-in-out infinite",
                "slide-in": "slide-in 0.6s ease-out forwards",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
