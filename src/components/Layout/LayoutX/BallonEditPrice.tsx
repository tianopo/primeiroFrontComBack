import { SlidersHorizontal, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useUpdateExchangeOffsets } from "./UseUpdateExchangesOffsets";
import { useExchangeOffsets } from "./useExchangeOffsets";

export const BallonEditPrice = () => {
  const { data, isLoading } = useExchangeOffsets();
  const { mutate: updateOffsets, isPending: updatingOffsets } = useUpdateExchangeOffsets();

  const [editingOffsets, setEditingOffsets] = useState(false);
  const [sellOffset, setSellOffset] = useState("0.10");
  const [buyOffset, setBuyOffset] = useState("0.10");

  useEffect(() => {
    if (data) {
      setSellOffset(String(data.sellOffset));
      setBuyOffset(String(data.buyOffset));
    }
  }, [data]);

  const handleOpen = () => {
    if (!editingOffsets) setEditingOffsets(true);
  };

  const handleClose = () => {
    if (!updatingOffsets) setEditingOffsets(false);
  };

  const handleSave = () => {
    const sell = Number(sellOffset.replace(",", "."));
    const buy = Number(buyOffset.replace(",", "."));
    if (!Number.isFinite(sell) || !Number.isFinite(buy) || sell < 0 || buy < 0) return;

    const payload = { sellOffset: sell, buyOffset: buy };
    updateOffsets(payload, {
      onSuccess: () => setEditingOffsets(false),
    });
  };

  const label = isLoading ? "Carregando..." : `SELL: ${sellOffset} | BUY: ${buyOffset}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-10 bg-gray-50 p-2 text-xs text-gray-700 shadow-lg">
      {!editingOffsets ? (
        <button
          type="button"
          onClick={handleOpen}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-6 bg-blue-600 px-2 py-1 text-16 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <SlidersHorizontal size={18} />
          <p>{label}</p>
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-16 font-medium text-blue-700">
              <SlidersHorizontal size={18} />
              <p>Editar BUY/SELL</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="mt-1 flex flex-col gap-1">
            <label className="flex items-center justify-between gap-2">
              <p>SELL OFFSET</p>
              <input
                value={sellOffset}
                onChange={(e) => setSellOffset(e.target.value)}
                className="w-20 rounded border border-gray-300 px-1 py-0.5 text-right text-16"
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <p>BUY OFFSET</p>
              <input
                value={buyOffset}
                onChange={(e) => setBuyOffset(e.target.value)}
                className="w-20 rounded border border-gray-300 px-1 py-0.5 text-right text-16"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={updatingOffsets}
            className="mt-1 flex items-center justify-center gap-2 rounded-6 bg-blue-600 px-2 py-1 text-16 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {updatingOffsets ? "Salvando..." : "Salvar BUY/SELL"}
          </button>
        </>
      )}
    </div>
  );
};
