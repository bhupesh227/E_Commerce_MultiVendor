
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    "../admin-ui/src/**/*.{ts,tsx,js,jsx}",
    "../../packages/components/**/*.{ts,tsx,js,jsx}",
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',

  ],
  theme: {
    extend: {
      pontFamily: {
        Poppins: ['var(--font-poppins)'],
      },
    },
  },
  plugins: [],
};
