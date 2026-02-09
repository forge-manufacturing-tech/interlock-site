/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Factory Industrial Dark Theme
                industrial: {
                    // Copper/Rust accent - primary brand color
                    // UPDATED: Safety Orange (#FF6B00) palette
                    copper: {
                        50: '#fff3e0',
                        100: '#ffe0b2',
                        200: '#ffcc80',
                        300: '#ffb74d',
                        400: '#ffa726',
                        500: '#ff6b00',  // Main accent (Safety Orange)
                        600: '#e65100',
                        700: '#bf360c',
                        800: '#dd2c00',
                        900: '#bf360c',
                    },
                    // Steel/Metal grays - for backgrounds and surfaces
                    steel: {
                        50: '#f8f9fa',
                        100: '#e9ecef',
                        200: '#c8cdd2',
                        300: '#a8b0b8',
                        400: '#6c757d',
                        500: '#495057',
                        600: '#343a40',
                        700: '#2b2f35',
                        800: '#1f2228',  // Main background
                        900: '#13151a',  // Darker elements
                        950: '#0a0b0e',  // Deepest black
                    },
                    // Concrete - for borders and dividers
                    concrete: {
                        DEFAULT: '#3a3d42',
                        light: '#4a4e54',
                        dark: '#2a2d32',
                    },
                    // Warning/Caution yellow
                    caution: {
                        DEFAULT: '#ffc107',
                        dark: '#ff9800',
                    },
                    // Success/Active green
                    active: {
                        DEFAULT: '#4caf50',
                        dark: '#388e3c',
                    },
                    // Error/Alert red
                    alert: {
                        DEFAULT: '#f44336',
                        dark: '#d32f2f',
                    },
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow-copper': '0 0 20px rgba(204, 103, 49, 0.3)',
                'glow-copper-lg': '0 0 30px rgba(204, 103, 49, 0.5)',
                'inset-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
            },
        },
    },
    plugins: [],
}
