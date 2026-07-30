import { useState } from "react";
import {
  formatBRLFromUnknown,
  GowdBatch,
  GowdPixOutResponseData,
  isPartiallyPaid,
} from "src/pages/Users/utils/gowdPixDireto.helpers";
import { useAccessControl } from "src/routes/context/AccessControl";

const Row = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{String(value ?? "-")}</span>
  </div>
);

const StatusBadge = ({ status }: { status?: string }) => {
  const s = String(status ?? "").toLowerCase();

  const cls =
    s === "paid" || s === "success" || s === "completed" || s === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : s === "partially_paid"
        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
        : s === "error" || s === "failed" || s === "rejected"
          ? "bg-red-100 text-red-700 border-red-200"
          : s === "pending" || s === "processing"
            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
            : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {status ?? "-"}
    </span>
  );
};

const CopyBtn = ({ value }: { value?: string }) => {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
};

const getAmountValue = (data?: GowdPixOutResponseData) => {
  if (!data) return undefined;

  if (typeof data.amount === "object" && data.amount !== null) {
    return data.amount.value;
  }

  return data.amount;
};

const getAmountCurrency = (data?: GowdPixOutResponseData) => {
  if (!data) return "BRL";

  if (typeof data.amount === "object" && data.amount !== null) {
    return data.amount.currency ?? "BRL";
  }

  return data.currency ?? "BRL";
};

const BatchPanel = ({ batch }: { batch?: GowdBatch }) => {
  if (!batch) return null;

  const transactions = Array.isArray(batch.transactions) ? batch.transactions : [];

  return (
    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
      <h4 className="mb-2 font-semibold text-blue-900">Remessa Pix</h4>

      <div className="grid gap-2 md:grid-cols-2">
        <Row label="ID da remessa" value={batch.id} />
        <Row label="Quantidade de transações" value={batch.transactionsCount} />
        <Row label="Valor total" value={formatBRLFromUnknown(batch.totalAmount)} />
        <Row label="Valor pago" value={formatBRLFromUnknown(batch.paidAmount)} />
        <Row label="Valor pendente" value={formatBRLFromUnknown(batch.pendingAmount)} />
      </div>

      {transactions.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          <h5 className="text-xs font-semibold uppercase text-blue-900">Transações da remessa</h5>

          {transactions.map((transaction) => (
            <div
              key={transaction.id ?? transaction.sequence}
              className="rounded-md border border-blue-100 bg-white p-2"
            >
              <div className="grid gap-1 md:grid-cols-2">
                <Row label="Sequência" value={transaction.sequence} />
                <Row label="Status" value={transaction.status} />
                <Row label="Valor" value={formatBRLFromUnknown(transaction.amount)} />
                <Row label="E2E" value={transaction.endToEndId} />
                <Row label="IdempotencyKey" value={transaction.idempotencyKey} />
                <Row label="Pago em" value={formatDateTime(transaction.paidAt ?? undefined)} />
                <Row label="Erro" value={transaction.errorMessage} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const PixOutResponse = ({ data }: { data?: GowdPixOutResponseData }) => {
  const { acesso } = useAccessControl();

  if (!data) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        Sem envio ainda.
      </div>
    );
  }

  const amountValue = getAmountValue(data);
  const amountCurrency = getAmountCurrency(data);
  const batch = data.batch;
  const status = String(data.status ?? "");

  return (
    <div className="mt-3 rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-900">
          Resposta da Transferência (PIX - GOWD)
        </div>
        <StatusBadge status={status} />
      </div>

      {isPartiallyPaid(status) ? (
        <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Este Pix foi parcialmente pago. Não reenvie o valor total. Faça um novo payout apenas do
          valor pendente:
          <strong> {formatBRLFromUnknown(batch?.pendingAmount)}</strong>.
        </div>
      ) : null}

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
          <span className="text-xs font-semibold text-gray-600">ID</span>
          <div className="flex items-center gap-2">
            <span className="break-all text-sm text-gray-900">{data.id ?? "-"}</span>
            <CopyBtn value={data.id} />
          </div>
        </div>

        <Row label="ExternalId" value={data.externalId} />
        <Row label="Valor" value={formatBRLFromUnknown(amountValue)} />
        <Row label="Moeda" value={amountCurrency} />
        <Row label="Status" value={data.status} />
        <Row label="EndToEndId" value={data.endToEndId} />
        <Row label="Descrição" value={data.description} />
        <Row label="Erro" value={data.errorMessage ?? "-"} />

        {acesso === "Master" && (
          <>
            <Row label="Criado em" value={formatDateTime(data.createdAt)} />
            <Row label="Fee fixa" value={formatBRLFromUnknown(data.fee?.fixed)} />
            <Row label="Fee variável" value={formatBRLFromUnknown(data.fee?.variable)} />
            <Row label="Fee adicional" value={formatBRLFromUnknown(data.fee?.additional)} />
          </>
        )}
      </div>

      <BatchPanel batch={batch} />
    </div>
  );
};
