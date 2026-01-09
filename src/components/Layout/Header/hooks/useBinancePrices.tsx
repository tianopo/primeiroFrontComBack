import axios from "axios";
import { useEffect, useState } from "react";

interface BinanceTicker {
  symbol: string;
  price: string;
}

interface BinancePrices {
  USDTBRL: number;
  BTCBRL: number;
}

export const useBinancePrices = (): BinancePrices | null => {
  const [prices, setPrices] = useState<BinancePrices | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [usdtRes, btcRes] = await Promise.all([
          axios.get<BinanceTicker>("https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL"),
          axios.get<BinanceTicker>("https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL"),
        ]);

        setPrices({
          USDTBRL: parseFloat(usdtRes.data.price),
          BTCBRL: parseFloat(btcRes.data.price),
        });
      } catch (err) {
        console.error("Erro ao buscar preços na Binance", err);
        setPrices(null);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return prices;
};
