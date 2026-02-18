import { useMemo } from "react";
import { Button } from "src/components/Buttons/Button";

export const StatementTab = (props: {
  statementQ: any;
  startDate: string;
  endDate: string;
  onChangeStart: (v: string) => void;
  onChangeEnd: (v: string) => void;
  onApply: () => void;
  page: number;
  size: number;
  onPrev: () => void;
  onNext: () => void;
  onRefund: (endToEndId: string, amount?: number) => void;
}) => {
  const {
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
    onRefund,
  } = props;

  const items = useMemo(() => {
    const data = statementQ.data;
    if (!data) return [];
    return Array.isArray(data.items) ? data.items : [];
  }, [statementQ.data]);

  return (
    <div className="flex flex-col gap-3">
      {/* Filtros */}
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

        <Button className="rounded-6 bg-blue-500 text-white" onClick={onApply}>
          Buscar
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button className="rounded-6 bg-gray-200" onClick={onPrev} disabled={page <= 1}>
            Página {page} ←
          </Button>
          <Button className="rounded-6 bg-gray-200" onClick={onNext}>
            → Próxima
          </Button>
          <span className="text-xs text-gray-500">size: {size}</span>
        </div>
      </div>

      {/* Conteúdo */}
      {statementQ.isLoading ? (
        <p>Carregando extrato...</p>
      ) : statementQ.error ? (
        <p>Erro ao carregar extrato.</p>
      ) : !items.length ? (
        <div>
          <p>Sem itens no período.</p>
          <pre className="mt-2 max-h-56 overflow-auto rounded bg-gray-50 p-2 text-xs">
            {JSON.stringify(statementQ.data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Data</th>
                <th className="border px-4 py-2 text-left">Direção</th>
                <th className="border px-4 py-2 text-left">Tipo</th>
                <th className="border px-4 py-2 text-left">Valor</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Identifier</th>
                <th className="border px-4 py-2 text-left">E2E</th>
                <th className="border px-4 py-2 text-left">Pagador</th>
                <th className="border px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, idx: number) => {
                const direction = it.direction ?? "-";
                const type = it.transactionType ?? it.feeServiceType ?? "-";
                const amount = it.amount ?? 0;
                const status = it.status ?? "-";
                const identifier = it.identifier ?? it.qrcodeIdentifier ?? "-";

                // ✅ E2E para devolução (prioriza originalEndToEnd conforme seu exemplo)
                const e2e = it.originalEndToEnd ?? it.endToEndId ?? "";

                // ✅ transação de entrada
                const isEntrada = String(direction).toUpperCase() === "IN";

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{it.timestamp ?? "-"}</td>
                    <td className="border px-4 py-2">{direction}</td>
                    <td className="border px-4 py-2">{type}</td>
                    <td className="border px-4 py-2">{amount}</td>
                    <td className="border px-4 py-2">{status}</td>
                    <td className="border px-4 py-2">{identifier}</td>
                    <td className="border px-4 py-2">{e2e || "-"}</td>
                    <td className="border px-4 py-2">{it?.payer?.name ?? "-"}</td>
                    <td className="border px-4 py-2">
                      <Button
                        className="rounded-6 bg-orange-500 text-white"
                        disabled={!isEntrada || !e2e}
                        onClick={() =>
                          onRefund(
                            String(e2e),
                            typeof amount === "number" ? Math.abs(amount) : undefined,
                          )
                        }
                      >
                        Devolver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ✅ mostrar resposta do extrato raw */}
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">
            {JSON.stringify(statementQ.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
