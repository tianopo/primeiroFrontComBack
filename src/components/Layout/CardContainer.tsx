import { ReactNode } from "react";

interface ICardContainer {
  children: ReactNode;
}

export const CardContainer = ({ children }: ICardContainer) => {
  return (
    <div className="h-fit w-[calc(50%-1rem)] rounded-16 bg-white p-4 shadow-2xl">{children}</div>
  );
};
