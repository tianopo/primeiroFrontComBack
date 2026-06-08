import { useQuery } from "@tanstack/react-query";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

interface ReferencePriceItem {
  asset: string;
  referencePrice: string | number;
}

interface ReferencePriceResponse {
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
  tradeType: string;
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

    const { data } = await api().post<ReferencePriceResponse>(apiRoute.referencePrice, payload);

    const items = Array.isArray(data?.data) ? data.data : [];

    const usdtRaw = items.find((item) => item.asset === "USDT")?.referencePrice;
    const btcRaw = items.find((item) => item.asset === "BTC")?.referencePrice;

    const USDTBRL = Number(usdtRaw);
    const BTCBRL = Number(btcRaw);

    if (!Number.isFinite(USDTBRL) || !Number.isFinite(BTCBRL)) {
      throw new Error("Resposta inválida do reference-price");
    }

    return { USDTBRL, BTCBRL };
  };

  const { data } = useQuery({
    queryKey: ["binance-reference-price", "USDT,BTC", "BRL", "PIX", "SELL", "MERCHANT"],
    queryFn: fetcher,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return data ?? null;
};
