import { useState } from "react";
import { Button } from "src/components/Buttons/Button";

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

const StatusBadge = ({ status }: { status?: string }) => {
  const s = String(status ?? "").toLowerCase();

  const cls =
    s === "success" || s === "completed" || s === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : s === "failed" || s === "rejected"
        ? "bg-red-100 text-red-700 border-red-200"
        : s === "pending" || s === "processing"
          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
          : s === "created"
            ? "bg-blue-100 text-blue-700 border-blue-200"
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
    } catch {
      // se clipboard falhar, não quebra UI
    }
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

const formatBRL = (v?: number, currency?: string) => {
  if (typeof v !== "number") return "-";
  // aqui o amount já está em reais com decimais (0.01), então formatamos normal.
  const cur = currency ?? "BRL";
  const brl = v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return cur === "BRL" ? brl : `${v} ${cur}`;
};

// ✅ Use dentro do seu modal
export const PixOutResponse = ({ data }: { data?: any }) => {
  if (!data) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        Sem envio ainda.
      </div>
    );
  }

  const transactionId = data.transactionId;
  const status = data.status;
  const endToEndId = data.endToEndId;
  const amount = data.amount;
  const currency = data.currency;

  return (
    <div className="mt-3 rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-900">
          Resposta da Transferência (PIX OUT)
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
          <span className="text-xs font-semibold text-gray-600">Transaction ID</span>
          <div className="flex items-center gap-2">
            <span className="break-all text-sm text-gray-900">{transactionId ?? "-"}</span>
            <CopyBtn value={transactionId} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
          <span className="text-xs font-semibold text-gray-600">EndToEnd ID (E2E)</span>
          <div className="flex items-center gap-2">
            <span className="break-all text-sm text-gray-900">{endToEndId ?? "-"}</span>
            <CopyBtn value={endToEndId} />
          </div>
        </div>

        <Row label="Valor" value={formatBRL(amount, currency)} />
        <Row label="Moeda" value={currency ?? "-"} />
      </div>
    </div>
  );
};
