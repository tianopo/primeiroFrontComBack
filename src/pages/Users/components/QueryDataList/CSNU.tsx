interface CSNUEntry {
  ref: string;
  section: string;
  fullName: string;
  similarity: string;
}

export const CSNU = ({ responseData }: { responseData: CSNUEntry[] }) => {
  if (!responseData || !Array.isArray(responseData) || responseData.length === 0) return null;

  const colorClass = (sim: string) => {
    const n = Number(sim);
    if (n < 50) return "text-green-500";
    if (n < 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <ul className="px-3">
      <h4 className="font-bold">Lista CSNU (ONU)</h4>

      {responseData.map((entry, index) => (
        <li key={index} className="mb-4 border-b pb-2">
          <p>
            <strong>Nome:</strong> {entry.fullName}
          </p>

          <p className={colorClass(entry.similarity)}>
            <strong>Similaridade:</strong> {entry.similarity}%
          </p>

          <p>
            <strong>Referência:</strong> {entry.ref}
          </p>

          <p>
            <strong>Seção:</strong> {entry.section}
          </p>
        </li>
      ))}
    </ul>
  );
};
