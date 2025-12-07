// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Crimson Text"', "serif"],
                serif: ['"Playfair Display"', "serif"],
                body: ['"Crimson Text"', "serif"],
            },
            colors: {
                paper: {
                    DEFAULT: "#fdfbf7",
                    dark: "#f3f1e8",
                    contrast: "#ffffff",
                },
                ink: {
                    DEFAULT: "#1c1917",
                    light: "#44403c",
                    faint: "#a8a29e",
                },
                accent: {
                    green: "#15803d",
                    red: "#b91c1c",
                    blue: "#1d4ed8",
                    gold: "#b45309",
                },
            },
        },
    },
    plugins: [],
};
