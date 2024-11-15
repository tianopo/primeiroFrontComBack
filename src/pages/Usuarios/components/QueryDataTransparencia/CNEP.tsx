interface IResponseData {
  responseData: any;
}

export const CNEP = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Cadastro Nacional de Empresas Punidas - CNEP</h4>
      <li>
        <strong>Data de Referência:</strong> {responseData?.dataReferencia}
      </li>
      <li>
        <strong>Data de Início da Sanção:</strong> {responseData?.dataInicioSancao}
      </li>
      <li>
        <strong>Data de Fim da Sanção:</strong> {responseData?.dataFimSancao}
      </li>
      <li>
        <strong>Data de Publicação da Sanção:</strong> {responseData?.dataPublicacaoSancao}
      </li>
      <li>
        <strong>Data de Julgamento Transitado:</strong> {responseData?.dataTransitadoJulgado}
      </li>
      <li>
        <strong>Tipo de Sanção:</strong> {responseData?.tipoSancao.descricaoResumida}
      </li>
      <li>
        <strong>Fonte da Sanção:</strong> {responseData?.fonteSancao.nomeExibicao}
      </li>
      <li>
        <strong>Contato:</strong> {responseData?.fonteSancao.telefoneContato}
      </li>
      <li>
        <strong>Endereço de Contato:</strong> {responseData?.fonteSancao.enderecoContato}
      </li>
      <li>
        <strong>Fundamentação:</strong>{" "}
        {responseData?.fundamentacao.map((f: any, index: string) => (
          <div key={index}>{f.descricao}</div>
        ))}
      </li>
      <li>
        <strong>Órgão Sancionador:</strong> {responseData?.orgaoSancionador.nome} (
        {responseData?.orgaoSancionador.siglaUf})
      </li>
      <li>
        <strong>Valor da Multa:</strong> R$ {responseData?.valorMulta}
      </li>
      <li>
        <strong>Nome da Pessoa:</strong> {responseData?.pessoa.nome}
      </li>
      <li>
        <strong>CPF:</strong> {responseData?.pessoa.cpfFormatado}
      </li>
      <li>
        <strong>Publicação:</strong> {responseData?.textoPublicacao}
      </li>
      <li>
        <strong>Número do Processo:</strong> {responseData?.numeroProcesso}
      </li>
      <li>
        <strong>Decisão Judicial:</strong> {responseData?.abrangenciaDefinidaDecisaoJudicial}
      </li>
    </ul>
  );
};
