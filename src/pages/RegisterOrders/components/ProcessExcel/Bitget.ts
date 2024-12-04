import * as XLSX from "xlsx";

export const processExcelBitget = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]; // Lê o Excel como uma matriz de strings
  const [, ...rows] = json; // Ignora a primeira linha de cabeçalhos

  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ","); // Formata o número corretamente
  };

  return rows.map((row) => {
    const [
      ,
      orderId, // "Order number"
      createdAt, // "Time created"
      side, // "Order type"
      crypto, // "Crypto"
      // "Fiat"
      ,
      totalPrice, // "Total price"
      price, // "Price"
      youReceive, // "You receive"
      counterparty, // "Counterparty"
      // "Status"
      ,
    ] = row;
    const oneSide = side.replace(/,$/, "");
    const oneCounterparty = counterparty.replace(/,$/, "");
    const oneDate = createdAt.replace(/\//g, "-").replace(/,$/, "");

    return {
      numeroOrdem: orderId,
      tipoTransacao: oneSide === "Comprar" ? "compras" : "vendas",
      dataHoraTransacao: oneDate,
      exchangeUtilizada: selectedBroker,
      ativoDigital: crypto,
      documentoComprador: "", // CPF do comprador (deixe vazio por enquanto)
      apelidoComprador: oneSide === "Vender" ? "" : oneCounterparty,
      apelidoVendedor: oneSide === "Vender" ? oneCounterparty : "",
      quantidadeComprada: oneSide === "Comprar" ? youReceive : "", // Quantidade comprada
      quantidadeVendida: oneSide === "Vender" ? youReceive : "", // Quantidade vendida
      valorCompra: oneSide === "Comprar" ? formatNumber(totalPrice) : "", // Valor da compra
      valorVenda: oneSide === "Vender" ? formatNumber(totalPrice) : "", // Valor da venda
      valorTokenDataCompra: oneSide === "Comprar" ? formatNumber(price) : "", // Preço no momento da compra
      valorTokenDataVenda: oneSide === "Vender" ? formatNumber(price) : "", // Preço no momento da venda
      taxaTransacao: "0", // A Bitget parece não ter taxa especificada neste formato
    };
  });
};
