interface IResponseData {
  responseData: any;
}

export const CEAF = ({ responseData }: IResponseData) => {
  if (!responseData || typeof responseData === "string") return null;

  return (
    <ul className="px-3">
      <h4 className="font-bold">Componente Especializado da Assistência Farmacêutica - CEAF</h4>
      <li>
        <strong>Nome:</strong> {responseData.pessoa?.nome || responseData.punicao?.nomePunido}
      </li>
      <li>
        <strong>CPF:</strong>{" "}
        {responseData.pessoa?.cpfFormatado || responseData.punicao?.cpfPunidoFormatado}
      </li>
      <li>
        <strong>Tipo:</strong> {responseData.pessoa?.tipo || "Não informado"}
      </li>
      <li>
        <strong>Data de Publicação:</strong> {responseData.dataPublicacao || "Não informado"}
      </li>
      <li>
        <strong>Data de Referência:</strong> {responseData.dataReferencia || "Não informado"}
      </li>
      <li>
        <strong>Tipo de Punição:</strong> {responseData.tipoPunicao?.descricao}
      </li>
      <li>
        <strong>Portaria:</strong> {responseData.punicao?.portaria || "Não informado"}
      </li>
      <li>
        <strong>Processo:</strong> {responseData.punicao?.processo || "Não informado"}
      </li>
      <li>
        <strong>Seção do DOU:</strong> {responseData.punicao?.secaoDOU || "Não informado"}
      </li>
      <li>
        <strong>Página do DOU:</strong> {responseData.punicao?.paginaDOU || "Não informado"}
      </li>
      <li>
        <strong>Cargo Efetivo:</strong> {responseData.cargoEfetivo || "Não informado"}
      </li>
      <li>
        <strong>Cargo em Comissão:</strong> {responseData.cargoComissao || "Não informado"}
      </li>
      <li>
        <strong>Fundamentação:</strong>{" "}
        {responseData.fundamentacao?.map((fund: any, idx: number) => (
          <div key={idx}>{fund.descricao}</div>
        )) || "Não informado"}
      </li>
      <li>
        <strong>Órgão de Lotação:</strong> {responseData.orgaoLotacao?.nome || "Não informado"}
      </li>
      <li>
        <strong>UF de Lotação:</strong> {responseData.ufLotacaoPessoa?.uf?.nome || "Não informado"}{" "}
        ({responseData.ufLotacaoPessoa?.uf?.sigla || "Não informado"})
      </li>
    </ul>
  );
};
