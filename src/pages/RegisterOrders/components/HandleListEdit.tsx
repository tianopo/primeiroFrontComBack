import "../registerOrders.css";

interface IHandleListEdit {
  formData: any[];
  handleEdit: (numeroOrdem: string) => void;
}

export const HandleListEdit = ({ formData, handleEdit }: IHandleListEdit) => {
  const compras = formData.filter((item) => item.tipo === "compras");
  const vendas = formData.filter((item) => item.tipo === "vendas");

  const calculateTotals = (filteredData: any[]) => {
    const valor = (valorVenda: any) =>
      valorVenda?.replace(".", "").replace(",", ".").replace("R$", "") || "0";
    const totalVendas = filteredData
      .filter((transaction) => transaction.tipo === "vendas")
      .reduce((acc, transaction) => {
        return acc + parseFloat(valor(transaction.valorVenda));
      }, 0);

    const totalCompras = filteredData
      .filter((transaction) => transaction.tipo === "compras")
      .reduce((acc, transaction) => {
        const valorCompra = parseFloat(valor(transaction.valorCompra));

        return acc + valorCompra;
      }, 0);
    return { totalVendas, totalCompras };
  };

  const { totalVendas, totalCompras } = calculateTotals(formData);

  return (
    <div className="card mt-4">
      <h2 className="text-20 font-bold">Dados Armazenados:</h2>
      <h6>Total Vendas: {totalVendas}</h6>
      <h6>Total Compras: {totalCompras}</h6>
      <h6>Quantidade de Compras: {compras.length}</h6>
      <h6>Quantidade de Vendas: {vendas.length}</h6>
      <h6>Quantidade Total: {formData.length}</h6>

      {/* Compras */}
      {compras.length > 0 && (
        <div className="mt-4">
          <h3 className="text-18 font-semibold">Compras</h3>
          <ul className="flex flex-row flex-wrap gap-2">
            {compras.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer rounded-lg border bg-gray-100 p-4"
                onClick={() => handleEdit(item.numeroOrdem)}
              >
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
                <p>
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
            ))}
          </ul>
        </div>
      )}

      {/* Vendas */}
      {vendas.length > 0 && (
        <div className="mt-4">
          <h3 className="text-18 font-semibold">Vendas</h3>
          <ul className="flex flex-row flex-wrap gap-2">
            {vendas.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer rounded-lg border bg-gray-100 p-4"
                onClick={() => handleEdit(item.numeroOrdem)}
              >
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
                <p>
                  <strong>Apelido:</strong> {item.apelido}
                </p>
                <p>
                  <strong>Quantidade:</strong> {item.quantidade}
                </p>
                <p>
                  <strong>Valor Venda:</strong> {item.valor}
                </p>
                <p>
                  <strong>Valor do Token:</strong> {item.valorToken}
                </p>
                <p>
                  <strong>Taxa:</strong> {item.taxa}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
