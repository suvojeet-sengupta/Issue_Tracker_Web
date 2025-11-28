tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                // Primary color inspired by a refined, modern blue/purple
                'brand': {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6', // New: Violet/Purple for a more modern, iOS-like feel
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2a0e62',
                },
                // Refined slate for better contrast and modern feel
                'slate': {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#080c14',
                },
                glass: {
                    100: 'rgba(255, 255, 255, 0.4)',
                    200: 'rgba(255, 255, 255, 0.7)',
                    300: 'rgba(255, 255, 255, 0.9)',
                    border: 'rgba(255, 255, 255, 0.5)',
                }
            },
            // Custom animations for a smoother, iOS-like feel
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'slideUp': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-up': { // New, more subtle slide-in
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': { // New, simple fade-in
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-in-up': 'slide-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                'fade-in': 'fade-in 0.3s ease-out forwards',
            },
        },
    },
}
