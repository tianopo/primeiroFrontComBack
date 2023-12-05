import React, { HTMLAttributes } from "react";

interface IBotaoOnClickProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  onClick: () => void;
}

export const BotaoOnClick = ({
  onClick,
  children,
  className,
}: IBotaoOnClickProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        rounded-4
        border-1
        border-solid
        border-borda
        bg-primaria
        p-6
        text-20
        font-normal
        text-white
        shadow-box-shadow
        duration-300
        ease-in-out
        hover:opacity-80
        active:translate-y-1
        md:w-28
        ${className}
      `}
    >
      {children}
    </button>
  );
};
