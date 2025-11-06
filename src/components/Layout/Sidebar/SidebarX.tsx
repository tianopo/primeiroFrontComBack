import { CopySimple, DoorOpen, Gear, SlidersHorizontal } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "src/hooks/API/useLogout";
import { app } from "src/routes/app";
import { useAccessControl } from "src/routes/context/AccessControl";
import "./Sidebar.css";
import { useUpdateExchangeOffsets } from "../LayoutX/UseUpdateExchangesOffsets";

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
  const { acesso, name } = useAccessControl();
  const { mutate } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyTexts = [
    { label: "PIX CNPJ", text: "55.636.113/0001-70" },
    { label: "PIX Aleatório", text: "9d9bbfe8-8dd7-4d3f-8fd1-861fdffbeed5" },
    {
      label: "Transferência",
      text: `Não há para Corpx`,
    },
    {
      label: "Envio Final",
      text: `Quiser comprar mais só mandar mensagem \n
Whatsapp: 55+ 12 99254-6355
Telegram: @Tianopo`,
    },
    {
      label: "Terceiros",
      text: `Sem terceiros / No third party / Proibido terceiros / se for terceiros cancele / cancel now if you are third party / nome banco = corretora nome / holder bank name = exchange name`,
    },
  ];

  const handleCopy = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 3000);
    } catch (err) {
      console.error("Falha ao copiar texto", err);
    }
  };

  return (
    <div
      className={`h-calc-header sticky w-60 border-e-1 border-edge-primary bg-white md:flex ${menuOpen ? "flex h-screen" : "hidden"}`}
    >
      <div className={`h-calc-header fixed flex w-60 flex-col justify-between px-2 py-4 md:w-44`}>
        <div>
          {navbar?.map((nav: INavbar, index: number) => (
            <div
              className={`flex h-10 cursor-pointer items-center justify-start gap-2.5 rounded hover:bg-selected-primary hover:text-write-primary ${location.pathname === nav.route ? "bg-selected-primary text-write-primary" : "text-write-secundary"} `}
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
            <div
              className="flex cursor-pointer items-center gap-5 rounded-6 p-2.5 text-write-secundary hover:bg-secundary hover:text-write-primary"
              onClick={() => navigate(app.users)}
            >
              <h5>
                <Gear width={19.45} height={20} weight="fill" onClick={() => navigate(app.users)} />
                {name}
              </h5>
            </div>
          </div>

          {/* Botões de cópia visíveis apenas para Master */}
          {acesso === "Master" &&
            copyTexts.map((item, index) => (
              <div
                key={index}
                className="flex h-10 cursor-pointer items-center justify-start gap-2.5 rounded-10 pl-2.5 text-write-secundary hover:bg-selected-primary hover:text-write-primary"
                onClick={() => handleCopy(index, item.text)}
              >
                <CopySimple width={20} height={17} weight="duotone" />
                <h6>{copiedIndex === index ? "Copiado!" : item.label}</h6>
              </div>
            ))}

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
