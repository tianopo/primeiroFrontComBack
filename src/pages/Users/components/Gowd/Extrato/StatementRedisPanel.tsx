import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { useGowdSetStatementsVerificationBulk } from "../../../hooks/Corpx/useCorpxSetStatementVerification";
import {
  GowdStatementRedisItem,
  useGowdStatementRedis,
} from "../../../hooks/Corpx/useGowdStatementRedis";

export type StatementRedisPanelHandle = {
  verifySelectedTrue: () => Promise<boolean>;
};

type StatementRedisPanelProps = {
  autoSelectEndToEnd?: string;
  onVerifiedSuccess?: () => void;
  closeOnSuccess?: boolean;
  hideVerifyButton?: boolean;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDateShort = (iso?: string) => {
  if (!iso) return "-";

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(
    -2,
  )} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const formatBRL = (v: number) => {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

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
      e.stopPropagation();
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

export const StatementRedisPanel = forwardRef<StatementRedisPanelHandle, StatementRedisPanelProps>(
  ({ autoSelectEndToEnd, onVerifiedSuccess, closeOnSuccess, hideVerifyButton }, ref) => {
    const q = useGowdStatementRedis();
    const bulk = useGowdSetStatementsVerificationBulk();

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
          if (next[it.endToEnd] === undefined) {
            next[it.endToEnd] = Boolean(it?.verification);
          }
        }

        return next;
      });

      setSelected((prev) => {
        const validIds = new Set(items.map((it) => it.endToEnd).filter(Boolean));

        return new Set([...prev].filter((id) => validIds.has(id)));
      });
    }, [items]);

    useEffect(() => {
      const id = String(autoSelectEndToEnd ?? "");
      if (!id) return;

      const exists = items.some((it) => it?.endToEnd === id);
      if (!exists) return;

      setSelected((prev) => {
        const s = new Set(prev);
        s.add(id);
        return s;
      });

      setVerif((prev) => ({
        ...prev,
        [id]: true,
      }));
    }, [autoSelectEndToEnd, items]);

    const toggleSelect = (endToEnd: string) => {
      setSelected((prev) => {
        const s = new Set(prev);

        if (s.has(endToEnd)) s.delete(endToEnd);
        else s.add(endToEnd);

        return s;
      });
    };

    const onToggleSwitch = (endToEnd: string, v: boolean) => {
      setVerif((prev) => ({ ...prev, [endToEnd]: v }));

      setSelected((prev) => {
        const s = new Set(prev);

        if (v) s.add(endToEnd);
        else s.delete(endToEnd);

        return s;
      });
    };

    const selectedIds = useMemo(() => Array.from(selected), [selected]);

    const selectedTrue = useMemo(() => {
      return selectedIds.filter((id) => verif[id] === true);
    }, [selectedIds, verif]);

    const selectedTrueTotal = useMemo(() => {
      return selectedTrue.reduce((acc, endToEnd) => {
        const item = items.find((it) => it?.endToEnd === endToEnd);
        const amount = Number(item?.amount ?? 0);

        return acc + Math.abs(Number.isFinite(amount) ? amount : 0);
      }, 0);
    }, [items, selectedTrue]);

    const verifySelectedTrue = useCallback(async () => {
      if (!selectedTrue.length) return true;

      return new Promise<boolean>((resolve) => {
        bulk.mutate(
          {
            items: selectedTrue.map((endToEnd) => ({
              endToEnd,
              verification: true,
            })),
          },
          {
            onSuccess: () => {
              toast.success("Verificação atualizada com sucesso!");
              setSelected(new Set());
              q.refetch();

              if (closeOnSuccess) onVerifiedSuccess?.();

              resolve(true);
            },
            onError: () => {
              toast.error("Erro ao atualizar verificação no Redis.");
              resolve(false);
            },
          },
        );
      });
    }, [bulk, closeOnSuccess, onVerifiedSuccess, q, selectedTrue]);

    useImperativeHandle(
      ref,
      () => ({
        verifySelectedTrue,
      }),
      [verifySelectedTrue],
    );

    return (
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold">Transações (Redis)</h2>

            <span className="text-xs text-gray-500">
              Atualiza a cada 30s • {q.data?.date ? `Dia: ${q.data.date}` : "Dia atual"}
            </span>

            <span className="text-xs text-gray-500">
              Selecionadas: <strong>{selectedIds.length}</strong> • Marcadas:{" "}
              <strong>{selectedTrue.length}</strong>
            </span>

            <span className="text-sm font-semibold text-blue-700">
              Somatório: {formatBRL(selectedTrueTotal)}
            </span>
          </div>

          <Button onClick={() => q.refetch()} disabled={q.isFetching || bulk.isPending}>
            Atualizar
          </Button>
        </div>

        {q.isLoading ? (
          <p className="mt-4">Carregando transações...</p>
        ) : q.error ? (
          <p className="mt-4">Erro ao carregar transações do Redis.</p>
        ) : !items.length ? (
          <p className="mt-4">Sem transações</p>
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
                  {items.map((it: GowdStatementRedisItem, idx: number) => {
                    const op = String(it?.operation ?? "").toUpperCase();
                    const isIN = op === "LOAD";
                    const amount = Number(it?.amount ?? 0);

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
                          <Switch
                            checked={checked}
                            disabled={!endToEnd || bulk.isPending}
                            onChange={(v) => endToEnd && onToggleSwitch(endToEnd, v)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!hideVerifyButton && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  className="rounded-6 bg-blue-600 px-4 py-2 text-white"
                  disabled={!selectedTrue.length || bulk.isPending}
                  onClick={() => void verifySelectedTrue()}
                >
                  Verifique ({selectedTrue.length}) - {formatBRL(selectedTrueTotal)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

StatementRedisPanel.displayName = "StatementRedisPanel";
