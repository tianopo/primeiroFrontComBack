export const DeskdataRelationships = ({ relationships }: { relationships?: any }) => {
  if (!relationships) return null;

  const safe = (v: any) => (v === null || v === undefined || v === "" ? "-" : String(v));
  const items = (relationships?.items ?? []) as any[];

  const Badge = ({ label, value }: { label: string; value: any }) => (
    <span className="rounded-md bg-white px-2 py-1 text-xs shadow-sm">
      <strong>{label}:</strong> {safe(value)}
    </span>
  );

  const Th = ({ children }: { children: any }) => <th className="border px-2 py-2">{children}</th>;
  const Td = ({ children, colSpan }: { children: any; colSpan?: number }) => (
    <td colSpan={colSpan} className="border px-2 py-2 align-top">
      {children}
    </td>
  );

  return (
    <div className="mb-4 rounded-md border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 text-sm font-bold">Empresa / Relacionamentos</div>

      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <Badge label="Total" value={relationships.total} />
        <Badge label="Total sócios" value={relationships.total_owners} />
        <Badge label="Total funcionários" value={relationships.total_employees} />
        <Badge label="Clientes" value={relationships.total_clients} />
        <Badge label="Fornecedores" value={relationships.total_suppliers} />
        <Badge label="Empresa familiar?" value={relationships.is_family_company} />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-200 text-left text-xs">
          <thead className="bg-gray-100">
            <tr>
              <Th>Nome</Th>
              <Th>Class</Th>
              <Th>Tipo</Th>
              <Th>Fonte</Th>
              <Th>Doc</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <Td colSpan={8}>
                  <div className="text-center text-gray-500">Nenhum relacionamento retornado.</div>
                </Td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <Td>{safe(it?.name)}</Td>
                  <Td>{safe(it?.class)}</Td>
                  <Td>{safe(it?.type)}</Td>
                  <Td>{safe(it?.source)}</Td>
                  <Td>
                    {safe(it?.tax_id?.type)} {safe(it?.tax_id?.number)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
