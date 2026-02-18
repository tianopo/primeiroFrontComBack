import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { useCorpxTransactionStatus } from "../../hooks/Corpx/useCorpxTransactionStatus";

export const StatusTab = () => {
  const [endToEndId, setEndToEndId] = useState("");
  const { mutate, data, isPending } = useCorpxTransactionStatus();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 font-semibold">Consultar Status por E2E</div>

        <input
          value={endToEndId}
          onChange={(e) => setEndToEndId(e.target.value)}
          placeholder="EndToEndId (E...)"
          className="w-full rounded-6 border border-gray-200 px-3 py-2"
        />

        <Button
          className="mt-2 rounded-6 bg-blue-500 text-white"
          disabled={!endToEndId || isPending}
          onClick={() => mutate({ endToEndId })}
        >
          {isPending ? "Consultando..." : "Consultar"}
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 font-semibold">Resposta</div>
        <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">
          {data ? JSON.stringify(data, null, 2) : "Sem consulta ainda."}
        </pre>
      </div>
    </div>
  );
};
