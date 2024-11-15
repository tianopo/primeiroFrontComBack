interface IResponseData {
  responseData: any;
}

export const AE = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Auxílio Emergencial - AE</h4>
      <li>
        <strong>Nome:</strong> {responseData.beneficiario?.nome.trim()}
      </li>
      <li>
        <strong>CPF:</strong> {responseData.beneficiario?.cpfFormatado}
      </li>
      <li>
        <strong>NIS:</strong> {responseData.beneficiario?.nis}
      </li>
      <li>
        <strong>Nome:</strong> {responseData.responsavelAuxilioEmergencial?.nome.trim()}
      </li>
      <li>
        <strong>CPF do Responsável:</strong>{" "}
        {responseData.responsavelAuxilioEmergencial?.cpfFormatado}
      </li>
      <li>
        <strong>NIS:</strong> {responseData.responsavelAuxilioEmergencial?.nis}
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
      <li>
        <strong>Número da Parcela:</strong> {responseData?.numeroParcela}
      </li>
    </ul>
  );
};
