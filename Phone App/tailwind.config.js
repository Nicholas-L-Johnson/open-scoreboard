/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
                  primary: '#161622'
                },
              fontFamily:{
                pthin: ["Poppins-Thin", "sans-serif"],
                pextralight: ["Poppins-ExtraLight", "sans-serif"],
                plight: ["Poppins-Light", "sans-serif"],
                pregular: ["Poppins-Regular", "sans-serif"],
                pmedium: ["Poppins-Medium", "sans-serif"],
                psemibold: ["Poppins-SemiBold", "sans-serif"],
                pbold: ["Poppins-Bold", "sans-serif"],
                pextrabold: ["Poppins-ExtraBold", "sans-serif"],
                pblack: ["Poppins-Black", "sans-serif"],
              },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./services/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//           primary: '#161622'
//         },
//       fontFamily:{
//         pthin: ["Poppins-Thin", "sans-serif"],
//         pextralight: ["Poppins-ExtraLight", "sans-serif"],
//         plight: ["Poppins-Light", "sans-serif"],
//         pregular: ["Poppins-Regular", "sans-serif"],
//         pmedium: ["Poppins-Medium", "sans-serif"],
//         psemibold: ["Poppins-SemiBold", "sans-serif"],
//         pbold: ["Poppins-Bold", "sans-serif"],
//         pextrabold: ["Poppins-ExtraBold", "sans-serif"],
//         pblack: ["Poppins-Black", "sans-serif"],
//       },
//     },
//   },
//   plugins: [],
// }
