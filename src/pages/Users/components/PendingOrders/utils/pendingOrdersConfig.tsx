import { TabConfig } from "./pendingOrdersTypes";

export const CRYPTOTECH_NAME = "CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA";

export const TABS: TabConfig[] = [
  {
    tab: "bybitCryptotech",
    keyType: "empresa",
    label: "Bybit E",
    exchangeName: "Bybit",
    registerExchange: "Bybit https://www.bybit.com/ SG",
  },
  {
    tab: "bybitPessoal",
    keyType: "pessoal",
    label: "Bybit P",
    exchangeName: "Bybit",
    registerExchange: "Bybit https://www.bybit.com/ SG",
  },
  {
    tab: "binance",
    keyType: "binance",
    label: "Binance",
    exchangeName: "Binance",
    registerExchange: "Binance https://www.binance.com/ CN",
  },
];
