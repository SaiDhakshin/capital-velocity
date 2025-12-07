// postcss.config.cjs
module.exports = {
    plugins: {
        '@tailwindcss/postcss': {},
        // autoprefixer not required in Tailwind v4; add if you need:
        // autoprefixer: {},
    },
};
