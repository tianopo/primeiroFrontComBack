import { SlidersHorizontal, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useUpdateExchangeOffsets, type IExchangeOffsets } from "./UseUpdateExchangesOffsets";
import { useExchangeOffsets } from "./useExchangeOffsets";

type TOffsetForm = Record<keyof IExchangeOffsets, string>;

const INITIAL_FORM: TOffsetForm = {
  binanceSellOffset: "0.10",
  binanceBuyOffset: "0.10",
  bybitSellOffset: "0.10",
  bybitBuyOffset: "0.10",
  coinexSellOffset: "0.10",
  coinexBuyOffset: "0.10",
};

export const BallonEditPrice = () => {
  const { data, isLoading } = useExchangeOffsets();
  const { mutate: updateOffsets, isPending: updatingOffsets } = useUpdateExchangeOffsets();

  const [editingOffsets, setEditingOffsets] = useState(false);
  const [form, setForm] = useState<TOffsetForm>(INITIAL_FORM);

  useEffect(() => {
    if (data) {
      setForm({
        binanceSellOffset: String(data.binanceSellOffset),
        binanceBuyOffset: String(data.binanceBuyOffset),
        bybitSellOffset: String(data.bybitSellOffset),
        bybitBuyOffset: String(data.bybitBuyOffset),
        coinexSellOffset: String(data.coinexSellOffset),
        coinexBuyOffset: String(data.coinexBuyOffset),
      });
    }
  }, [data]);

  const handleOpen = () => {
    if (!editingOffsets) setEditingOffsets(true);
  };

  const handleClose = () => {
    if (!updatingOffsets) setEditingOffsets(false);
  };

  const handleChange = (field: keyof IExchangeOffsets, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const parseNumber = (value: string) => Number(value.replace(",", "."));

  const handleSave = () => {
    const payload: IExchangeOffsets = {
      binanceSellOffset: parseNumber(form.binanceSellOffset),
      binanceBuyOffset: parseNumber(form.binanceBuyOffset),
      bybitSellOffset: parseNumber(form.bybitSellOffset),
      bybitBuyOffset: parseNumber(form.bybitBuyOffset),
      coinexSellOffset: parseNumber(form.coinexSellOffset),
      coinexBuyOffset: parseNumber(form.coinexBuyOffset),
    };

    const hasInvalid = Object.values(payload).some((value) => !Number.isFinite(value));

    if (hasInvalid) return;

    updateOffsets(payload, {
      onSuccess: () => setEditingOffsets(false),
    });
  };

  const summary = isLoading
    ? "Carregando..."
    : `BINANCE___ SELL: ${form.binanceSellOffset} BUY: ${form.binanceBuyOffset} | BYBIT_____ SELL: ${form.bybitSellOffset} BUY: ${form.bybitBuyOffset} | COINEX____ SELL: ${form.coinexSellOffset} BUY: ${form.coinexBuyOffset}`;

  const renderSection = (
    title: string,
    sellField: keyof IExchangeOffsets,
    buyField: keyof IExchangeOffsets,
  ) => (
    <div className="rounded-8 border border-gray-200 p-2">
      <h6 className="mb-2 font-semibold text-blue-700">{title}</h6>

      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between gap-2">
          <h6>SELL OFFSET</h6>
          <input
            value={form[sellField]}
            onChange={(e) => handleChange(sellField, e.target.value)}
            className="w-32 rounded border border-gray-300 px-1 py-0.5 text-right"
          />
        </label>

        <label className="flex items-center justify-between gap-2">
          <h6>BUY OFFSET</h6>
          <input
            value={form[buyField]}
            onChange={(e) => handleChange(buyField, e.target.value)}
            className="w-32 rounded border border-gray-300 px-1 py-0.5 text-right"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[460px] flex-col gap-2 rounded-10 bg-gray-50 p-2 text-32 text-gray-700 shadow-lg">
      {!editingOffsets ? (
        <button
          type="button"
          onClick={handleOpen}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-6 bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <SlidersHorizontal size={18} />
          <div className="flex w-28 flex-col flex-wrap gap-2 text-left leading-tight">
            <h6>Editar offsets</h6>
            <span className="text-16">{summary}</span>
          </div>
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-blue-700">
              <SlidersHorizontal size={18} />
              <h6>Editar offsets por corretora</h6>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            {renderSection("Binance", "binanceSellOffset", "binanceBuyOffset")}
            {renderSection("Bybit", "bybitSellOffset", "bybitBuyOffset")}
            {renderSection("Coinex", "coinexSellOffset", "coinexBuyOffset")}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={updatingOffsets}
            className="mt-1 flex items-center justify-center gap-2 rounded-6 bg-blue-600 px-2 py-1 text-20 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {updatingOffsets ? "Salvando..." : "Salvar offsets"}
          </button>
        </>
      )}
    </div>
  );
};
