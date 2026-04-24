interface IResponseData {
  responseData: any;
}

export const BPC = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Benefício de Prestação Continuada - BPC</h4>
      <li>
        <strong>CPF:</strong> {responseData.beneficiario?.cpfFormatado}
      </li>
      <li>
        <strong>NIS:</strong> {responseData.beneficiario?.nis}
      </li>
      <li>
        <strong>Representante legal:</strong> {responseData.beneficiario?.nomeRepresentanteLegal}
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
        <strong>Valor:</strong> {responseData.valor?.toFixed(2)}
      </li>
    </ul>
  );
};
