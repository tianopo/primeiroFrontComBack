interface IResponseData {
  responseData: any;
}

export const CNPJ = ({ responseData }: IResponseData) => {
  return (
    <ul className="px-3">
      <h4 className="font-bold">CNPJ {responseData?.cnpj}</h4>
      <li>
        <strong>Nome:</strong> {responseData?.nome}
      </li>
      <li>
        <strong>Nome Fantasia:</strong> {responseData?.fantasia}
      </li>
      <li>
        <strong>Data de Abertura:</strong> {responseData?.abertura}
      </li>
      <li>
        <strong>Situação:</strong> {responseData?.situacao}
      </li>
      <li>
        <strong>Tipo:</strong> {responseData?.tipo}
      </li>
      <li>
        <strong>Porte:</strong> {responseData?.porte}
      </li>
      <li>
        <strong>Natureza Jurídica:</strong> {responseData?.natureza_juridica}
      </li>
      <li>
        <strong>Atividade Principal:</strong>{" "}
        {responseData?.atividade_principal
          .map((item: any) => `${item.code} - ${item.text}`)
          .join(", ")}
      </li>
      <li>
        <strong>Atividades Secundárias:</strong>{" "}
        {responseData?.atividades_secundarias
          .map((item: any) => `${item.code} - ${item.text}`)
          .join(" ")}
      </li>
      <li>
        <strong>Participantes:</strong>{" "}
        {responseData?.qsa.map((item: any) => `${item.nome} - ${item.qual}`).join(" / ")}
      </li>
      <li>
        <strong>Endereço:</strong>{" "}
        {`${responseData?.logradouro}, ${responseData?.numero} - ${responseData?.bairro}, ${responseData?.municipio} - ${responseData?.uf}, CEP: ${responseData?.cep}`}
      </li>
      <li>
        <strong>Email:</strong> {responseData?.email}
      </li>
      <li>
        <strong>Telefone:</strong> {responseData?.telefone}
      </li>
      <li>
        <strong>Capital Social:</strong> {responseData?.capital_social}
      </li>
      <li>
        <strong>Status:</strong> {responseData?.status}
      </li>
    </ul>
  );
};
