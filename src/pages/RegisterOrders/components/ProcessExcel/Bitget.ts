import { toast } from "react-toastify";
import * as XLSX from "xlsx";

// costuma cometer erros em quantidade vendida e valor de venda, checar e corrigir isso
export const processExcelBitget = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const [titles, ...rows] = json;
  const expectedTitles = [
    ,
    "Número da ordem,",
    "Horário de criação,",
    "Tipo da ordem,",
    "Criptomoeda,",
    "Moeda fiduciária,",
    "Preço total,",
    "Preço,",
    "Valor,",
    "Contraparte,",
    "Status",
  ];
  const formatNumber = (value: string): string => {
    return parseFloat(value).toFixed(2).replace(".", ",");
  };

  const isValid = expectedTitles.every((title, index) => titles[index] === title);
  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }
  return rows
    .map((row) => {
      const [
        ,
        orderId, // "Order number"
        createdAt, // "Time created"
        side, // "Order type"
        crypto, // "Crypto"
        ,
        // "Fiat"
        totalPrice, // "Total price"
        price, // "Price"
        value, // "Value"
        counterparty, // "Counterparty"
        status, // "Status"
      ] = row;
      const v = (a: string | number): string =>
        typeof a === "string" ? a.replace(/,$/, "") : a.toString();
      const oneSide = v(side);
      const oneCounterparty = v(counterparty);
      const oneDate = v(createdAt).replace(/\//g, "-");

      const formatToTwoDecimalPlaces = (value: string): string => {
        const numericValue = parseFloat(value);
        const roundedValue = numericValue.toFixed(2);

        return roundedValue.replace(".", ",");
      };

      if (status?.trim().toLowerCase() !== "concluída,") return false;
      return {
        numeroOrdem: v(orderId),
        tipoTransacao: oneSide === "Vender" ? "vendas" : "compras",
        dataHoraTransacao: oneDate,
        exchangeUtilizada: selectedBroker,
        ativoDigital: v(crypto),
        documentoComprador: "",
        nomeComprador: oneSide === "Vender" ? oneCounterparty : "",
        nomeVendedor: oneSide === "Vender" ? "" : oneCounterparty,
        quantidadeComprada: oneSide === "Vender" ? "" : v(value), // Quantidade comprada
        quantidadeVendida: oneSide === "Vender" ? v(value) : "", // Quantidade vendida
        valorCompra: oneSide === "Vender" ? "" : formatToTwoDecimalPlaces(totalPrice), // Valor da compra
        valorVenda: oneSide === "Vender" ? formatToTwoDecimalPlaces(totalPrice) : "", // Valor da venda
        valorTokenDataCompra: oneSide === "Vender" ? "" : v(price), // Preço no momento da compra
        valorTokenDataVenda: oneSide === "Vender" ? v(price) : "", // Preço no momento da venda
        taxaTransacao: "0", // A Bitget parece não ter taxa especificada neste formato
      };
    })
    .filter(Boolean);
};
