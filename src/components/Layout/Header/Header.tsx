import { Gear, List } from "@phosphor-icons/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { app } from "src/routes/app";
import { useAccessControl } from "src/routes/context/AccessControl";
import "../Sidebar/Sidebar.css";
import { SidebarX } from "../Sidebar/SidebarX";
import { ModalPassword } from "./components/ModalPassword";

interface INavbar {
  icon?: JSX.Element;
  text: string;
  route: string;
}

interface IHeader {
  navbar: INavbar[];
}

interface ICurrencyData {
  code: string;
  bid: string;
  ask: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
}

interface ICurrencies {
  USDBRL?: ICurrencyData;
  BTCBRL?: ICurrencyData;
}

export const Header = ({ navbar }: IHeader) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currencyRef = useRef<ICurrencies | null>(null);
  const [currencyData, setCurrencyData] = useState<ICurrencies | null>(null);
  const navigate = useNavigate();
  const { name } = useAccessControl();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const checkFluctuation = (
    current: ICurrencyData | undefined,
    previous: ICurrencyData | undefined,
    label: string,
  ) => {
    if (!current || !previous) return;
    const currentBid = parseFloat(current.bid);
    const previousBid = parseFloat(previous.bid);
    const percent = Math.abs(((currentBid - previousBid) / previousBid) * 100);
    if (percent > 0.12) {
      new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3")
        .play()
        .catch(console.error);
      toast.warning(`Atenção! O preço de ${current.code} variou ${percent.toFixed(2)}% ${label}.`);
    }
  };

  useEffect(() => {
    const fetchAndCheckCurrency = async () => {
      try {
        const { data } = await axios.get("https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL");
        console.log(data);
        if (currencyRef.current) {
          checkFluctuation(data.USDBRL, currencyRef.current.USDBRL, "nos últimos 30 segundos");
        }

        currencyRef.current = data; // Atualiza a ref
        setCurrencyData(data); // Atualiza o estado para exibição (não afeta o loop)
      } catch (error) {
        console.error("Erro ao buscar dados das moedas:", error);
        setCurrencyData(null);
      }
    };

    fetchAndCheckCurrency(); // Executa uma vez no início
    const interval = setInterval(fetchAndCheckCurrency, 60000); // Executa a cada 30 segundos
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, []);

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
            {currencyData ? (
              <>
                <span>Dólar (USD/BRL):</span>
                <ul className="flex flex-wrap gap-0.5 text-10 text-green-500">
                  <li>Compra R$ {parseFloat(currencyData.USDBRL?.bid || "0")} |</li>
                  <li>Venda R$ {parseFloat(currencyData.USDBRL?.ask || "0")} |</li>
                  <li>Máxima R$ {parseFloat(currencyData.USDBRL?.high || "0")} |</li>
                  <li>Mínima R$ {parseFloat(currencyData.USDBRL?.low || "0")} |</li>
                </ul>
                <span>Bitcoin (BTC/BRL):</span>
                <ul className="flex flex-wrap gap-0.5 text-10 text-green-500">
                  <li>Compra R$ {parseFloat(currencyData.BTCBRL?.bid || "0")} |</li>
                  <li>Venda R$ {parseFloat(currencyData.BTCBRL?.ask || "0")} |</li>
                  <li>Máxima R$ {parseFloat(currencyData.BTCBRL?.high || "0")} |</li>
                  <li>Mínima R$ {parseFloat(currencyData.BTCBRL?.low || "0")} |</li>
                </ul>
              </>
            ) : (
              <span className="text-red-500">Erro ao carregar cotações</span>
            )}
          </div>
        </div>
        <div
          className="hidden cursor-pointer items-center gap-2 rounded-6 p-2.5 text-write-secundary hover:bg-secundary hover:text-write-primary md:flex"
          onClick={() => setShowPasswordModal(true)}
        >
          <Gear width={19.45} height={20} weight="fill" onClick={() => navigate(app.users)} />
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
