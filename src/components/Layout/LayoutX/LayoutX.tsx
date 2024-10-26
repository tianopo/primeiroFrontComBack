import { Bank, House, MathOperations, Money } from "@phosphor-icons/react";
import { Outlet } from "react-router-dom";
import { app } from "src/routes/app";
import { Header } from "../Header/Header";
import { SidebarX } from "../Sidebar/SidebarX";

export const LayoutX = () => {
  const nav = [
    { text: "Início", route: app.operation, icon: <House width={20} height={17} weight="fill" /> },
    {
      text: "Operações",
      route: app.operation,
      icon: <MathOperations width={20} height={17} weight="duotone" />,
    },
    {
      text: "Transações",
      route: app.transactions,
      icon: <Bank width={20} height={17} weight="duotone" />,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <Header navbar={nav} />
      <div className="flex w-full">
        <SidebarX navbar={nav} />
        <div className="flex w-full flex-col gap-2 bg-purple-200 p-6 md:gap-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
