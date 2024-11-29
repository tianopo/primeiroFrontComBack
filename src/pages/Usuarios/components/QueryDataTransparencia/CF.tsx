interface IContratosProps {
  responseData: any;
}

export const CF = ({ responseData }: IContratosProps) => {
  if (!responseData || responseData.length === 0) return null;

  return (
    <ul className="px-3">
      <h4 className="font-bold">Contratos do Poder Federal - CF</h4>
      <li>
        <strong>Número:</strong> {responseData?.numero}
      </li>
      <li>
        <strong>Objeto:</strong> {responseData?.objeto}
      </li>
      <li>
        <strong>Processo:</strong> {responseData?.numeroProcesso || "Não informado"}
      </li>
      <li>
        <strong>Fornecedor:</strong> {responseData?.fornecedor?.nome} -{" "}
        {responseData?.fornecedor?.cnpjFormatado}
      </li>
      <li>
        <strong>Valor Inicial:</strong> R$ {responseData?.valorInicialCompra?.toFixed(2)}
      </li>
      <li>
        <strong>Valor Final:</strong> R$ {responseData?.valorFinalCompra?.toFixed(2)}
      </li>
      <li>
        <strong>Data de Assinatura:</strong> {responseData?.dataAssinatura}
      </li>
      <li>
        <strong>Vigência:</strong> {responseData?.dataInicioVigencia} até{" "}
        {responseData?.dataFimVigencia}
      </li>
      <li>
        <strong>Unidade Gestora:</strong> {responseData?.unidadeGestora?.nome} (
        {responseData?.unidadeGestora?.descricaoPoder})
      </li>
    </ul>
  );
};
