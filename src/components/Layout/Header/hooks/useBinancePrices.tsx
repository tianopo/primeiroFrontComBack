import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

interface ReferencePriceItem {
  asset: string;
  referencePrice: string | number;
}

interface ReferencePriceBody {
  data: ReferencePriceItem[];
}

export interface BinancePrices {
  USDTBRL: number;
  BTCBRL: number;
}

interface AdReferencePriceQueryReq {
  assets: string[];
  fiatCurrency: string;
  fromUserRole: string;
  payType: string;
  tradeType: string; // "BUY" | "SELL" (no seu backend)
}

export const useBinancePrices = (): BinancePrices | null => {
  const fetcher = async (): Promise<BinancePrices> => {
    const payload: AdReferencePriceQueryReq = {
      assets: ["USDT", "BTC"],
      fiatCurrency: "BRL",
      fromUserRole: "MERCHANT",
      payType: "PIX",
      tradeType: "SELL",
    };

    // axios response -> { data: <body> }
    const { data } = await api().post<ReferencePriceBody>(apiRoute.referencePrice, payload);

    const items = Array.isArray((data as any)?.data) ? (data as any).data : [];

    const usdtRaw = items.find((i: { asset: string }) => i.asset === "USDT")?.referencePrice;
    const btcRaw = items.find((i: { asset: string }) => i.asset === "BTC")?.referencePrice;

    const USDTBRL = Number(usdtRaw);
    const BTCBRL = Number(btcRaw);

    if (!Number.isFinite(USDTBRL) || !Number.isFinite(BTCBRL)) {
      throw new Error("Resposta inválida do reference-price");
    }

    return { USDTBRL, BTCBRL };
  };

  const { data } = useQuery({
    queryKey: ["binance-reference-price", "USDT", "BTC", "BRL", "PIX", "SELL"],
    queryFn: fetcher,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: 1,
  });

  return data ?? null;
};
