import { HTMLAttributes, ReactNode } from "react";
import "./Button.css";

interface IButtonOnClick extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  onClick?: () => void;
}

export const ButtonOnClick = ({ onClick, children, className }: IButtonOnClick) => {
  return (
    <button
      onClick={onClick}
      className={`
      button
      button-light
      ${className}
      `}
    >
      {children}
    </button>
  );
};
