import { useState } from "react";

export const DeskdataLawsuits = ({ lawsuits }: { lawsuits?: any }) => {
  if (!lawsuits) return null;

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const safe = (v: any) => (v === null || v === undefined || v === "" ? "-" : String(v));
  const fmtDate = (s?: string) => {
    if (!s) return "-";
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString("pt-BR");
  };

  const items = (lawsuits?.items ?? []) as any[];

  const Badge = ({ label, value }: { label: string; value: any }) => (
    <span className="rounded-md bg-white px-2 py-1 text-xs shadow-sm">
      <strong>{label}:</strong> {safe(value)}
    </span>
  );

  const Info = ({ label, value }: { label: string; value: any }) => (
    <div className="rounded-md bg-white p-2 text-xs shadow-sm">
      <div className="font-semibold text-gray-700">{label}</div>
      <div className="text-gray-900">{safe(value)}</div>
    </div>
  );

  return (
    <div className="mb-2 rounded-md border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 text-sm font-bold">Pessoas / Processos</div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge label="Total" value={lawsuits.total} />
        <Badge label="Autor" value={lawsuits.total_as_author} />
        <Badge label="Réu" value={lawsuits.total_as_defendant} />
        <Badge label="Outros" value={lawsuits.total_as_other} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-600">
          Nenhum processo retornado.
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((p, idx) => {
            const isOpen = openIdx === idx;
            const number = safe(p?.number);

            return (
              <div key={idx} className="rounded-md border border-gray-200 bg-white">
                {/* Linha enxuta: só o número (clicável) */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-gray-50"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <span className="font-mono text-sm font-semibold">{number}</span>
                  <span className="text-xs text-gray-500">
                    {isOpen ? "Fechar" : "Ver detalhes"}
                  </span>
                </button>

                {/* Ao clicar: mostra o processo “todo” */}
                {isOpen && (
                  <div className="border-t border-gray-200 p-3">
                    <div className="mb-2 text-xs text-gray-600">
                      Última atualização: <strong>{fmtDate(p?.last_update_date)}</strong>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                      <Info label="Status" value={p?.status} />
                      <Info label="Tribunal" value={p?.court_name} />
                      <Info label="UF" value={p?.court_state} />
                      <Info label="Distrito" value={p?.court_district} />
                      <Info label="Vara" value={p?.court_branch} />
                      <Info label="Sistema" value={p?.filing_system} />
                      <Info label="Publicação" value={fmtDate(p?.publication_date)} />
                      <Info label="Último evento" value={fmtDate(p?.last_event_date)} />
                      <Info label="Fechamento" value={fmtDate(p?.closing_date)} />
                      <Info label="Total partes" value={p?.total_parties} />
                      <Info label="Total eventos" value={p?.total_events} />
                    </div>

                    {Array.isArray(p?.parties) && p.parties.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-bold text-gray-700">Partes</div>
                        <ul className="list-disc pl-5 text-xs text-gray-700">
                          {p.parties.map((pt: any, i: number) => (
                            <li key={i}>
                              <strong>{safe(pt?.type)}:</strong> {safe(pt?.name)} ({safe(pt?.doc)})
                              — {safe(pt?.role)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(p?.events) && p.events.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-bold text-gray-700">Eventos</div>
                        <ul className="list-disc pl-5 text-xs text-gray-700">
                          {p.events.map((ev: any, i: number) => (
                            <li key={i}>
                              <strong>{fmtDate(ev?.date)}:</strong> {safe(ev?.content)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(p?.petitions) && p.petitions.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-bold text-gray-700">Petições</div>
                        <ul className="list-disc pl-5 text-xs text-gray-700">
                          {p.petitions.map((ptt: any, i: number) => (
                            <li key={i}>
                              <strong>{fmtDate(ptt?.date)}:</strong> {safe(ptt?.type)} —{" "}
                              {safe(ptt?.author)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(p?.decisions) && p.decisions.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-bold text-gray-700">Decisões</div>
                        <ul className="list-disc pl-5 text-xs text-gray-700">
                          {p.decisions.map((dc: any, i: number) => (
                            <li key={i}>
                              <strong>{fmtDate(dc?.date)}:</strong> {safe(dc?.content)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
