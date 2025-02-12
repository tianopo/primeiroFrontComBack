import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ptbrJson from "./translations/ptbr.json";
import usJson from "./translations/us.json";

i18n.use(initReactI18next).init({
  fallbackLng: "ptbr",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    ptbr: ptbrJson,
    us: usJson,
  },
});

export default i18n;
