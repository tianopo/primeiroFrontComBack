import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLocaleYup } from "src/utils/yupValidation";
import "./Button.css";

interface IButtonChangeLanguage {
  menuBottom?: boolean;
}

export const ButtonChangeLanguage = ({ menuBottom }: IButtonChangeLanguage) => {
  const options = [
    {
      value: "ptbr",
      flag: "/flags/br.svg",
    },
    {
      value: "us",
      flag: "/flags/us.svg",
    },
  ];

  const getStartLanguage = () => {
    const languageSave = localStorage.getItem("language");
    return languageSave || options[0].value;
  };

  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(getStartLanguage());
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    setMenuOpen(false);
    localStorage.setItem("language", newLanguage);
  };

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    setLocaleYup(selectedLanguage);
  }, [selectedLanguage, i18n]);

  return (
    <div className="relative inline-block w-auto duration-300">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        onBlur={() =>
          setTimeout(() => {
            setMenuOpen(false);
          }, 100)
        }
        className={`
        z-10
        flex
        items-center
        justify-between
        rounded-6
        border-1
        border-solid
        pl-1.5
        pr-1
        outline-none
        hover:opacity-60
        `}
      >
        <img
          src={options.find((option) => option.value === selectedLanguage)?.flag}
          alt={`Bandeira de ${options.find((opcao) => opcao.value === selectedLanguage)?.value}`}
          className="h-7 w-7"
        />
        {menuOpen ? (
          <CaretDown className="h-4 w-4 text-white" />
        ) : (
          <CaretRight className="h-4 w-4 text-white" />
        )}
      </button>
      {menuOpen && (
        <div
          className={`
          absolute
          mt-2
          w-16
          rounded-6
          bg-white
          shadow-lg
        ${menuBottom ? "bottom-10" : ""}`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={`
              flex
              w-full
              justify-center
              hover:rounded-6
              hover:bg-selected-primary
              `}
              onClick={() => changeLanguage(option.value)}
            >
              <img src={option.flag} alt={option.value} className="h-7 w-7" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
