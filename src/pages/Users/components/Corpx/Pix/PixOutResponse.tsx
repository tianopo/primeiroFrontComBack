import { useState } from "react";

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

const StatusBadge = ({ status }: { status?: string }) => {
  const s = String(status ?? "").toLowerCase();

  const cls =
    s === "paid" || s === "success" || s === "completed" || s === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
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

const formatBRL = (value?: string | number) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";

  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
};

export const PixOutResponse = ({ data }: { data?: any }) => {
  if (!data) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        Sem envio ainda.
      </div>
    );
  }

  const amountValue =
    typeof data?.amount === "object" && data?.amount !== null ? data.amount?.value : data?.amount;

  const amountCurrency =
    typeof data?.amount === "object" && data?.amount !== null
      ? data.amount?.currency
      : (data?.currency ?? "BRL");

  return (
    <div className="mt-3 rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-900">
          Resposta da Transferência (PIX OUT - GOWD)
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-2">
          <span className="text-xs font-semibold text-gray-600">ID</span>
          <div className="flex items-center gap-2">
            <span className="break-all text-sm text-gray-900">{data.id ?? "-"}</span>
            <CopyBtn value={data.id} />
          </div>
        </div>

        <Row label="Valor" value={formatBRL(amountValue)} />
        <Row label="Moeda" value={amountCurrency} />
        <Row label="Status" value={data.status} />
        <Row label="Erro" value={data.errorMessage ?? "-"} />
        <Row label="Criado em" value={formatDateTime(data.createdAt)} />
        <Row label="Fee fixa" value={formatBRL(data.fee?.fixed)} />
        <Row label="Fee variável" value={formatBRL(data.fee?.variable)} />
        <Row label="Fee adicional" value={formatBRL(data.fee?.additional)} />
      </div>
    </div>
  );
};
