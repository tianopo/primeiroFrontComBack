import { HouseLine } from "@phosphor-icons/react";
import { Outlet } from "react-router-dom";
import { Flex } from "../Flex/Flex";
import { FlexCol } from "../Flex/FlexCol";
import { Header } from "./Header";
import { SidebarX } from "./SidebarX";
import { app } from "src/routes/app";

export const LayoutX = () => {
  const nav = [{ text: "Perfil", route: app.perfil, Icon: <HouseLine /> }];

  return (
    <div className={`home-light`}>
      <Flex>
        <SidebarX image="/projeto/logo.svg" navbar={nav} title="Software" exit />
        <FlexCol className="w-full">
          <Header title="Olá" />
          <div className="h-screen w-full bg-slate-400">
            <Outlet />
          </div>
        </FlexCol>
      </Flex>
    </div>
  );
};
