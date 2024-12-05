import "../registerOrders.css";

interface IHandleListEdit {
  formData: any[];
  handleEdit: (numeroOrdem: string, vendedor: string) => void;
}

export const HandleListEdit = ({ formData, handleEdit }: IHandleListEdit) => {
  const compras = formData.filter((item) => item.tipoTransacao === "compras");
  const vendas = formData.filter((item) => item.tipoTransacao === "vendas");
  const calculateTotals = (filteredData: any[]) => {
    const valor = (valorVenda: any) =>
      valorVenda?.replace(".", "").replace(",", ".").replace("R$", "") || "0";
    const totalVendas = filteredData
      .filter((transaction) => transaction.tipoTransacao === "vendas")
      .reduce((acc, transaction) => {
        return acc + parseFloat(valor(transaction.valorVenda));
      }, 0);

    const totalCompras = filteredData
      .filter((transaction) => transaction.tipoTransacao === "compras")
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
                onClick={() => handleEdit(item.numeroOrdem, item.vendedor)}
              >
                <p>
                  <strong>Número Ordem:</strong> {item.numeroOrdem}
                </p>
                <p>
                  <strong>Data e Hora Transação:</strong> {item.dataHoraTransacao}
                </p>
                <p>
                  <strong>Exchange Utilizada:</strong> {item.exchangeUtilizada}
                </p>
                <p>
                  <strong>Ativo Digital:</strong> {item.ativoDigital}
                </p>
                <p>
                  <strong>Nome Vendedor:</strong> {item.nomeVendedor}
                </p>
                <p>
                  <strong>Apelido Vendedor:</strong> {item.apelidoVendedor}
                </p>
                <p>
                  <strong>Quantidade Comprada:</strong> {item.quantidadeComprada}
                </p>
                <p>
                  <strong>Valor Compra:</strong> {item.valorCompra}
                </p>
                <p>
                  <strong>Valor Token Data Compra:</strong> {item.valorTokenDataCompra}
                </p>
                <p>
                  <strong>Taxa Transação:</strong> {item.taxaTransacao}
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
                onClick={() => handleEdit(item.numeroOrdem, item.vendedor)}
              >
                <p>
                  <strong>Número Ordem:</strong> {item.numeroOrdem}
                </p>
                <p>
                  <strong>Data e Hora Transação:</strong> {item.dataHoraTransacao}
                </p>
                <p>
                  <strong>Exchange Utilizada:</strong> {item.exchangeUtilizada}
                </p>
                <p>
                  <strong>Ativo Digital:</strong> {item.ativoDigital}
                </p>
                <p>
                  <strong>Nome Comprador:</strong> {item.nomeComprador}
                </p>
                <p>
                  <strong>Apelido Comprador:</strong> {item.apelidoComprador}
                </p>
                <p>
                  <strong>CPF Comprador:</strong> {item.documentoComprador}
                </p>
                <p>
                  <strong>Quantidade Vendida:</strong> {item.quantidadeVendida}
                </p>
                <p>
                  <strong>Valor Venda:</strong> {item.valorVenda}
                </p>
                <p>
                  <strong>Valor Token Data Venda:</strong> {item.valorTokenDataVenda}
                </p>
                <p>
                  <strong>Taxa Transação:</strong> {item.taxaTransacao}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
