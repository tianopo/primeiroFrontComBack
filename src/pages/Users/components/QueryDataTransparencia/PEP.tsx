interface IResponseData {
  responseData: any;
}

export const PEP = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;
  return (
    <ul className="px-3">
      <h4 className="font-bold">Pessoa Politicamente Exposta - PEP</h4>
      <li>
        <strong>Nome:</strong> {responseData?.nome}
      </li>
      <li>
        <strong>CPF:</strong> {responseData?.cpf}
      </li>
      <li>
        <strong>Sigla da Função:</strong> {responseData?.sigla_funcao.trim()}
      </li>
      <li>
        <strong>Descrição da Função:</strong> {responseData?.descricao_funcao.trim()}
      </li>
      <li>
        <strong>Nível da Função:</strong> {responseData?.nivel_funcao}
      </li>
      <li>
        <strong>Código do Órgão:</strong> {responseData?.cod_orgao}
      </li>
      <li>
        <strong>Nome do Órgão:</strong> {responseData?.nome_orgao.trim()}
      </li>
      <li>
        <strong>Data de Início do Exercício:</strong> {responseData?.dt_inicio_exercicio}
      </li>
      <li>
        <strong>Data de Fim do Exercício:</strong>{" "}
        {responseData?.dt_fim_exercicio || "Em exercício"}
      </li>
      <li>
        <strong>Data de Fim da Carência:</strong> {responseData?.dt_fim_carencia || "Não aplicável"}
      </li>
    </ul>
  );
};
