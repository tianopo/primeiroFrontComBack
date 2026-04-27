import { DESKDATA_LABELS } from "../../config/deskdataCatalog";
import { DeskdataStoredDataset, DeskdataSummary } from "../../utils/deskdataTypes";

interface IDeskdataTab {
  summary: DeskdataSummary | Record<string, unknown> | null;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isStructuredSummary = (value: unknown): value is DeskdataSummary =>
  isRecord(value) && "subject" in value && "datasets" in value;

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value: unknown) => {
  if (!value || typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const getNested = (obj: unknown, path: string[]): unknown => {
  let current: unknown = obj;

  for (const key of path) {
    if (!isRecord(current) || !(key in current)) return undefined;
    current = current[key];
  }

  return current;
};

const renderFieldList = (record: UnknownRecord) => {
  const entries = Object.entries(record).filter(
    ([, value]) => typeof value !== "object" || value === null || value instanceof Date,
  );

  if (!entries.length) return null;

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">{formatLabel(key)}</div>
          <div className="text-sm">{formatPrimitive(value)}</div>
        </div>
      ))}
    </div>
  );
};

const GenericReadableBlock = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) {
    return <p className="text-sm text-gray-500">Nenhum dado encontrado.</p>;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>;
    }

    return (
      <div className="flex flex-col gap-3">
        {value.map((item, index) => (
          <div key={index} className="rounded border p-3">
            {isRecord(item) ? (
              <>
                {renderFieldList(item)}
                {Object.entries(item)
                  .filter(([, nested]) => isRecord(nested) || Array.isArray(nested))
                  .map(([nestedKey, nestedValue]) => (
                    <div key={nestedKey} className="mt-3">
                      <div className="mb-2 text-sm font-semibold">{formatLabel(nestedKey)}</div>
                      <GenericReadableBlock value={nestedValue} />
                    </div>
                  ))}
              </>
            ) : (
              <div className="text-sm">{formatPrimitive(item)}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) {
    return (
      <div className="flex flex-col gap-3">
        {renderFieldList(value)}
        {Object.entries(value)
          .filter(([, nested]) => isRecord(nested) || Array.isArray(nested))
          .map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="rounded border p-3">
              <div className="mb-2 text-sm font-semibold">{formatLabel(nestedKey)}</div>
              <GenericReadableBlock value={nestedValue} />
            </div>
          ))}
      </div>
    );
  }

  return <div className="text-sm">{formatPrimitive(value)}</div>;
};

const DatasetHeader = ({ title, payload }: { title: string; payload?: DeskdataStoredDataset }) => (
  <div className="mb-3">
    <h4 className="text-lg font-bold">{title}</h4>
    {payload && (
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Primeira busca</div>
          <div className="text-sm">{formatDate(payload.firstFetchedAt)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Última atualização</div>
          <div className="text-sm">{formatDate(payload.lastFetchedAt)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Qtd. consultas</div>
          <div className="text-sm">{formatPrimitive(payload.requestCount)}</div>
        </div>
      </div>
    )}
  </div>
);

const BasicDatasetView = ({ data }: { data: unknown }) => {
  const basic = getNested(data, ["basic"]) ?? getNested(data, ["data", "basic"]) ?? data;

  if (!isRecord(basic)) return <GenericReadableBlock value={basic} />;

  const name =
    getNested(basic, ["name", "full_name"]) ??
    getNested(basic, ["full_name"]) ??
    getNested(basic, ["name"]);

  const birthDate = getNested(basic, ["birth_date"]);
  const gender = getNested(basic, ["gender"]);
  const nationality = getNested(basic, ["nationality"]);
  const motherName = getNested(basic, ["mother_name"]);
  const fatherName = getNested(basic, ["father_name"]);

  const taxId = getNested(basic, ["tax_id"]);
  const maritalRecord = getNested(basic, ["marital_record"]);
  const obit = getNested(basic, ["obit"]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Nome</div>
          <div className="text-sm">{formatPrimitive(name)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Nascimento</div>
          <div className="text-sm">{formatDate(birthDate)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Gênero</div>
          <div className="text-sm">{formatPrimitive(gender)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Nacionalidade</div>
          <div className="text-sm">{formatPrimitive(nationality)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Mãe</div>
          <div className="text-sm">{formatPrimitive(motherName)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs font-semibold text-gray-500">Pai</div>
          <div className="text-sm">{formatPrimitive(fatherName)}</div>
        </div>
      </div>

      {isRecord(taxId) && (
        <div className="rounded border p-3">
          <div className="mb-2 font-semibold">Documento fiscal</div>
          <GenericReadableBlock value={taxId} />
        </div>
      )}

      {isRecord(maritalRecord) && (
        <div className="rounded border p-3">
          <div className="mb-2 font-semibold">Estado civil</div>
          <GenericReadableBlock value={maritalRecord} />
        </div>
      )}

      {isRecord(obit) && (
        <div className="rounded border p-3">
          <div className="mb-2 font-semibold">Óbito</div>
          <GenericReadableBlock value={obit} />
        </div>
      )}
    </div>
  );
};

const ContactListView = ({
  data,
  type,
}: {
  data: unknown;
  type: "phones" | "addresses" | "emails";
}) => {
  const normalized = getNested(data, [type]) ?? getNested(data, ["data", type]) ?? data;

  const items = asArray(getNested(normalized, ["items"])) || asArray(normalized);

  if (!items.length) {
    return <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        if (!isRecord(item)) {
          return (
            <div key={index} className="rounded border p-3 text-sm">
              {formatPrimitive(item)}
            </div>
          );
        }

        return (
          <div key={index} className="rounded border p-3">
            {renderFieldList(item)}
          </div>
        );
      })}
    </div>
  );
};

const RelationshipsView = ({ data }: { data: unknown }) => {
  const normalized =
    getNested(data, ["relationships"]) ?? getNested(data, ["data", "relationships"]) ?? data;

  const summary = isRecord(normalized) ? normalized : null;
  const items = asArray(getNested(normalized, ["items"]));

  return (
    <div className="flex flex-col gap-3">
      {summary && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {Object.entries(summary)
            .filter(([key, value]) => key !== "items" && typeof value !== "object")
            .map(([key, value]) => (
              <div key={key} className="rounded border p-2">
                <div className="text-xs font-semibold text-gray-500">{formatLabel(key)}</div>
                <div className="text-sm">{formatPrimitive(value)}</div>
              </div>
            ))}
        </div>
      )}

      {!items.length ? (
        <p className="text-sm text-gray-500">Nenhum relacionamento encontrado.</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="rounded border p-3">
            {isRecord(item) ? <GenericReadableBlock value={item} /> : formatPrimitive(item)}
          </div>
        ))
      )}
    </div>
  );
};

const RelationshipContactsView = ({
  data,
  type,
}: {
  data: unknown;
  type: "relationships_phones" | "relationships_addresses" | "relationships_emails";
}) => {
  const normalized = getNested(data, [type]) ?? getNested(data, ["data", type]) ?? data;

  const items = asArray(normalized);

  if (!items.length) {
    return <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded border p-3">
          {isRecord(item) ? <GenericReadableBlock value={item} /> : formatPrimitive(item)}
        </div>
      ))}
    </div>
  );
};

const LawsuitsView = ({ data }: { data: unknown }) => {
  const normalized = getNested(data, ["lawsuits"]) ?? getNested(data, ["data", "lawsuits"]) ?? data;

  const summary = isRecord(normalized) ? normalized : null;
  const items = asArray(getNested(normalized, ["items"]));

  return (
    <div className="flex flex-col gap-3">
      {summary && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {Object.entries(summary)
            .filter(([key, value]) => key !== "items" && typeof value !== "object")
            .map(([key, value]) => (
              <div key={key} className="rounded border p-2">
                <div className="text-xs font-semibold text-gray-500">{formatLabel(key)}</div>
                <div className="text-sm">{formatPrimitive(value)}</div>
              </div>
            ))}
        </div>
      )}

      {!items.length ? (
        <p className="text-sm text-gray-500">Nenhum processo encontrado.</p>
      ) : (
        items.map((item, index) => {
          if (!isRecord(item)) {
            return (
              <div key={index} className="rounded border p-3 text-sm">
                {formatPrimitive(item)}
              </div>
            );
          }

          const number = item.number;
          const type = item.type;
          const primarySubject = item.primary_subject;
          const courtName = item.court_name;
          const status = item.status;
          const publicationDate = item.publication_date;
          const lastEventDate = item.last_event_date;

          const parties = item.parties;
          const events = item.events;
          const decisions = item.decisions;
          const petitions = item.petitions;

          return (
            <div key={index} className="rounded border p-3">
              <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Número</div>
                  <div className="text-sm">{formatPrimitive(number)}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Tipo</div>
                  <div className="text-sm">{formatPrimitive(type)}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Assunto principal</div>
                  <div className="text-sm">{formatPrimitive(primarySubject)}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Tribunal</div>
                  <div className="text-sm">{formatPrimitive(courtName)}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Status</div>
                  <div className="text-sm">{formatPrimitive(status)}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Publicação</div>
                  <div className="text-sm">{formatDate(publicationDate)}</div>
                </div>
                <div className="rounded border p-2">
                  <div className="text-xs font-semibold text-gray-500">Último evento</div>
                  <div className="text-sm">{formatDate(lastEventDate)}</div>
                </div>
              </div>

              {parties != null && (
                <div className="mt-3">
                  <div className="mb-2 font-semibold">Partes</div>
                  <GenericReadableBlock value={parties} />
                </div>
              )}

              {events != null && (
                <div className="mt-3">
                  <div className="mb-2 font-semibold">Eventos</div>
                  <GenericReadableBlock value={events} />
                </div>
              )}

              {decisions != null && (
                <div className="mt-3">
                  <div className="mb-2 font-semibold">Decisões</div>
                  <GenericReadableBlock value={decisions} />
                </div>
              )}

              {petitions != null && (
                <div className="mt-3">
                  <div className="mb-2 font-semibold">Petições</div>
                  <GenericReadableBlock value={petitions} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

const DatasetContent = ({ dataset, data }: { dataset: string; data: unknown }) => {
  switch (dataset) {
    case "basic":
      return <BasicDatasetView data={data} />;
    case "phones":
    case "addresses":
    case "emails":
      return <ContactListView data={data} type={dataset} />;
    case "relationships":
      return <RelationshipsView data={data} />;
    case "relationships_phones":
    case "relationships_addresses":
    case "relationships_emails":
      return <RelationshipContactsView data={data} type={dataset} />;
    case "lawsuits":
      return <LawsuitsView data={data} />;
    default:
      return <GenericReadableBlock value={data} />;
  }
};

const LegacyDeskdataView = ({ summary }: { summary: Record<string, unknown> }) => {
  const entries = Object.entries(summary).filter(([key]) => key !== "balance");

  if (!entries.length) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
        Nenhum dado útil salvo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Deskdata</h4>
        <p className="text-sm text-gray-500">Este cadastro está no formato legado.</p>
      </section>

      {entries.map(([key, value]) => (
        <section key={key} className="rounded-md border border-gray-200 p-4">
          <DatasetHeader title={formatLabel(key)} />
          <GenericReadableBlock value={value} />
        </section>
      ))}
    </div>
  );
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
    return <LegacyDeskdataView summary={summary} />;
  }

  const datasetEntries = Object.entries(summary.datasets ?? {}) as Array<
    [string, DeskdataStoredDataset | undefined]
  >;

  const ownerEntries = Object.entries(summary.owner?.datasets ?? {}) as Array<
    [string, DeskdataStoredDataset | undefined]
  >;

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
              Executado em: {formatDate(summary.lastRequest.executedAt)}
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
        datasetEntries.map(([dataset, payload]) => {
          const safePayload = payload as DeskdataStoredDataset | undefined;

          return (
            <section key={dataset} className="rounded-md border border-gray-200 p-4">
              <DatasetHeader
                title={
                  DESKDATA_LABELS[dataset as keyof typeof DESKDATA_LABELS] ?? formatLabel(dataset)
                }
                payload={safePayload}
              />
              <DatasetContent dataset={dataset} data={safePayload?.data ?? null} />
            </section>
          );
        })
      )}

      {summary.owner?.document && (
        <section className="rounded-md border border-gray-200 p-4">
          <h4 className="mb-3 text-lg font-bold">CPF do primeiro sócio</h4>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-semibold">Documento</label>
            <input value={summary.owner.document} disabled className="w-full rounded border p-2" />
          </div>

          {!ownerEntries.length ? (
            <p className="text-sm text-gray-500">Nenhum dataset do sócio salvo.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {ownerEntries.map(([dataset, payload]) => {
                const safePayload = payload as DeskdataStoredDataset | undefined;

                return (
                  <div key={`owner-${dataset}`} className="rounded border p-3">
                    <DatasetHeader
                      title={`${
                        DESKDATA_LABELS[dataset as keyof typeof DESKDATA_LABELS] ??
                        formatLabel(dataset)
                      } do sócio`}
                      payload={safePayload}
                    />
                    <DatasetContent dataset={dataset} data={safePayload?.data ?? null} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
