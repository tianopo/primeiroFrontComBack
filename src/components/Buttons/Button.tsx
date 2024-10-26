import { ButtonHTMLAttributes, ReactNode } from "react";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const Button = ({ children, ...props }: IButton) => {
  return (
    <button
      className={`h-12 w-full cursor-pointer rounded-20 bg-black px-5 py-4 text-center text-12 font-bold uppercase tracking-widest text-white hover:opacity-70 ${props.disabled && "cursor-no-drop opacity-50"} `}
      {...props}
    >
      {children}
    </button>
  );
};
