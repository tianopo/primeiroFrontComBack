interface IResponseData {
  responseData: any;
}

export const CEIS = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;

  return (
    <ul className="px-3">
      <h4 className="font-bold">Cadastro Nacional de Empresas Inidôneas e Suspensas - CEIS</h4>
      <li>
        <strong>Nome:</strong> {responseData?.sancionado?.nome || responseData?.pessoa?.nome}
      </li>
      <li>
        <strong>CNPJ:</strong>{" "}
        {responseData?.sancionado?.codigoFormatado || responseData?.pessoa?.cnpjFormatado}
      </li>
      <li>
        <strong>Razão Social:</strong> {responseData?.pessoa?.razaoSocialReceita}
      </li>
      <li>
        <strong>Nome Fantasia:</strong>{" "}
        {responseData?.pessoa?.nomeFantasiaReceita || "Não informado"}
      </li>
      <li>
        <strong>Tipo:</strong> {responseData?.pessoa?.tipo}
      </li>
      <li>
        <strong>Data de Referência:</strong> {responseData?.dataReferencia}
      </li>
      <li>
        <strong>Data de Início da Sanção:</strong> {responseData?.dataInicioSancao}
      </li>
      <li>
        <strong>Data de Fim da Sanção:</strong> {responseData?.dataFimSancao || "Não informado"}
      </li>
      <li>
        <strong>Data de Publicação da Sanção:</strong> {responseData?.dataPublicacaoSancao}
      </li>
      <li>
        <strong>Data Transitada em Julgado:</strong> {responseData?.dataTransitadoJulgado}
      </li>
      <li>
        <strong>Tipo de Sanção:</strong> {responseData?.tipoSancao?.descricaoResumida}
      </li>
      <li>
        <strong>Órgão Sancionador:</strong> {responseData?.orgaoSancionador?.nome} -{" "}
        {responseData?.orgaoSancionador?.siglaUf}
      </li>
      <li>
        <strong>Poder:</strong> {responseData?.orgaoSancionador?.poder}
      </li>
      <li>
        <strong>Esfera:</strong> {responseData?.orgaoSancionador?.esfera}
      </li>
      <li>
        <strong>Fundamentação:</strong>{" "}
        {responseData?.fundamentacao?.map((fund: any, idx: number) => (
          <div key={idx}>{fund.descricao}</div>
        ))}
      </li>
      <li>
        <strong>Fonte da Sanção:</strong> {responseData?.fonteSancao?.nomeExibicao}
      </li>
      <li>
        <strong>Contato da Fonte:</strong>{" "}
        {responseData?.fonteSancao?.telefoneContato || "Não informado"}
      </li>
      <li>
        <strong>Endereço da Fonte:</strong>{" "}
        {responseData?.fonteSancao?.enderecoContato || "Não informado"}
      </li>
      <li>
        <strong>Texto da Publicação:</strong> {responseData?.textoPublicacao || "Não informado"}
      </li>
      <li>
        <strong>Número do Processo:</strong> {responseData?.numeroProcesso || "Não informado"}
      </li>
      <li>
        <strong>Link da Publicação:</strong>{" "}
        {responseData?.linkPublicacao ? (
          <a href={responseData?.linkPublicacao} target="_blank" rel="noopener noreferrer">
            Acessar
          </a>
        ) : (
          "Não informado"
        )}
      </li>
      <li>
        <strong>Abrangência da Decisão Judicial:</strong>{" "}
        {responseData?.abrangenciaDefinidaDecisaoJudicial || "Não informado"}
      </li>
    </ul>
  );
};
