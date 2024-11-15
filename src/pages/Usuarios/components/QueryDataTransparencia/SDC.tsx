interface IResponseData {
  responseData: any;
}

export const SDC = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Seguro Defeso Código - SDC</h4>
      <li>
        <strong>Nome:</strong> {responseData?.pessoaSeguroDefeso.nome.trim()}
      </li>
      <li>
        <strong>CPF:</strong> {responseData?.pessoaSeguroDefeso.cpfFormatado}
      </li>
      <li>
        <strong>NIS:</strong> {responseData?.pessoaSeguroDefeso.nis}
      </li>
      <li>
        <strong>Município:</strong> {responseData?.municipio.nomeIBGE} - {responseData?.uf.sigla} (
        {responseData?.municipio.codigoIBGE})
      </li>
      <li>
        <strong>Região:</strong> {responseData?.municipio.nomeRegiao} (
        {responseData?.municipio.codigoRegiao})
      </li>
      <li>
        <strong>País:</strong> {responseData?.municipio.pais}
      </li>
      <li>
        <strong>Portaria:</strong> {responseData?.portaria}
      </li>
      <li>
        <strong>Data de Referência:</strong> {responseData?.dataMesReferencia}
      </li>
      <li>
        <strong>Data de Saque:</strong> {responseData?.dataSaque}
      </li>
      <li>
        <strong>Data de Emissão da Parcela:</strong> {responseData?.dataEmissaoParcela}
      </li>
      <li>
        <strong>Situação:</strong> {responseData?.situacao}
      </li>
      <li>
        <strong>RGP:</strong> {responseData?.rgp}
      </li>
      <li>
        <strong>Parcela:</strong> {responseData?.parcela}
      </li>
      <li>
        <strong>Valor:</strong> R$ {responseData?.valor.toFixed(2)}
      </li>
    </ul>
  );
};
