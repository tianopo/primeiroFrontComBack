interface IBybitCompliancePopover {
  data: any;
  onClose: () => void;
}

export const BybitCompliancePopover = ({ data, onClose }: IBybitCompliancePopover) => {
  if (!data) return null;

  return (
    <div className="absolute right-0 top-0 z-50 w-[380px] rounded-lg border bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-bold">Compliance</h4>
        <button type="button" onClick={onClose}>
          Fechar
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Resumo:</strong> {data.summary || "-"}
        </div>
        <div>
          <strong>Status:</strong> {data.status}
        </div>
        <div>
          <strong>Bloqueado:</strong> {data.blocked ? "Sim" : "Não"}
        </div>
        <div>
          <strong>Motivo do bloqueio:</strong> {data.blockedReason || "-"}
        </div>
        <div>
          <strong>Limite mensal:</strong> {data.monthlyLimitBrl}
        </div>
        <div>
          <strong>Limite por ordem:</strong> {data.maxSingleOrderBrl}
        </div>
        <div>
          <strong>Restrição até:</strong> {data.temporaryRestrictionUntil || "-"}
        </div>
        <div>
          <strong>Motivo da restrição:</strong> {data.temporaryRestrictionReason || "-"}
        </div>
        <div>
          <strong>Soma ordens 30 dias:</strong> {data.behavior?.monthlyVolumeBrl ?? 0}
        </div>
        <div>
          <strong>Ordens altas em 30 dias:</strong> {data.behavior?.highValueOrders30d ?? 0}
        </div>
        <div>
          <strong>Ordens altas em 1 dia:</strong> {data.behavior?.highValueOrders1d ?? 0}
        </div>
        <div>
          <strong>Idade da conta:</strong> {data.behavior?.accountAgeDays ?? 0} dias
        </div>

        <div className="pt-2">
          <strong>Documentos pendentes</strong>
          {data.pendingDocuments?.length ? (
            <ul className="mt-1 list-disc pl-5">
              {data.pendingDocuments.map((item: any) => (
                <li key={item.type}>
                  {item.label} - status: {item.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma pendência.</p>
          )}
        </div>

        <div className="pt-2">
          <strong>Eventos recentes</strong>
          {data.recentEvents?.length ? (
            <div className="mt-1 space-y-2">
              {data.recentEvents.map((event: any) => (
                <div key={event.id} className="rounded border p-2">
                  <div className="font-semibold">{event.title}</div>
                  <div>{event.description || "-"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum evento.</p>
          )}
        </div>
      </div>
    </div>
  );
};
