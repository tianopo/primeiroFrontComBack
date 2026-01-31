import { Gear, List } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "src/routes/context/AccessControl";
import { SidebarX } from "../Sidebar/SidebarX";
import { ModalPassword } from "./components/ModalPassword";
import { useBinancePrices } from "./hooks/useBinancePrices";

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const { name } = useAccessControl();
  const prices = useBinancePrices();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

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
        <div className="w-full md:w-96">
          <div className="flex flex-col items-start font-bold">
            {prices ? (
              <div className="flex flex-col gap-0.5">
                <h6>
                  Dólar (USDT/BRL):{" "}
                  <strong className="text-green-500">R$ {prices.USDTBRL || "-"}</strong>
                </h6>
                <h6>
                  Bitcoin (BTC/BRL):{" "}
                  <strong className="text-green-500">R$ {prices.BTCBRL || "-"}</strong>
                </h6>
              </div>
            ) : (
              <h6 className="text-red-500">Erro ao carregar cotações</h6>
            )}
          </div>
        </div>
        <div
          className="hidden cursor-pointer items-center gap-2 rounded-6 p-2.5 text-write-secundary hover:bg-secundary hover:text-write-primary md:flex"
          onClick={() => setShowPasswordModal(true)}
        >
          <Gear width={19.45} height={20} weight="fill" onClick={() => navigate("/usuarios")} />
          <h5>{name}</h5>
        </div>
        <div className="mr-2 w-fit">
          <List
            className="cursor-pointer text-write-secundary md:hidden"
            size={24}
            onClick={toggleMenu}
          />
        </div>
      </header>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setTimeout(() => setMenuOpen(false), 100)}
        >
          <SidebarX navbar={navbar} menuOpen />
        </div>
      )}
      <ModalPassword isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
};
