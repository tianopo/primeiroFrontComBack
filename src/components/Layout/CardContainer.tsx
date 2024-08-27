import { ReactNode } from "react";

interface ICardContainer {
  children: ReactNode;
}

export const CardContainer = ({ children }: ICardContainer) => {
  return (
    <div className="flex w-full flex-col items-center gap-2.5 rounded-16 bg-white p-4 shadow-2xl">
      {children}
    </div>
  );
};
