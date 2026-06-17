import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { Modal } from "src/components/Modal/Modal";
import { useGowdRefund } from "../../../hooks/Gowd/useGowdRefund";
import {
  BRLAmountInput,
  brlInputToBackendValue,
  brlInputToNumber,
  formatBRLInputValue,
} from "./BRLAmountInput";
import { useAccessControl } from "src/routes/context/AccessControl";

const REFUND_REASON = "Customer requested or sold was not done";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex min-h-[34px] items-center justify-between gap-2 border-b border-gray-100 px-2 py-1 last:border-b-0">
    <span className="text-[11px] font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

export const RefundModal = ({
  orderId,
  defaultAmount,
  counterpartyName,
  counterpartyDocument,
  onClose,
}: {
  orderId?: string;
  defaultAmount?: number | string;
  counterpartyName?: string;
  counterpartyDocument?: string;
  onClose: () => void;
}) => {
  const { sendRefund, isPending, data } = useGowdRefund();
  const { acesso } = useAccessControl();

  const [amount, setAmount] = useState(() => formatBRLInputValue(defaultAmount ?? 0));
  const [confirmOpen, setConfirmOpen] = useState(false);

  const amountNumber = useMemo(() => brlInputToNumber(amount), [amount]);

  const requestedByName = String(counterpartyName ?? "").trim();

  const canRefund =
    !!orderId && Number.isFinite(amountNumber) && amountNumber > 0 && !!requestedByName;

  const confirmText = useMemo(() => {
    const valueText = Number.isFinite(amountNumber) ? formatBRL(amountNumber) : "-";

    return `Confirmar reembolso de ${valueText} para ${
      counterpartyName ?? "-"
    } (CPF/CNPJ: ${counterpartyDocument ?? "-"})?`;
  }, [amountNumber, counterpartyName, counterpartyDocument]);

  const doSubmit = () => {
    if (!orderId) return;

    const backendAmount = brlInputToBackendValue(amount);

    if (!backendAmount) return;

    sendRefund({
      orderId,
      requestedBy: {
        name: requestedByName,
      },
      amount: backendAmount,
    });

    setConfirmOpen(false);
  };

  const refundResponse = data as any;

  return (
    <Modal onClose={onClose} fit>
      <h3 className="text-xl font-semibold">Devolver PIX (Reembolso - GOWD)</h3>

      <div className="mt-2 rounded bg-gray-50 p-2 text-sm">
        {acesso === "Master" && (
          <div>
            <strong>OrderId:</strong> {orderId ?? "-"}
          </div>
        )}
        <div>
          <strong>Nome:</strong> {counterpartyName ?? "-"}
        </div>
        <div>
          <strong>Documento:</strong> {counterpartyDocument ?? "-"}
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <label className="text-sm">
          Valor a devolver (BRL)
          <BRLAmountInput
            value={amount}
            onChange={setAmount}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="0,00"
            disabled={isPending}
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

      <div className="mt-4 rounded-xl border border-gray-200 p-2">
        <div className="mb-2 text-sm font-semibold">Resposta</div>

        {!refundResponse ? (
          <div className="text-sm text-gray-600">Nenhuma solicitação ainda.</div>
        ) : (
          <div className="flex flex-col">
            <Row label="Id" value={refundResponse.id} />
            <Row
              label="Valor"
              value={Number.isFinite(amountNumber) ? formatBRL(amountNumber) : "-"}
            />
            <Row label="Nome" value={requestedByName} />
            {acesso === "Master" && (
              <>
                <Row label="OrderId" value={refundResponse.orderId ?? orderId} />
                <Row label="Motivo" value={REFUND_REASON} />
                <Row label="Status" value={refundResponse.status} />
              </>
            )}
          </div>
        )}
      </div>

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
