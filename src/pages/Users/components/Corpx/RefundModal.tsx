import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { Modal } from "src/components/Modal/Modal";
import { useCorpxRefundPix } from "../../hooks/Corpx/useCorpxRefundPix";

const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex min-h-[34px] items-center justify-between gap-2 border-b border-gray-100 px-2 py-1 last:border-b-0">
    <span className="text-[11px] font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export const RefundModal = ({
  accountId,
  endToEndId,
  defaultAmount,
  counterpartyName,
  counterpartyDocument,
  onClose,
}: {
  accountId: string;
  endToEndId?: string;
  defaultAmount?: number;
  counterpartyName?: string;
  counterpartyDocument?: string;
  onClose: () => void;
}) => {
  const { mutate: refund, isPending, data } = useCorpxRefundPix();

  const [amount, setAmount] = useState(String(defaultAmount ?? 0));
  const [reason, setReason] = useState("USER_REQUESTED");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const canRefund = !!accountId && !!endToEndId && Number(amount) > 0;

  const confirmText = useMemo(() => {
    const a = Number(amount);
    const valueText = Number.isFinite(a) ? formatBRL(a) : "-";
    return `Confirmar reembolso de ${valueText} para ${counterpartyName ?? "-"} (CPF/CNPJ: ${counterpartyDocument ?? "-"})?`;
  }, [amount, counterpartyName, counterpartyDocument]);

  const doSubmit = () => {
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

    setConfirmOpen(false);
  };

  // ✅ tenta deixar a resposta mais profissional (sem JSON)
  const refundResponse = data as any;

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
        <Button
          className="rounded-6 bg-gray-200 px-3 py-1.5"
          onClick={onClose}
          disabled={isPending}
        >
          Cancelar
        </Button>

        <Button
          className="rounded-6 bg-orange-500 px-3 py-1.5 text-white"
          onClick={() => setConfirmOpen(true)}
          disabled={!canRefund || isPending}
        >
          {isPending ? "Solicitando..." : "Solicitar devolução"}
        </Button>
      </div>

      {/* ✅ Resposta mais “profissional” */}
      <div className="mt-4 rounded-xl border border-gray-200 p-2">
        <div className="mb-2 text-sm font-semibold">Resposta</div>

        {!refundResponse ? (
          <div className="text-sm text-gray-600">Nenhuma solicitação ainda.</div>
        ) : (
          <div className="flex flex-col">
            <Row label="AccountId" value={refundResponse.accountId} />
            <Row label="E2E Original" value={refundResponse.originalEndToEnd} />
            <Row
              label="Valor"
              value={
                typeof refundResponse.amount === "number"
                  ? formatBRL(refundResponse.amount)
                  : refundResponse.amount
              }
            />
            <Row label="Moeda" value={refundResponse.currency} />
            <Row label="Motivo" value={refundResponse.reason} />
          </div>
        )}
      </div>

      {/* ✅ confirmação final */}
      {confirmOpen && (
        <ConfirmationModalButton
          text={confirmText}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doSubmit}
        />
      )}
    </Modal>
  );
};
