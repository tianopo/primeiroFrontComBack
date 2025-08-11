import { File, FileArchive, House, TrademarkRegistered, UserCheck } from "@phosphor-icons/react";
import { Outlet } from "react-router-dom";
import { app } from "src/routes/app";
import { useAccessControl } from "src/routes/context/AccessControl";
import { Header } from "../Header/Header";
import { SidebarX } from "../Sidebar/SidebarX";

export const LayoutX = () => {
  const { acesso } = useAccessControl();

  const nav = [
    {
      text: "Início",
      route: app.home,
      icon: <House width={20} height={17} weight="duotone" />,
    },
    // Itens visíveis apenas se acesso !== 'User'
    ...(acesso !== "User"
      ? [
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
            text: "Contratos",
            route: app.documentsGenerator,
            icon: <File width={20} height={17} weight="duotone" />,
          },
          {
            text: "Conversão",
            route: app.convert,
            icon: <FileArchive width={20} height={17} weight="duotone" />,
          },
        ]
      : []),
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
