import "../registerOrders.css";

interface IHandleListEdit {
  formData: any[];
  handleEdit: (index: number) => void;
}

export const HandleListEdit = ({ formData, handleEdit }: IHandleListEdit) => {
  return (
    <div className="card mt-4">
      <h2 className="text-20 font-bold">Dados Armazenados:</h2>
      <ul className="flex flex-row flex-wrap gap-2">
        {formData.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer rounded-lg border bg-gray-100 p-4"
            onClick={() => handleEdit(index)}
          >
            {item.tipoTransacao === "compras" && (
              <>
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
              </>
            )}
            {item.tipoTransacao === "vendas" && (
              <>
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
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
