import { Bell, DoorOpen, Gear } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconX } from "src/components/Icons/IconX";
import { useLogout } from "src/hooks/API/useLogout";
import { app } from "src/routes/app";
import "./Sidebar.css";

interface INavbar {
  icon?: JSX.Element;
  text: string;
  route: string;
}

interface ISidebarX {
  navbar: INavbar[];
  menuOpen?: boolean;
}

export const SidebarX = ({ navbar, menuOpen }: ISidebarX) => {
  const { mutate } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className={`h-calc-header sticky w-60 border-e-1 border-edge-primary bg-white md:flex ${menuOpen ? "flex h-screen" : "hidden"}`}
    >
      <div className={`h-calc-header fixed flex w-60 flex-col justify-between px-2 py-4 md:w-44`}>
        <div>
          {navbar?.map((nav: INavbar, index: number) => (
            <div
              className={`- 10 pl - 2.5 flex h-10 cursor-pointer items-center justify-start gap-2.5 rounded hover:bg-selected-primary hover:text-write-primary ${location.pathname === nav.route ? "bg-selected-primary text-write-primary" : "text-write-secundary"} `}
              key={index}
              onClick={() => navigate(nav.route)}
            >
              {nav.icon}
              <h6>{nav.text}</h6>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="border-edge block border-t-1 md:hidden" />
          <div className="flex flex-col items-center gap-5 md:hidden">
            <div className="flex w-full flex-row gap-1 pl-2.5 text-start">
              <IconX
                name="Acessos"
                icon={
                  <Gear
                    className="cursor-pointer rounded-6 text-write-secundary hover:bg-secundary hover:text-write-primary"
                    width={19.45}
                    height={20}
                    weight="fill"
                    onClick={() => navigate(app.users)}
                  />
                }
              />
              <IconX
                name="Notificações"
                icon={
                  <Bell
                    className="cursor-pointer rounded-6 text-write-secundary hover:bg-secundary hover:text-write-primary"
                    width={19.45}
                    height={20}
                    weight="fill"
                  />
                }
              />
            </div>
            <div
              className="flex cursor-pointer items-center gap-5 rounded-6 p-2.5 text-write-secundary hover:bg-secundary hover:text-write-primary"
              onClick={() => navigate(app.users)}
            >
              <h5>Matheus Henrique</h5>
            </div>
          </div>
          <div className="border-edge border-t-1" />
          <div
            className="flex h-10 cursor-pointer items-center justify-start gap-2.5 rounded-10 pl-2.5 text-write-secundary hover:bg-selected-primary hover:text-write-primary"
            onClick={() => mutate()}
          >
            <DoorOpen width={20} height={17} weight="duotone" />
            <h6>Sair</h6>
          </div>
        </div>
      </div>
    </div>
  );
};
