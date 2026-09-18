/* Konfigurasi tema Tailwind (Play CDN) — dipakai semua halaman. */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                forest: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#05714c',
                    800: '#064e3b',
                    900: '#04331f'
                },
                saffron: {
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706'
                },
                chili: {
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626'
                },
                cream: '#fffbf4',
                clay: '#2b211a'
            },
            fontFamily: {
                sans: ['Figtree', 'Segoe UI', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Segoe UI', 'system-ui', 'sans-serif']
            }
        }
    }
};
