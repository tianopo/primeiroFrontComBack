import * as XLSX from "xlsx";

export const processExcelHuobi = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [, ...rows] = json;

  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",");
  };

  return rows.map((row) => {
    const [
      orderId, // "No."
      side, // "Type"
      // "Order Type"
      ,
      crypto, // "Coin"
      amount, // "Amount"
      price, // "Price"
      total, // "Total"
      fee, // "Fee"
      // "Point Card"
      // "Currency"
      ,
      ,
      time, // "Time"
      // "Status"
      ,
      counterparty, // "Counterparty"
    ] = row;

    return {
      numeroOrdem: orderId,
      tipoTransacao: side === "Buy" ? "compras" : "vendas",
      dataHoraTransacao: time,
      exchangeUtilizada: selectedBroker,
      documentoComprador: side === "SELL" ? "" : "",
      ativoDigital: crypto,
      apelidoComprador: side === "Sell" ? counterparty : "",
      apelidoVendedor: side === "Buy" ? counterparty : "",
      quantidadeComprada: side === "Buy" ? amount.toString() : "",
      quantidadeVendida: side === "Sell" ? amount.toString() : "",
      valorCompra: side === "Buy" ? formatNumber(total) : "",
      valorVenda: side === "Sell" ? formatNumber(total) : "",
      valorTokenDataCompra: side === "Buy" ? formatNumber(price) : "",
      valorTokenDataVenda: side === "Sell" ? formatNumber(price) : "",
      taxaTransacao: formatNumber(fee),
    };
  });
};
