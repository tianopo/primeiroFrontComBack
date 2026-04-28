import { Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { useCreateMedEvent } from "../../hooks/Compliance/useCreateMedEvent";
import { useDeleteMedEvent } from "../../hooks/Compliance/useDeleteMedEvent";

interface IMedsTab {
  data: any;
  onSaved?: (data: any) => void;
}

export const MedsTab = ({ data, onSaved }: IMedsTab) => {
  const [title, setTitle] = useState("MED");
  const [reason, setReason] = useState("");
  const [endToEnd, setEndToEnd] = useState("");
  const [bankName, setBankName] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [amountBrl, setAmountBrl] = useState("");
  const [exchange, setExchange] = useState("");
  const [orderId, setOrderId] = useState("");

  const [medToDelete, setMedToDelete] = useState<{ id: string; title: string } | null>(null);

  const { mutateAsync: createMedEvent, isPending } = useCreateMedEvent();
  const { mutateAsync: deleteMedEvent, isPending: isDeleting } = useDeleteMedEvent();

  const medEvents = useMemo(() => {
    const events = data?.compliance?.events ?? [];

    return events
      .filter((event: any) => event.type === "MED_RECORDED")
      .sort((a: any, b: any) => {
        const first = new Date(b.createdIn).getTime();
        const second = new Date(a.createdIn).getTime();
        return first - second;
      });
  }, [data]);

  const handleSubmit = async () => {
    const document = data?.input?.rawDocument;
    if (!document || !reason.trim()) return;

    const result = await createMedEvent({
      document,
      title,
      reason,
      endToEnd,
      bankName,
      transactionDate,
      amountBrl,
      exchange,
      orderId,
    });

    setTitle("MED registrado");
    setReason("");
    setEndToEnd("");
    setBankName("");
    setTransactionDate("");
    setAmountBrl("");
    setExchange("");
    setOrderId("");

    onSaved?.(result);
  };

  const handleDeleteConfirmed = async () => {
    if (!medToDelete) return;

    const result = await deleteMedEvent(medToDelete.id);
    setMedToDelete(null);
    onSaved?.(result);
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Registrar MED</h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-2"
              disabled
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Banco</label>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="Banco"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">EndToEnd</label>
            <input
              value={endToEnd}
              onChange={(e) => setEndToEnd(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="EndToEnd"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Valor</label>
            <input
              value={amountBrl}
              onChange={(e) => setAmountBrl(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Exchange</label>
            <input
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="Bybit, Binance..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">OrderId</label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded border p-2"
              placeholder="OrderId interno"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Data da transação</label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Motivo do MED</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[90px] w-full rounded border p-2"
              placeholder="Motivo do MED"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button type="button" disabled={isPending || !reason.trim()} onClick={handleSubmit}>
            Registrar MED
          </Button>
        </div>
      </section>

      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">MEDs registrados</h4>

        {medEvents.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum MED registrado.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {medEvents.map((event: any) => {
              const metadata = event.metadata ?? {};

              return (
                <div key={event.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold">{event.title}</div>

                    <button
                      type="button"
                      onClick={() =>
                        setMedToDelete({
                          id: event.id,
                          title: event.title || "MED registrado",
                        })
                      }
                      className="flex items-center justify-center rounded p-1 text-red-600 hover:bg-red-50"
                      title="Excluir MED"
                    >
                      <Trash size={20} weight="bold" />
                    </button>
                  </div>

                  <div className="mt-1 text-sm">
                    <strong>Data:</strong>{" "}
                    {event.createdIn ? new Date(event.createdIn).toLocaleString("pt-BR") : "-"}
                  </div>
                  <div className="text-sm">
                    <strong>Motivo do MED:</strong> {event.description || metadata.reason || "-"}
                  </div>
                  <div className="text-sm">
                    <strong>Banco:</strong> {metadata.bankName || "-"}
                  </div>
                  <div className="text-sm">
                    <strong>EndToEnd:</strong> {metadata.endToEnd || "-"}
                  </div>
                  <div className="text-sm">
                    <strong>Valor:</strong> {metadata.amountBrl || "-"}
                  </div>
                  <div className="text-sm">
                    <strong>Exchange:</strong> {metadata.exchange || "-"}
                  </div>
                  <div className="text-sm">
                    <strong>OrderId:</strong> {event.orderId || "-"}
                  </div>
                  <div className="text-sm">
                    <strong>Data da transação:</strong> {metadata.transactionDate || "-"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {medToDelete && (
        <ConfirmationModalButton
          text={`Deseja excluir o evento "${medToDelete.title}"?`}
          onCancel={() => setMedToDelete(null)}
          onConfirm={handleDeleteConfirmed}
          confirmDisabled={isDeleting}
        />
      )}
    </div>
  );
};
