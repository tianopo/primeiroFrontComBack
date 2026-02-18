import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { useUpdateCorpxPixLimits } from "../../hooks/Corpx/useUpdateCorpxPixLimits";

export const LimitsTab = ({ limits, loading }: { limits: any; loading: boolean }) => {
  const { mutate: updateLimits, isPending } = useUpdateCorpxPixLimits();

  const [daily, setDaily] = useState<number>(limits?.dailyLimitBrl ?? 0);
  const [nightly, setNightly] = useState<number>(limits?.nightlyLimitBrl ?? 0);
  const [instant, setInstant] = useState<number>(limits?.instantLimitBrl ?? 0);

  useEffect(() => {
    if (!limits) return;
    setDaily(limits.dailyLimitBrl ?? 0);
    setNightly(limits.nightlyLimitBrl ?? 0);
    setInstant(limits.instantLimitBrl ?? 0);
  }, [limits]);

  if (loading) return <p>Carregando limites...</p>;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 font-semibold">Editar Limites</div>

        <div className="grid gap-2">
          <label className="text-sm">
            Diário (BRL)
            <input
              type="number"
              value={daily}
              onChange={(e) => setDaily(Number(e.target.value))}
              className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Noturno (BRL)
            <input
              type="number"
              value={nightly}
              onChange={(e) => setNightly(Number(e.target.value))}
              className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Instantâneo (BRL)
            <input
              type="number"
              value={instant}
              onChange={(e) => setInstant(Number(e.target.value))}
              className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            />
          </label>

          <Button
            className="mt-2 rounded-6 bg-blue-500 text-white"
            disabled={isPending}
            onClick={() =>
              updateLimits({
                body: { dailyLimitBrl: daily, nightlyLimitBrl: nightly, instantLimitBrl: instant },
              })
            }
          >
            {isPending ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 font-semibold">Resposta (raw)</div>
        <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">
          {JSON.stringify(limits, null, 2)}
        </pre>
      </div>
    </div>
  );
};
