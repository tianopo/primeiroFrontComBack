interface IResponseData {
  responseData: any;
}

export const Viagens = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Dados de Viagem</h4>
      <li>
        <strong>Motivo:</strong> {responseData.viagem?.motivo}
      </li>
      <li>
        <strong>PCDP:</strong> {responseData.viagem?.pcdp}
      </li>
      <li>
        <strong>Ano:</strong> {responseData.viagem?.ano}
      </li>
      <li>
        <strong>Número PCDP:</strong> {responseData.viagem?.numPcdp}
      </li>
      <li>
        <strong>Justificativa Urgente:</strong> {responseData.viagem?.justificativaUrgente}
      </li>
      <li>
        <strong>Urgência da Viagem:</strong> {responseData.viagem?.urgenciaViagem}
      </li>
      <li>
        <strong>Situação:</strong> {responseData.situacao}
      </li>
      <li>
        <strong>Nome do Beneficiário:</strong> {responseData.beneficiario?.nome}
      </li>
      <li>
        <strong>CPF do Beneficiário:</strong> {responseData.beneficiario?.cpfFormatado}
      </li>
      <li>
        <strong>NIS do Beneficiário:</strong> {responseData.beneficiario?.nis}
      </li>
      <li>
        <strong>Cargo:</strong> {responseData.cargo?.descricao} (Código:{" "}
        {responseData.cargo?.codigoSIAPE})
      </li>
      <li>
        <strong>Função:</strong> {responseData.funcao?.descricao} (Código:{" "}
        {responseData.funcao?.codigoSIAPE})
      </li>
      <li>
        <strong>Tipo de Viagem:</strong> {responseData.tipoViagem}
      </li>
      <li>
        <strong>Órgão:</strong> {responseData.orgao?.nome} ({responseData.orgao?.sigla})
      </li>
      <li>
        <strong>CNPJ do Órgão:</strong> {responseData.orgao?.cnpj}
      </li>
      <li>
        <strong>Código SIAFI do Órgão:</strong> {responseData.orgao?.codigoSIAFI}
      </li>
      <li>
        <strong>Órgão Máximo:</strong> {responseData.orgao?.orgaoMaximo?.nome} (
        {responseData.orgao?.orgaoMaximo?.sigla})
      </li>
      <li>
        <strong>Data de Início do Afastamento:</strong> {responseData.dataInicioAfastamento}
      </li>
      <li>
        <strong>Data de Fim do Afastamento:</strong> {responseData.dataFimAfastamento}
      </li>
      <li>
        <strong>Valor Total da Viagem:</strong> R$ {responseData.valorTotalViagem?.toFixed(2)}
      </li>
      <li>
        <strong>Valor Total de Passagens:</strong> R$ {responseData.valorTotalPassagem?.toFixed(2)}
      </li>
      <li>
        <strong>Valor Total de Diárias:</strong> R$ {responseData.valorTotalDiarias?.toFixed(2)}
      </li>
      <li>
        <strong>Valor Total da Multa:</strong> R$ {responseData.valorMulta?.toFixed(2)}
      </li>
      <li>
        <strong>Valor Total da Restituição:</strong> R${" "}
        {responseData.valorTotalRestituicao?.toFixed(2)}
      </li>
      <li>
        <strong>Valor Total da Devolução:</strong> R$ {responseData.valorTotalDevolucao?.toFixed(2)}
      </li>
    </ul>
  );
};
