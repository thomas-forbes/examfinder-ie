/** @type {import("prettier").Config} */
module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './apps/web/src/styles/globals.css',
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
}
