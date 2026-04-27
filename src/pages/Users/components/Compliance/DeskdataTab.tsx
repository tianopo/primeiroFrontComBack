import { DESKDATA_LABELS } from "../../config/deskdataCatalog";
import { DeskdataSummary } from "../../utils/deskdataTypes";

interface IDeskdataTab {
  summary: DeskdataSummary | Record<string, unknown> | null;
}

const isStructuredSummary = (value: unknown): value is DeskdataSummary => {
  return Boolean(value && typeof value === "object" && "subject" in value && "datasets" in value);
};

const getLegacyEntries = (value: Record<string, unknown>) => {
  return Object.entries(value).filter(([key]) => key !== "balance");
};

export const DeskdataTab = ({ summary }: IDeskdataTab) => {
  if (!summary || typeof summary !== "object") {
    return (
      <div className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Deskdata</h4>
        <p className="text-sm text-gray-500">Nenhum dado de Deskdata salvo.</p>
      </div>
    );
  }

  if (!isStructuredSummary(summary)) {
    const legacyEntries = getLegacyEntries(summary);

    return (
      <div className="flex flex-col gap-4">
        <section className="rounded-md border border-gray-200 p-4">
          <h4 className="mb-3 text-lg font-bold">Deskdata</h4>
          <p className="text-sm text-gray-500">Este cadastro ainda está no formato legado.</p>
        </section>

        {legacyEntries.length === 0 ? (
          <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
            Nenhum dado útil salvo.
          </div>
        ) : (
          legacyEntries.map(([key, value]) => (
            <section key={key} className="rounded-md border border-gray-200 p-4">
              <h4 className="mb-3 text-lg font-bold">{key}</h4>
              <textarea
                disabled
                value={JSON.stringify(value ?? null, null, 2)}
                className="min-h-[260px] w-full rounded border p-2 text-xs"
              />
            </section>
          ))
        )}
      </div>
    );
  }

  const datasetEntries = Object.entries(summary.datasets ?? {});

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Deskdata</h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Documento</label>
            <input
              value={summary.subject.document}
              disabled
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Tipo</label>
            <input value={summary.subject.kind} disabled className="w-full rounded border p-2" />
          </div>
        </div>

        {summary.lastRequest && (
          <div className="mt-4 rounded border p-3">
            <div className="font-semibold">Última sincronização</div>
            <div className="mt-2 text-sm">
              Executado em: {new Date(summary.lastRequest.executedAt).toLocaleString()}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {summary.lastRequest.requested.map((item) => (
                <span
                  key={`requested-${item}`}
                  className="rounded-full border bg-gray-100 px-3 py-1 text-xs"
                >
                  Pedido: {DESKDATA_LABELS[item]}
                </span>
              ))}
              {summary.lastRequest.fetchedNow.map((item) => (
                <span
                  key={`fetched-${item}`}
                  className="rounded-full border bg-green-100 px-3 py-1 text-xs"
                >
                  Buscado agora: {DESKDATA_LABELS[item]}
                </span>
              ))}
              {summary.lastRequest.reusedFromCache.map((item) => (
                <span
                  key={`cache-${item}`}
                  className="rounded-full border bg-blue-100 px-3 py-1 text-xs"
                >
                  Cache: {DESKDATA_LABELS[item]}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {datasetEntries.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
          Nenhum dataset salvo.
        </div>
      ) : (
        datasetEntries.map(([dataset, payload]) => (
          <section key={dataset} className="rounded-md border border-gray-200 p-4">
            <h4 className="mb-3 text-lg font-bold">
              {DESKDATA_LABELS[dataset as keyof typeof DESKDATA_LABELS] ?? dataset}
            </h4>

            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold">Primeira busca</label>
                <input
                  value={
                    payload?.firstFetchedAt ? new Date(payload.firstFetchedAt).toLocaleString() : ""
                  }
                  disabled
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Última atualização</label>
                <input
                  value={
                    payload?.lastFetchedAt ? new Date(payload.lastFetchedAt).toLocaleString() : ""
                  }
                  disabled
                  className="w-full rounded border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Qtd. consultas</label>
                <input
                  value={String(payload?.requestCount ?? 0)}
                  disabled
                  className="w-full rounded border p-2"
                />
              </div>
            </div>

            <textarea
              disabled
              value={JSON.stringify(payload?.data ?? null, null, 2)}
              className="min-h-[260px] w-full rounded border p-2 text-xs"
            />
          </section>
        ))
      )}
      {summary.owner?.document && (
        <section className="rounded-md border border-gray-200 p-4">
          <h4 className="mb-3 text-lg font-bold">CPF do primeiro sócio</h4>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-semibold">Documento</label>
            <input value={summary.owner.document} disabled className="w-full rounded border p-2" />
          </div>

          {Object.entries(summary.owner.datasets ?? {}).length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum dataset do sócio salvo.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(summary.owner.datasets ?? {}).map(([dataset, payload]) => (
                <div key={`owner-${dataset}`} className="rounded border p-3">
                  <h5 className="mb-2 font-semibold">
                    {DESKDATA_LABELS[dataset as keyof typeof DESKDATA_LABELS] ?? dataset}
                  </h5>

                  <textarea
                    disabled
                    value={JSON.stringify(payload?.data ?? null, null, 2)}
                    className="min-h-[220px] w-full rounded border p-2 text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
