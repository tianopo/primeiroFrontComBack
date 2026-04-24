interface EuropaEntry {
  fullName: string;
  similarity: string;
  subjectType: string;
  programme: string;
  euRefNum: string;
  remark: string;
  lebaNumtitle: string;
  lebaUrl: string;
}

export const Europa = ({ responseData }: { responseData: EuropaEntry[] }) => {
  if (!responseData || !Array.isArray(responseData) || responseData.length === 0) return null;

  const colorClass = (sim: string) => {
    const n = Number(sim);
    if (n < 50) return "text-green-500";
    if (n < 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <ul className="px-3">
      <h4 className="font-bold">Lista Europa (UE)</h4>

      {responseData.map((entry, index) => (
        <li key={index} className="mb-4 border-b pb-2">
          <p>
            <strong>Nome Completo:</strong> {entry.fullName}
          </p>

          <p className={colorClass(entry.similarity)}>
            <strong>Similaridade:</strong> {entry.similarity}%
          </p>

          <p>
            <strong>Tipo:</strong> {entry.subjectType}
          </p>

          <p>
            <strong>Programa:</strong> {entry.programme}
          </p>

          <p>
            <strong>EU Ref:</strong> {entry.euRefNum}
          </p>

          {entry.remark && (
            <p>
              <strong>Observação:</strong> {entry.remark}
            </p>
          )}

          {entry.lebaNumtitle && (
            <p>
              <strong>Regulamento:</strong> {entry.lebaNumtitle}
            </p>
          )}

          {entry.lebaUrl && (
            <p>
              <strong>Link:</strong>{" "}
              <a className="underline" href={entry.lebaUrl} target="_blank" rel="noreferrer">
                Abrir
              </a>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
