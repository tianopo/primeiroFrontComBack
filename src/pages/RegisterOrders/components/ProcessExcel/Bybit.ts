import * as XLSX from "xlsx";

export const processExcelBybit = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [, ...rows] = json;

  return rows.map((row) => {
    const [
      numeroOrdem,
      ,
      tipoTransacao,
      fiatAmount,
      ,
      price,
      ,
      coinAmount,
      cryptocurrency,
      transactionFees,
      ,
      counterparty,
      ,
      dataHoraTransacao,
    ] = row;
    const formatToTwoDecimalPlaces = (value: string): string => {
      const numericValue = parseFloat(value);
      const roundedValue = numericValue.toFixed(2);

      return roundedValue.replace(".", ",");
    };

    return {
      numeroOrdem,
      tipoTransacao: tipoTransacao === "BUY" ? "compras" : "vendas",
      dataHoraTransacao,
      exchangeUtilizada: selectedBroker,
      ativoDigital: cryptocurrency,
      documentoComprador: tipoTransacao === "SELL" ? "" : "",
      apelidoVendedor: tipoTransacao === "BUY" ? counterparty : "",
      apelidoComprador: tipoTransacao === "SELL" ? counterparty : "",
      quantidadeComprada: tipoTransacao === "BUY" ? coinAmount : "",
      quantidadeVendida: tipoTransacao === "SELL" ? coinAmount : "",
      valorCompra: tipoTransacao === "BUY" ? formatToTwoDecimalPlaces(fiatAmount) : "",
      valorVenda: tipoTransacao === "SELL" ? formatToTwoDecimalPlaces(fiatAmount) : "",
      valorTokenDataCompra: tipoTransacao === "BUY" ? price : "",
      valorTokenDataVenda: tipoTransacao === "SELL" ? price : "",
      taxaTransacao: transactionFees,
    };
  });
};
