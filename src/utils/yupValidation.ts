import { yupEnglishLocale } from "src/languages/yupLanguages/yupEnglish";
import { yupPortugueseLocale } from "src/languages/yupLanguages/yupPortuguese";
import * as Yup from "yup";

export const setLocaleYup = (language: string) => {
  switch (language) {
    case "us":
      Yup.setLocale(yupEnglishLocale);
      break;
    default:
      Yup.setLocale(yupPortugueseLocale);
  }
};

export default Yup;
