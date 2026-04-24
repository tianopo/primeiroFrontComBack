interface IResponseData {
  responseData: any;
}

export const CEPIM = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;

  return (
    <ul className="px-3">
      <h4 className="font-bold">Entidades Privadas sem Fins Lucrativos Impedidas - CEPIM</h4>
      <li>
        <strong>Data de Referência:</strong> {responseData?.dataReferencia}
      </li>
      <li>
        <strong>Motivo:</strong> {responseData?.motivo}
      </li>
      <li>
        <strong>Órgão Superior:</strong> {responseData?.orgaoSuperior?.nome} -{" "}
        {responseData?.orgaoSuperior?.sigla}
      </li>
      <li>
        <strong>CNPJ do Órgão Superior:</strong>{" "}
        {responseData?.orgaoSuperior?.cnpj || "Não informado"}
      </li>
      <li>
        <strong>Poder:</strong> {responseData?.orgaoSuperior?.descricaoPoder}
      </li>
      <li>
        <strong>Órgão Máximo:</strong> {responseData?.orgaoSuperior?.orgaoMaximo?.nome} -{" "}
        {responseData?.orgaoSuperior?.orgaoMaximo?.sigla}
      </li>
      <li>
        <strong>Entidade:</strong> {responseData?.pessoaJuridica?.nome}
      </li>
      <li>
        <strong>CNPJ da Entidade:</strong> {responseData?.pessoaJuridica?.cnpjFormatado}
      </li>
      <li>
        <strong>Razão Social:</strong> {responseData?.pessoaJuridica?.razaoSocialReceita}
      </li>
      <li>
        <strong>Nome Fantasia:</strong> {responseData?.pessoaJuridica?.nomeFantasiaReceita || "N/A"}
      </li>
      <li>
        <strong>Tipo:</strong> {responseData?.pessoaJuridica?.tipo}
      </li>
      <li>
        <strong>Código do Convênio:</strong> {responseData?.convenio?.codigo}
      </li>
      <li>
        <strong>Objeto do Convênio:</strong> {responseData?.convenio?.objeto}
      </li>
      <li>
        <strong>Número do Convênio:</strong> {responseData?.convenio?.numero}
      </li>
    </ul>
  );
};
