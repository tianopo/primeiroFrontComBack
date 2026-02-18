import { useMemo } from "react";
import { Button } from "src/components/Buttons/Button";
import { useCorpxRespondMed } from "../../hooks/Corpx/useCorpxRespondMed";

export const MedTab = ({
  accountId,
  data,
  isLoading,
  error,
}: {
  accountId: string;
  data: any;
  isLoading: boolean;
  error: boolean;
}) => {
  const { mutate: respondMed, isPending } = useCorpxRespondMed();

  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }, [data]);

  if (!accountId) return <p>Informe o accountId.</p>;
  if (isLoading) return <p>Carregando MEDs...</p>;
  if (error) return <p>Erro ao carregar MEDs.</p>;
  if (!items.length)
    return (
      <div>
        <p>Sem MEDs em aberto.</p>
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
            <th className="border px-4 py-2 text-left">MED ID</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">E2E</th>
            <th className="border px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m: any, idx: number) => {
            const medId = m.medId ?? m.id ?? "-";
            const status = m.status ?? "-";
            const e2e = m.endToEndId ?? "-";

            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{medId}</td>
                <td className="border px-4 py-2">{status}</td>
                <td className="border px-4 py-2">{e2e}</td>
                <td className="flex gap-2 border px-4 py-2">
                  <Button
                    className="rounded-6 bg-green-600 text-white"
                    disabled={isPending || medId === "-"}
                    onClick={() =>
                      respondMed({
                        accountId,
                        medId: String(medId),
                        body: { answer: "AGREE", message: "We acknowledge the refund request" },
                      })
                    }
                  >
                    Concordar
                  </Button>
                  <Button
                    className="rounded-6 bg-red-600 text-white"
                    disabled={isPending || medId === "-"}
                    onClick={() =>
                      respondMed({
                        accountId,
                        medId: String(medId),
                        body: {
                          answer: "DISAGREE",
                          message: "We do not agree with the refund request",
                        },
                      })
                    }
                  >
                    Discordar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <pre className="mt-3 max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
