import { Bell, Gear, List } from "@phosphor-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface ICurrencyData {
  code: string;
  bid: string; // Compra
  ask: string; // Venda
  high: string; // Máximo
  low: string; // Mínimo
  varBid: string; // Variação
  pctChange: string; // Porcentagem de variação
}

interface ICurrencies {
  USDBRL?: ICurrencyData;
  BTCBRL?: ICurrencyData;
}

export const Header = ({ navbar }: IHeader) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyData, setCurrencyData] = useState<ICurrencies | null>(null);
  const navigate = useNavigate();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const response = await axios.get("https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL");
        const data: ICurrencies = response.data;
        setCurrencyData(data);
      } catch (error) {
        console.error("Erro ao buscar dados das moedas:", error);
        setCurrencyData(null);
      }
    };

    fetchCurrencyData();
    const interval = setInterval(fetchCurrencyData, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
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
          <div className="flex flex-col items-start text-sm font-bold text-gray-700">
            {currencyData ? (
              <>
                <span>Dólar (USD/BRL):</span>
                <ul className="flex w-full flex-row flex-wrap gap-0.5 text-10 leading-tight tracking-tight text-green-500">
                  <li>Compra R$ {parseFloat(currencyData.USDBRL?.bid || "0")} |</li>
                  <li>Venda R$ {parseFloat(currencyData.USDBRL?.ask || "0")} |</li>
                  <li>Máxima R$ {parseFloat(currencyData.USDBRL?.high || "0")} |</li>
                  <li>Mínima R$ {parseFloat(currencyData.USDBRL?.low || "0")} |</li>
                  <li>Variação R$ {currencyData.USDBRL?.varBid} |</li>
                  <li>Porcentagem {currencyData.USDBRL?.pctChange}%</li>
                </ul>
                <span>Bitcoin (BTC/BRL):</span>
                <ul className="flex flex-row flex-wrap gap-0.5 text-10 leading-tight tracking-tight text-green-500">
                  <li>Compra R$ {parseFloat(currencyData.BTCBRL?.bid || "0")} |</li>
                  <li>Venda R$ {parseFloat(currencyData.BTCBRL?.ask || "0")} |</li>
                  <li>Máxima R$ {parseFloat(currencyData.BTCBRL?.high || "0")} |</li>
                  <li>Mínima R$ {parseFloat(currencyData.BTCBRL?.low || "0")} |</li>
                  <li>Variação R$ {currencyData.BTCBRL?.varBid} |</li>
                  <li>Porcentagem {currencyData.BTCBRL?.pctChange}%</li>
                </ul>
              </>
            ) : (
              <span className="text-red-500">Erro ao carregar cotações</span>
            )}
          </div>
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
