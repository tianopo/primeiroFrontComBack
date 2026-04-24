type SanctionItem = Record<string, unknown>;

interface ISanctionsTab {
  sanctionsSummary: Record<string, unknown> | null | undefined;
  sanctions:
    | {
        maxSimilarity?: number;
        severeCrimeKeywords?: string[];
        ofac?: SanctionItem[];
        europa?: SanctionItem[];
        csnu?: SanctionItem[];
        palestinaCouncil?: SanctionItem[];
      }
    | null
    | undefined;
}

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
};

const extractName = (item: SanctionItem): string => {
  return formatPrimitive(
    item.fullName ??
      item.full_name ??
      item.name ??
      item.nome ??
      item.entity_name ??
      item.denominazione ??
      item.title,
  );
};

const extractReference = (item: SanctionItem): string => {
  return formatPrimitive(
    item.document ??
      item.documento ??
      item.cpf ??
      item.cnpj ??
      item.tax_id ??
      item.id_number ??
      item.euRefNum ??
      item.ref ??
      item.codigo ??
      item.code,
  );
};

const extractSource = (item: SanctionItem): string => {
  return formatPrimitive(
    item.programme ??
      item.countries ??
      item.section ??
      item.person ??
      item.subjectType ??
      item.list_name ??
      item.source,
  );
};

const extractExtraInfo = (item: SanctionItem): string => {
  return formatPrimitive(
    item.information ?? item.remark ?? item.description ?? item.descricao ?? item.lebaNumtitle,
  );
};

const extractLink = (item: SanctionItem): string | null => {
  const value = item.lebaUrl ?? item.link ?? item.url;
  if (!value) return null;
  return String(value);
};

const SanctionList = ({ title, items }: { title: string; items: SanctionItem[] | undefined }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="rounded-md border border-gray-200 p-4">
      <h4 className="mb-3 text-lg font-bold">
        {title} ({items.length})
      </h4>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const link = extractLink(item);

          return (
            <div key={`${title}-${index}`} className="rounded border p-3 text-sm">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <strong>Nome:</strong> {extractName(item)}
                </div>
                <div>
                  <strong>Documento / Referência:</strong> {extractReference(item)}
                </div>
                <div>
                  <strong>Similaridade:</strong> {formatPrimitive(item.similarity ?? item.score)}
                </div>
                <div>
                  <strong>Fonte / Programa / Seção:</strong> {extractSource(item)}
                </div>
                <div className="md:col-span-2">
                  <strong>Informações:</strong> {extractExtraInfo(item)}
                </div>
                {link && (
                  <div className="md:col-span-2">
                    <strong>Link:</strong>{" "}
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Abrir
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const SanctionsTab = ({ sanctionsSummary, sanctions }: ISanctionsTab) => {
  const ofac = sanctions?.ofac ?? [];
  const europa = sanctions?.europa ?? [];
  const csnu = sanctions?.csnu ?? [];
  const palestinaCouncil = sanctions?.palestinaCouncil ?? [];
  const severeCrimeKeywords = sanctions?.severeCrimeKeywords ?? [];
  const maxSimilarity = sanctions?.maxSimilarity ?? sanctionsSummary?.maxSimilarity ?? null;

  const hasAnySanction =
    ofac.length > 0 || europa.length > 0 || csnu.length > 0 || palestinaCouncil.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-gray-200 p-4">
        <h4 className="mb-3 text-lg font-bold">Resumo das sanções</h4>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded border p-3 text-sm">
            <div>
              <strong>Maior similaridade:</strong> {formatPrimitive(maxSimilarity)}
            </div>
            <div>
              <strong>OFAC:</strong> {ofac.length}
            </div>
            <div>
              <strong>Europa:</strong> {europa.length}
            </div>
            <div>
              <strong>CSNU:</strong> {csnu.length}
            </div>
            <div>
              <strong>Palestina:</strong> {palestinaCouncil.length}
            </div>
          </div>

          <div className="rounded border p-3 text-sm">
            <strong>Palavras-chave graves</strong>
            {severeCrimeKeywords.length === 0 ? (
              <div className="mt-2">Nenhuma palavra-chave grave encontrada.</div>
            ) : (
              <ul className="mt-2 list-disc pl-5">
                {severeCrimeKeywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {!hasAnySanction ? (
        <div className="rounded-md border border-gray-200 p-4 text-sm">
          Nenhum resultado encontrado nas listas restritivas.
        </div>
      ) : (
        <>
          <SanctionList title="OFAC" items={ofac} />
          <SanctionList title="Europa" items={europa} />
          <SanctionList title="CSNU" items={csnu} />
          <SanctionList title="Conselho da Palestina" items={palestinaCouncil} />
        </>
      )}
    </div>
  );
};
