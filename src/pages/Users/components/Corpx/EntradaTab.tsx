import { useMemo } from "react";
import { Button } from "src/components/Buttons/Button";

export const EntradasTab = ({
  data,
  isLoading,
  error,
  onRefund,
}: {
  data: any;
  isLoading: boolean;
  error: boolean;
  onRefund: (endToEndId: string, amount?: number) => void;
}) => {
  // normaliza resposta: {items:[]} ou []
  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }, [data]);

  if (isLoading) return <p>Carregando entradas...</p>;
  if (error) return <p>Erro ao carregar entradas.</p>;
  if (!items.length)
    return (
      <div>
        <p>Sem entradas (QR Codes pagos).</p>
        <pre className="mt-2 max-h-56 overflow-auto rounded bg-gray-50 p-2 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );

  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Identifier</th>
            <th className="border px-4 py-2 text-left">Valor</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">E2E</th>
            <th className="border px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it: any, idx: number) => {
            const identifier = it.identifier ?? it.id ?? "-";
            const value = it.paidAmount ?? it.value ?? it.amount ?? "-";
            const status = it.status ?? "-";
            const e2e = it.endToEndId ?? it.end_to_end ?? "-";

            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{identifier}</td>
                <td className="border px-4 py-2">{value}</td>
                <td className="border px-4 py-2">{status}</td>
                <td className="border px-4 py-2">{e2e}</td>
                <td className="border px-4 py-2">
                  <Button
                    className="rounded-6 bg-orange-500 text-white"
                    disabled={!e2e || e2e === "-"}
                    onClick={() =>
                      onRefund(String(e2e), typeof value === "number" ? value : undefined)
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

      {/* “mostra resposta do extrato” (raw) */}
      <pre className="mt-3 max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
