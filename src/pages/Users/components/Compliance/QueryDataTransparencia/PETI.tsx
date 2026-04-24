interface IResponseData {
  responseData: any;
}

export const PETI = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Programa de Erradicação do Trabalho Infantil - PETI</h4>
      <li>
        <strong>CPF:</strong> {responseData.beneficiarioPeti?.cpfFormatado}
      </li>
      <li>
        <strong>NIS:</strong> {responseData.beneficiarioPeti?.nis}
      </li>
      <li>
        <strong>Município:</strong> {responseData.municipio?.nomeIBGE} - {responseData.uf?.sigla} (
        {responseData.municipio?.codigoIBGE})
      </li>
      <li>
        <strong>Região:</strong> {responseData.municipio?.nomeRegiao} (
        {responseData.municipio?.codigoRegiao})
      </li>
      <li>
        <strong>País:</strong> {responseData.municipio?.pais}
      </li>
      <li>
        <strong>Situação:</strong> {responseData.situacao}
      </li>
      <li>
        <strong>Valor:</strong> {responseData.valor?.toFixed(2)}
      </li>
    </ul>
  );
};
