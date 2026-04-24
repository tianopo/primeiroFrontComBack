interface IResponseData {
  responseData: any;
}

export const Safra = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Garantia Safra - Safra</h4>
      <li>
        <strong>CPF:</strong> {responseData.beneficiarioSafra?.cpfFormatado}
      </li>
      <li>
        <strong>NIS:</strong> {responseData.beneficiarioSafra?.nis}
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
