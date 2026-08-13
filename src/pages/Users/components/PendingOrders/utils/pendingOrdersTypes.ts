import type { Dispatch, SetStateAction } from "react";

export type BybitKeyType = "empresa" | "pessoal";

export type TabKey =
  | "bybitCryptotech"
  | "bybitPessoal"
  | "binance"
  | "bitgetCryptotech"
  | "bitgetPessoal"
  | "mexcPessoal"
  | "coinexEmpresa"
  | "coinexPessoal";

export type ExchangeKeyType = BybitKeyType | "binance";

export type ConfirmAction = "release" | "markPaid";

export type OrderLike = Record<string, unknown>;

export type TabConfig = {
  tab: TabKey;
  keyType: ExchangeKeyType;
  label: string;
  exchangeName: "Bybit" | "Binance" | "Bitget" | "MEXC" | "CoinEx";
  registerExchange: string;
};

export type PendingOrdersProps = {
  setForm: Dispatch<SetStateAction<boolean>>;
  setInitialRegisterData: Dispatch<
    SetStateAction<{
      apelido: string;
      nome: string;
      exchange: string;
    }>
  >;
};
