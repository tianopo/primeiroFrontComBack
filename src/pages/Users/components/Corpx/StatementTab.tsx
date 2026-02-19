import { Fragment, useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { StatusConsulta } from "./StatusConsulta";
import { RefundModal } from "./RefundModal"; // ajuste o path

const pad2 = (n: number) => String(n).padStart(2, "0");

// DD/MM/YY HH:MM
const formatDateShort = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yy = String(d.getFullYear()).slice(-2);
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
};

const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type FlatRow = { key: string; label: string; value: string };

const fieldLabel = (field: string) => {
  switch (field) {
    case "name":
      return "Nome";
    case "document":
      return "Documento";
    case "bankCode":
      return "Código do banco";
    case "bankName":
      return "Nome do banco";
    case "branch":
      return "Agência";
    case "account":
      return "Conta";
    case "pixKey":
      return "Chave PIX";
    default:
      return field;
  }
};

const friendlyLabel = (k: string) => {
  if (k === "timestamp") return "Data";
  if (k === "amount") return "Valor";
  if (k === "currency") return "Moeda";
  if (k === "description") return "Descrição";
  if (k === "identifier") return "Identificador";
  if (k === "operation") return "Operação";
  if (k === "method") return "Método";
  if (k === "status") return "Status";
  if (k === "direction") return "Direção";
  if (k === "endToEndId") return "EndToEnd ID (E2E)";
  if (k === "originalEndToEnd") return "E2E Original";
  if (k === "transactionType") return "Tipo de transação";
  if (k.startsWith("payer.")) return `Pagador - ${fieldLabel(k.replace("payer.", ""))}`;
  if (k.startsWith("payee.")) return `Recebedor - ${fieldLabel(k.replace("payee.", ""))}`;
  return k;
};

// “todos os dados”, sem JSON: flatten + label amigável
const flatten = (obj: any, prefix = "", out: FlatRow[] = [], depth = 0) => {
  if (obj === null || obj === undefined) return out;

  const maxDepth = 6;
  const maxArray = 50;

  const add = (k: string, v: any) => {
    let value: string;
    if (v === null || v === undefined) value = "-";
    else if (typeof v === "string") value = v;
    else if (typeof v === "number" || typeof v === "boolean") value = String(v);
    else value = "[obj]";

    out.push({ key: k, label: friendlyLabel(k), value });
  };

  if (typeof obj !== "object") {
    add(prefix || "value", obj);
    return out;
  }

  if (Array.isArray(obj)) {
    obj.slice(0, maxArray).forEach((item, i) => {
      const k = `${prefix}[${i}]`;
      if (item && typeof item === "object") flatten(item, k, out, depth + 1);
      else add(k, item);
    });
    if (obj.length > maxArray)
      out.push({ key: prefix, label: friendlyLabel(prefix), value: `... (${obj.length} itens)` });
    return out;
  }

  if (depth > maxDepth) {
    out.push({
      key: prefix || "obj",
      label: friendlyLabel(prefix || "obj"),
      value: "[profundidade máxima]",
    });
    return out;
  }

  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key, out, depth + 1);
    else add(key, v);
  });

  return out;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-h-[34px] items-center justify-between gap-2 border-b border-gray-100 px-2 py-1 last:border-b-0">
    <span className="text-[11px] font-semibold text-gray-600">{label}</span>
    <span className="max-w-[70%] break-all text-sm text-gray-900">{value || "-"}</span>
  </div>
);

export const StatementTab = (props: {
  accountId: string; // ✅ necessário para abrir RefundModal aqui
  statementQ: any;
  startDate: string;
  endDate: string;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onApply: () => void;
  page: number; // 0-based internamente
  size: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const {
    accountId,
    statementQ,
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    onApply,
    page,
    size,
    onPrev,
    onNext,
  } = props;

  const [statusActive, setStatusActive] = useState(false);

  const items = useMemo(() => {
    const data = statementQ.data;
    if (!data) return [];
    return Array.isArray(data.items) ? data.items : [];
  }, [statementQ.data]);

  const pageLabel = page + 1;

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // ✅ controle do RefundModal
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundCtx, setRefundCtx] = useState<{
    endToEndId?: string;
    amount?: number;
    name?: string;
    document?: string;
  }>({});

  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;

  const openRefundModal = (it: any) => {
    const direction = String(it?.direction ?? "").toUpperCase();
    const isIN = direction === "IN";
    if (!isIN) return; // ✅ só IN

    const e2e = it?.endToEndId || it?.originalEndToEnd || "";
    const amount = typeof it?.amount === "number" ? Math.abs(it.amount) : undefined;

    const name = it?.payer?.name;
    const document = it?.payer?.document;

    setRefundCtx({ endToEndId: e2e, amount, name, document });
    setRefundOpen(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <StatusConsulta
        onActiveChange={(active) => {
          setStatusActive(active);
          if (active) setSelectedIdx(null);
        }}
      />

      {statusActive ? null : (
        <>
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 p-3">
            <label className="text-sm">
              Início
              <input
                type="date"
                value={startDate}
                onChange={(e) => onChangeStart(e.target.value)}
                className="mt-1 rounded-6 border border-gray-200 px-3 py-2"
              />
            </label>

            <label className="text-sm">
              Fim
              <input
                type="date"
                value={endDate}
                onChange={(e) => onChangeEnd(e.target.value)}
                className="mt-1 rounded-6 border border-gray-200 px-3 py-2"
              />
            </label>

            <Button onClick={onApply}>Buscar</Button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-600">
                Página <strong>{pageLabel}</strong>
              </span>

              <Button onClick={onPrev} disabled={page <= 0}>
                ← Anterior
              </Button>

              <Button onClick={onNext}>Próxima →</Button>

              <span className="text-xs text-gray-500">size: {size}</span>
            </div>
          </div>

          {statementQ.isLoading ? (
            <p>Carregando extrato...</p>
          ) : statementQ.error ? (
            <p>Erro ao carregar extrato.</p>
          ) : !items.length ? (
            <p>Sem itens no período.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Data</th>
                    <th className="border px-4 py-2 text-left">Valor</th>
                    <th className="border px-4 py-2 text-left">Nome</th>
                    <th className="border px-4 py-2 text-left">Documento</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it: any, idx: number) => {
                    const direction = String(it?.direction ?? "").toUpperCase();
                    const isIN = direction === "IN";
                    const isOUT = direction === "OUT";

                    const rowBg = isIN ? "bg-green-50" : isOUT ? "bg-red-50" : "bg-white";

                    const amount = typeof it?.amount === "number" ? it.amount : 0;
                    const valueText = `${isIN ? "+" : "-"} ${formatBRL(Math.abs(amount))}`;

                    // ✅ cor do texto só na coluna valor
                    const valueColor = isIN
                      ? "text-green-700"
                      : isOUT
                        ? "text-red-700"
                        : "text-gray-900";

                    const name = isIN ? it?.payer?.name : it?.payee?.name;
                    const doc = isIN ? it?.payer?.document : it?.payee?.document;

                    const isSelected = selectedIdx === idx;

                    return (
                      <Fragment key={idx}>
                        <tr
                          className={`${rowBg} cursor-pointer hover:opacity-90`}
                          onClick={() => setSelectedIdx((prev) => (prev === idx ? null : idx))}
                          title="Clique para ver detalhes"
                        >
                          <td className="border px-4 py-2">{formatDateShort(it?.timestamp)}</td>
                          <td className={`border px-4 py-2 font-semibold ${valueColor}`}>
                            {valueText}
                          </td>
                          <td className="border px-4 py-2">{name ?? "-"}</td>
                          <td className="border px-4 py-2">{doc ?? "-"}</td>
                        </tr>

                        {isSelected && (
                          <tr>
                            <td colSpan={4} className="border px-3 py-2">
                              <div className="rounded-xl border border-gray-200 bg-white p-2">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <div className="text-sm font-semibold">Detalhes da transação</div>

                                  {/* ✅ botão APENAS para IN */}
                                  {String(it?.direction ?? "").toUpperCase() === "IN" && (
                                    <Button
                                      className="rounded-6 bg-orange-500 px-3 py-1.5 text-white"
                                      disabled={!(it?.endToEndId || it?.originalEndToEnd)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRefundModal(it);
                                      }}
                                    >
                                      Reembolsar
                                    </Button>
                                  )}
                                </div>

                                {/* ✅ detalhes completos (sem JSON), com labels PT-BR */}
                                <div className="grid gap-2 md:grid-cols-2">
                                  {flatten(it).map((row) => (
                                    <div
                                      key={row.key}
                                      className="rounded-lg border border-gray-100 p-1"
                                    >
                                      <DetailRow label={row.label} value={row.value} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ✅ RefundModal aberto pelo StatementTab */}
      {refundOpen && (
        <RefundModal
          accountId={accountId}
          endToEndId={refundCtx.endToEndId}
          defaultAmount={refundCtx.amount}
          counterpartyName={refundCtx.name}
          counterpartyDocument={refundCtx.document}
          onClose={() => setRefundOpen(false)}
        />
      )}
    </div>
  );
};
