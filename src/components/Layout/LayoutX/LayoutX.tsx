import {
  CashRegister,
  File,
  House,
  MathOperations,
  TrademarkRegistered,
  UserCheck,
} from "@phosphor-icons/react";
import { Outlet } from "react-router-dom";
import { app } from "src/routes/app";
import { Header } from "../Header/Header";
import { SidebarX } from "../Sidebar/SidebarX";

export const LayoutX = () => {
  const nav = [
    { text: "Início", route: app.users, icon: <House width={20} height={17} weight="fill" /> },
    {
      text: "Usuários",
      route: app.users,
      icon: <UserCheck width={20} height={17} weight="duotone" />,
    },
    {
      text: "Ordens",
      route: app.registerOrders,
      icon: <TrademarkRegistered width={20} height={17} weight="duotone" />,
    },
    {
      text: "Documentos",
      route: app.documentsGenerator,
      icon: <File width={20} height={17} weight="duotone" />,
    },
    {
      text: "Fechamento",
      route: app.closing,
      icon: <CashRegister width={20} height={17} weight="duotone" />,
    },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <Header navbar={nav} />
      <div className="flex w-full">
        <SidebarX navbar={nav} />
        <div className="flex w-full flex-col gap-2 bg-primary p-6 md:gap-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
