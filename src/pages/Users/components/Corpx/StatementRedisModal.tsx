import { useEffect, useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { useCorpxSetStatementsVerificationBulk } from "../../hooks/Corpx/useCorpxSetStatementVerification";
import {
  CorpxStatementRedisItem,
  useCorpxStatementRedis,
} from "../../hooks/Corpx/useCorpxStatementRedis";

const pad2 = (n: number) => String(n).padStart(2, "0");

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

const Switch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation(); // ✅ não seleciona a linha ao clicar no switch
      onChange(!checked);
    }}
    className={[
      "relative inline-flex h-6 w-11 items-center rounded-full transition",
      checked ? "bg-green-600" : "bg-gray-300",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    ].join(" ")}
    aria-pressed={checked}
  >
    <span
      className={[
        "inline-block h-5 w-5 transform rounded-full bg-white transition",
        checked ? "translate-x-5" : "translate-x-1",
      ].join(" ")}
    />
  </button>
);

export const StatementRedisModal = ({ onClose }: { onClose: () => void }) => {
  const q = useCorpxStatementRedis();
  const bulk = useCorpxSetStatementsVerificationBulk();

  const items = useMemo(() => {
    const data = q.data;
    if (!data) return [];
    return Array.isArray(data.items) ? data.items : [];
  }, [q.data]);

  const [verif, setVerif] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setVerif((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (!it?.endToEnd) continue;
        // se já existe no estado local, mantém; senão, inicializa do backend
        if (next[it.endToEnd] === undefined) next[it.endToEnd] = Boolean(it?.verification);
      }
      return next;
    });

    setSelected((prev) => {
      const validIds = new Set(items.map((it) => it.endToEnd).filter(Boolean));
      return new Set([...prev].filter((id) => validIds.has(id)));
    });
  }, [items]);

  const toggleSelect = (endToEnd: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(endToEnd)) s.delete(endToEnd);
      else s.add(endToEnd);
      return s;
    });
  };

  const onToggleSwitch = (endToEnd: string, v: boolean) => {
    // marca/desmarca o switch
    setVerif((prev) => ({ ...prev, [endToEnd]: v }));

    // ✅ se marcou true -> seleciona; se marcou false -> remove da seleção
    setSelected((prev) => {
      const s = new Set(prev);
      if (v) s.add(endToEnd);
      else s.delete(endToEnd);
      return s;
    });
  };

  const selectedIds = Array.from(selected);
  const selectedTrue = selectedIds.filter((id) => verif[id] === true);

  const verifySelectedTrue = async () => {
    if (!selectedTrue.length) return;

    await bulk.mutateAsync({
      items: selectedTrue.map((endToEnd) => ({ endToEnd, verification: true })),
      // date: q.data?.date,
    });

    // limpa seleção após enviar
    setSelected(new Set());
  };
  console.log(selected);
  return (
    <Modal onClose={onClose} fit={false}>
      <div className="flex items-center justify-between gap-2 pr-10">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Transações (Redis)</h2>
          <span className="text-xs text-gray-500">
            Atualiza a cada 30s • {q.data?.date ? `Dia: ${q.data.date}` : "Dia atual"}
          </span>
          <span className="text-xs text-gray-500">
            Selecionadas: <strong>{selectedIds.length}</strong>
          </span>
        </div>

        <Button onClick={() => q.refetch()} disabled={q.isFetching}>
          Atualizar
        </Button>
      </div>

      {q.isLoading ? (
        <p className="mt-4">Carregando transações...</p>
      ) : q.error ? (
        <p className="mt-4">Erro ao carregar transações do Redis.</p>
      ) : !items.length ? (
        <p className="mt-4">Sem transações no Redis.</p>
      ) : (
        <>
          <div className="mt-4 overflow-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Data</th>
                  <th className="border px-4 py-2 text-left">Valor</th>
                  <th className="border px-4 py-2 text-left">Nome</th>
                  <th className="border px-4 py-2 text-left">Documento</th>
                  <th className="border px-4 py-2 text-left">Verification</th>
                </tr>
              </thead>

              <tbody>
                {items.map((it: CorpxStatementRedisItem, idx: number) => {
                  const direction = String(it?.direction ?? "").toUpperCase();
                  const isIN = direction === "IN";
                  const amount = typeof it?.amount === "number" ? it.amount : 0;

                  const endToEnd = it?.endToEnd || "";
                  const checked = endToEnd ? Boolean(verif[endToEnd]) : false;
                  const isSelected = endToEnd ? selected.has(endToEnd) || checked : false;

                  const valueColor = isIN ? "text-green-700" : "text-red-700";
                  const prefix = isIN ? "+" : "-";

                  return (
                    <tr
                      key={endToEnd || String(idx)}
                      className={[
                        "hover:opacity-90",
                        endToEnd ? "cursor-pointer" : "",
                        isSelected ? "bg-blue-50" : "",
                      ].join(" ")}
                      onClick={() => endToEnd && toggleSelect(endToEnd)}
                      title="Clique para selecionar"
                    >
                      <td className="border px-4 py-2">{formatDateShort(it?.timestamp)}</td>

                      <td className={`border px-4 py-2 font-semibold ${valueColor}`}>
                        <span className="inline-flex w-4 justify-center">{prefix}</span>
                        {formatBRL(Math.abs(amount))}
                      </td>

                      <td className="border px-4 py-2">{it?.name ?? "-"}</td>
                      <td className="border px-4 py-2">{it?.document ?? "-"}</td>

                      <td className="border px-4 py-2">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={checked}
                            disabled={!endToEnd || bulk.isPending}
                            onChange={(v) => endToEnd && onToggleSwitch(endToEnd, v)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ único botão abaixo da tabela */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button disabled={!selectedTrue.length || bulk.isPending} onClick={verifySelectedTrue}>
              Verifique ({selectedTrue.length})
            </Button>
          </div>
        </>
      )}

      {bulk.isError ? (
        <p className="mt-3 text-sm text-red-600">Erro ao atualizar verification em lote.</p>
      ) : null}
    </Modal>
  );
};
