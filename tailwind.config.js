import { colors } from "./src/config/colors";
import { measures } from "./src/config/measures";

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        primary: ["Montserrat"],
      },
      fontSize: measures,
      borderWidth: measures,
      borderRadius: measures,
      iconSize: measures,
      lineHeight: {
        "pattern": '1.2'
      },
      backgroundImage: {
        'gradient-linear-primary':
          'linear-gradient(90deg, #FFC83D 0%, #FFD84D 35%, #FFB22C 70%, #FF8A1F 100%)',

        'gradient-linear-secundary':
          'linear-gradient(90deg, #FFCF40 0%, #FFC83D 30%, #FFA726 65%, #FF8A1F 100%)',

        'gradient-conic-primary':
          'conic-gradient(from 180deg at 50% 50%, #FFC83D 0deg, #FFD84D 90deg, #FFB22C 210deg, #FF8A1F 320deg, #FFC83D 360deg)',

        'gradient-conic-secundary':
          'conic-gradient(from 0deg at 50% 50%, #FF8A1F 0deg, #FFB22C 120deg, #FFD84D 240deg, #FFC83D 360deg)',
      },
      boxShadow: {
        primary: '0 4px 8px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
};
