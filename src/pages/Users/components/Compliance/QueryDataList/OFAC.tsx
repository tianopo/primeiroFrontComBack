interface IResponseData {
  responseData: {
    fullName: string;
    similarity: string;
    person: string;
    countries: string;
    profession: string;
    information: string;
  }[];
}

export const OFAC = ({ responseData }: IResponseData) => {
  if (!responseData || !Array.isArray(responseData) || responseData.length === 0) return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Lista OFAC</h4>
      {responseData.map((entry, index) => (
        <li key={index} className="mb-4 border-b pb-2">
          <p>
            <strong>Nome Completo:</strong> {entry.fullName}
          </p>
          <p
            className={`${
              Number(entry.similarity) < 50
                ? "text-green-500"
                : Number(entry.similarity) < 70
                  ? "text-yellow-500"
                  : "text-red-500"
            }`}
          >
            <strong>Similaridade:</strong> {entry.similarity}%
          </p>
          <p>
            <strong>Tipo de Pessoa:</strong> {entry.person.replace(/"/g, "")}
          </p>
          <p>
            <strong>País:</strong> {entry.countries.replace(/"/g, "")}
          </p>
          <p>
            <strong>Profissão:</strong>{" "}
            {entry.profession !== "-0-" ? entry.profession : "Não especificado"}
          </p>
          <p>
            <strong>Informações Adicionais:</strong> {entry.information.replace(/"/g, "")}
          </p>
        </li>
      ))}
    </ul>
  );
};
