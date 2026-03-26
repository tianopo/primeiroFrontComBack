interface PalestinaCouncilEntry {
  englishName: string;
  arabicName: string;
  party: string;
  constituency: string;
  electionType: string;
  status: string;
  similarity: string;
}

export const PalestinaCouncil = ({ responseData }: { responseData: PalestinaCouncilEntry[] }) => {
  if (!responseData || !Array.isArray(responseData) || responseData.length === 0) return null;

  const colorClass = (sim: string) => {
    const n = Number(sim);
    if (n < 50) return "text-green-500";
    if (n < 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <ul className="px-3">
      <h4 className="font-bold">Conselho Palestina (match nomes)</h4>

      {responseData.map((entry, index) => (
        <li key={index} className="mb-4 border-b pb-2">
          <p>
            <strong>Nome (EN):</strong> {entry.englishName}
          </p>
          <p>
            <strong>Nome (AR):</strong> {entry.arabicName}
          </p>

          <p className={colorClass(entry.similarity)}>
            <strong>Similaridade:</strong> {entry.similarity}%
          </p>

          <p>
            <strong>Partido:</strong> {entry.party}
          </p>
          <p>
            <strong>Região:</strong> {entry.constituency}
          </p>
          <p>
            <strong>Tipo:</strong> {entry.electionType}
          </p>
          {entry.status && (
            <p>
              <strong>Status:</strong> {entry.status}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
