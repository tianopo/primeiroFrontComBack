import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { useCorpxRefundPix } from "../../hooks/Corpx/useCorpxRefundPix";

export const RefundModal = ({
  accountId,
  endToEndId,
  defaultAmount,
  onClose,
}: {
  accountId: string;
  endToEndId?: string;
  defaultAmount?: number;
  onClose: () => void;
}) => {
  const { mutate: refund, isPending, data } = useCorpxRefundPix();

  const [amount, setAmount] = useState(String(defaultAmount ?? 0));
  const [reason, setReason] = useState("USER_REQUESTED");

  const canRefund = !!accountId && !!endToEndId && Number(amount) > 0;

  const submit = () => {
    if (!endToEndId) return;

    refund({
      idempotencyKey: `refund-${Date.now()}`,
      body: {
        accountId,
        originalEndToEnd: endToEndId,
        amount: Number(amount),
        currency: "BRL",
        reason,
      },
    });
  };

  return (
    <Modal onClose={onClose} fit>
      <h3 className="text-xl font-semibold">Devolver PIX (Refund)</h3>

      <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
        <strong>E2E:</strong> {endToEndId ?? "-"}
      </div>

      <div className="mt-3 grid gap-3">
        <label className="text-sm">
          Valor a devolver (BRL)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Motivo
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button className="rounded-6 bg-gray-200" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          className="rounded-6 bg-orange-500 text-white"
          onClick={submit}
          disabled={!canRefund || isPending}
        >
          {isPending ? "Solicitando..." : "Solicitar devolução"}
        </Button>
      </div>

      <div className="mt-3">
        <div className="font-semibold">Resposta</div>
        <pre className="max-h-56 overflow-auto rounded bg-gray-50 p-2 text-xs">
          {data ? JSON.stringify(data, null, 2) : "Sem devolução ainda."}
        </pre>
      </div>
    </Modal>
  );
};
