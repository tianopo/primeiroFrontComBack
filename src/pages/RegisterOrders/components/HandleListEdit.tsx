interface IHandleListEdit {
  formData: any[];
  handleEdit: (numeroOrdem: string) => void;
  notFoundNicknames?: Set<string>; // <<<<<< novo
}

export const HandleListEdit = ({ formData, handleEdit, notFoundNicknames }: IHandleListEdit) => {
  const compras = formData.filter((item) => item.tipo === "compras");
  const vendas = formData.filter((item) => item.tipo === "vendas");

  const calculateTotals = (filteredData: any[]) => {
    const valor = (valorVenda: any) =>
      valorVenda?.replace(".", "").replace(",", ".").replace("R$", "") || "0";
    const totalVendas = filteredData
      .filter((transaction) => transaction.tipo === "vendas")
      .reduce((acc, transaction) => acc + parseFloat(valor(transaction.valorVenda)), 0);

    const totalCompras = filteredData
      .filter((transaction) => transaction.tipo === "compras")
      .reduce((acc, transaction) => acc + parseFloat(valor(transaction.valorCompra)), 0);

    return { totalVendas, totalCompras };
  };

  const { totalVendas, totalCompras } = calculateTotals(formData);

  const renderList = (title: string, items: any[]) =>
    items.length > 0 && (
      <div className="mt-4">
        <h3 className="text-18 font-semibold">{title}</h3>
        <ul className="flex flex-row flex-wrap gap-2">
          {items.map((item, index) => {
            const isNotFound = notFoundNicknames?.has(item.apelido || "");
            return (
              <li
                key={index}
                className={[
                  "relative cursor-pointer rounded-lg border px-3 py-5",
                  isNotFound ? "border-red-500 bg-red-50" : "bg-gray-100",
                ].join(" ")}
                onClick={() => handleEdit(item.numeroOrdem)}
                title={isNotFound ? "Apelido não encontrado no banco" : ""}
              >
                {isNotFound && (
                  <span className="absolute left-2 top-1 rounded-full bg-red-600 px-2 py-0.5 font-semibold uppercase tracking-wide text-white">
                    Usuário não encontrado
                  </span>
                )}
                <p>
                  <strong>Número Ordem:</strong> {item.numeroOrdem}
                </p>
                <p>
                  <strong>Data e Hora:</strong> {item.dataHora}
                </p>
                <p>
                  <strong>Exchange:</strong> {item.exchange}
                </p>
                <p>
                  <strong>Ativo:</strong> {item.ativo}
                </p>
                <p>
                  <strong>Nome:</strong> {item.nome}
                </p>
                <p className={isNotFound ? "font-bold text-red-700" : ""}>
                  <strong>Apelido:</strong> {item.apelido}
                </p>
                <p>
                  <strong>Quantidade:</strong> {item.quantidade}
                </p>
                <p>
                  <strong>Valor:</strong> {item.valor}
                </p>
                <p>
                  <strong>Valor do Token:</strong> {item.valorToken}
                </p>
                <p>
                  <strong>Taxa:</strong> {item.taxa}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    );

  return (
    <div className="card mt-4">
      <h2 className="text-20 font-bold">Dados Armazenados:</h2>
      <h6>Total Vendas: {totalVendas}</h6>
      <h6>Total Compras: {totalCompras}</h6>
      <h6>Quantidade de Compras: {compras.length}</h6>
      <h6>Quantidade de Vendas: {vendas.length}</h6>
      <h6>Quantidade Total: {formData.length}</h6>

      {renderList("Compras", compras)}
      {renderList("Vendas", vendas)}
    </div>
  );
};
