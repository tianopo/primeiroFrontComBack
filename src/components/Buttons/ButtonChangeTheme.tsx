// buttonTrocarTema.tsx
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "src/hooks/useTheme";
import { ITheme } from "src/interfaces/ITheme";
import "./Button.css";

export const ButtonChangeTheme = () => {
  const { theme, setTheme } = useTheme();
  const options: { theme: keyof ITheme; icone: JSX.Element }[] = [
    { theme: "light", icone: <Sun size="20px" weight="fill" className="text-write-secundary" /> },
    { theme: "dark", icone: <Moon size="20px" weight="fill" className="text-icone-dark" /> },
  ];

  const alternarTheme = (newTheme: keyof ITheme) => {
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      type="button"
      className={`
        button_trocar_tema-light
        flex
        h-fit
        w-10
        justify-center
        rounded-6
        border-1
        p-1
      `}
      onClick={() => {
        const proximoThemeIndex =
          (options.findIndex((option) => option.theme === theme) + 1) % options.length;
        alternarTheme(options[proximoThemeIndex].theme);
      }}
    >
      {options.find((option) => option.theme === theme)?.icone}
    </button>
  );
};
