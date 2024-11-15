import { Bell, Gear, List } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputSearch } from "src/components/Form/Input/InputSearch";
import { IconX } from "src/components/Icons/IconX";
import { app } from "src/routes/app";
import "../Sidebar/Sidebar.css";
import { SidebarX } from "../Sidebar/SidebarX";

interface INavbar {
  icon?: JSX.Element;
  text: string;
  route: string;
}

interface IHeader {
  navbar: INavbar[];
}

export const Header = ({ navbar }: IHeader) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);

  return (
    <>
      <header className="sticky z-10 flex h-fit w-full items-center justify-between gap-2.5 bg-white shadow-sm md:gap-0">
        <img
          src="icon-crypto.png"
          alt="logo da CryptoTech"
          width={93}
          height={67.19}
          className="rounded-full border-1 border-edge-primary"
        />
        <div className="w-full md:w-72">
          <InputSearch title="pesquisar" placeholder="Pesquisar Projeto" />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <IconX
            name="Acessos"
            icon={
              <Gear
                className="cursor-pointer rounded-6 text-write-secundary hover:bg-secundary hover:text-write-primary"
                width={19.45}
                height={20}
                weight="fill"
                onClick={() => navigate(app.registerOrders)}
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
          <div
            className="flex cursor-pointer items-center gap-5 rounded-6 p-2.5 text-write-secundary hover:bg-secundary hover:text-write-primary"
            onClick={() => navigate(app.registerOrders)}
          >
            <h5>Matheus Henrique</h5>
          </div>
        </div>
        <div className="mr-2 w-fit">
          <List
            className="cursor-pointer text-write-secundary md:hidden"
            size={24}
            onClick={handleMenuToggle}
          />
        </div>
      </header>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() =>
            setTimeout(() => {
              setMenuOpen(false);
            }, 100)
          }
        >
          <SidebarX navbar={navbar} menuOpen />
        </div>
      )}
    </>
  );
};
