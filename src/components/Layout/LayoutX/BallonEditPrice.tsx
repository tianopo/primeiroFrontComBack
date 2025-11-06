import { SlidersHorizontal, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useUpdateExchangeOffsets } from "./UseUpdateExchangesOffsets";

export const BallonEditPrice = () => {
  const { mutate: updateOffsets, isPending: updatingOffsets } = useUpdateExchangeOffsets();

  const [editingOffsets, setEditingOffsets] = useState(false);
  const [sellOffset, setSellOffset] = useState("0.10");
  const [buyOffset, setBuyOffset] = useState("0.10");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exchange-offsets");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sellOffset != null) setSellOffset(String(parsed.sellOffset));
        if (parsed.buyOffset != null) setBuyOffset(String(parsed.buyOffset));
      } else {
        const defaults = { sellOffset: 0.1, buyOffset: 0.1 };
        localStorage.setItem("exchange-offsets", JSON.stringify(defaults));
        updateOffsets(defaults);
      }
    } catch {
      const defaults = { sellOffset: 0.1, buyOffset: 0.1 };
      localStorage.setItem("exchange-offsets", JSON.stringify(defaults));
      updateOffsets(defaults);
    }
  }, []);

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
      onSuccess: () => {
        localStorage.setItem("exchange-offsets", JSON.stringify(payload));
        setEditingOffsets(false);
      },
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-10 bg-gray-50 p-2 text-xs text-gray-700 shadow-lg">
      {!editingOffsets ? (
        // Balão fechado: clique abre edição
        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-2 rounded-6 bg-blue-600 px-2 py-1 text-16 font-medium text-white hover:bg-blue-700"
        >
          <SlidersHorizontal size={18} />
          <p>
            SELL: {sellOffset} | BUY: {buyOffset}
          </p>
        </button>
      ) : (
        // Modo edição
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
                className="w-16 rounded border border-gray-300 px-1 py-0.5 text-right text-16"
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <p>BUY OFFSET</p>
              <input
                value={buyOffset}
                onChange={(e) => setBuyOffset(e.target.value)}
                className="w-16 rounded border border-gray-300 px-1 py-0.5 text-right text-16"
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
