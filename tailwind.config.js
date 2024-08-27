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
        'gradient-linear-primary': 'linear-gradient(90deg, #FF4444 0%, #AF49FF 34%, #3B37FF 69%, #FC4040 100%)',
        'gradient-linear-secundary': 'linear-gradient(90deg, #FF2727 0%, #243AFF 50%, #FF12E7 98%)',
        'gradient-conic-primary': 'conic-gradient(from 180deg at 51% -44%, #FF0000 0%, #00C2FF 51%, #FF00E5 100%)',
        'gradient-conic-secundary': 'conic-gradient(from 0deg at 50% 50%, #FF0000 0%, #1400FF 100%)',
      },
      boxShadow: {
        primary: '0 4px 8px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
};
