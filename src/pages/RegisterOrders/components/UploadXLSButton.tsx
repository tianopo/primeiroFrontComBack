import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { Select } from "src/components/Form/Select/Select";
import { excelDateToJSDate } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import * as XLSX from "xlsx";

interface IUploadXLSButton {
  setFormData?: Dispatch<SetStateAction<any[]>>;
  formData: any[];
  setVendas: Dispatch<SetStateAction<any[]>>;
  setCompras: Dispatch<SetStateAction<any[]>>;
}

export const UploadXLSButton = ({
  setFormData,
  formData,
  setVendas,
  setCompras,
}: IUploadXLSButton) => {
  const [selectedBroker, setSelectedBroker] = useState<string>("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const allData: any[] = [];

      for (const file of fileArray) {
        const fileData = await readFile(file);
        allData.push(...fileData);
      }

      const combinedData = [...formData, ...allData];
      if (setFormData) setFormData(combinedData);

      const newCompras = allData.filter((item) => item.tipoTransacao === "compras");
      const newVendas = allData.filter((item) => item.tipoTransacao === "vendas");

      setCompras((prev) => [...prev, ...newCompras]);
      setVendas((prev) => [...prev, ...newVendas]);
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, {
            type: selectedBroker === "Gate.IO https://www.gate.io/ AE" ? "string" : "array",
          });
          const result = processExcel(workbook);
          setSelectedBroker("");
          resolve(result);
        } else {
          reject("No data found");
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      selectedBroker === "Gate.IO https://www.gate.io/ AE"
        ? reader.readAsText(file)
        : reader.readAsArrayBuffer(file);
    });
  };

  const processExcel = (workbook: XLSX.WorkBook): any[] => {
    switch (selectedBroker) {
      case "Bybit https://www.bybit.com/ SG":
        return processExcelBybit(workbook);
      case "Binance https://www.binance.com/ CN":
        return processExcelBinance(workbook);
      case "Gate.IO https://www.gate.io/ AE":
        return processExcelGateIO(workbook);
      case "Kucoin https://www.kucoin.com/ SC":
        return processExcelKucoin(workbook);
      case "CoinEx https://www.coinex.com/ HK":
        return processExcelCoinEx(workbook);
      case "Bitget https://www.bitget.com/ SC":
        return processExcelBitget(workbook);
      case "Huobi https://www.htx.com/ CN":
        return processExcelHuobi(workbook);
      case "BingX https://www.bingx.com/ AU":
        return processExcelBingX(workbook);
      default: {
        toast.error("Escolha uma Exchange Válida");
        return [];
      }
    }
  };

  const processExcelBinance = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    const [, ...rows] = json;

    return rows.map((row) => {
      const [
        orderNumber, // "Order Number"
        orderType, // "Order Type"
        assetType, // "Asset Type"
        fiatType, // "Fiat Type"
        totalPrice, // "Total Price"
        price, // "Price"
        quantity, // "Quantity"
        exchangeRate, // "Exchange rate"
        makerFee, // "Maker Fee"
        makerFeeRate, // "Maker Fee Rate"
        takerFee, // "Taker Fee"
        takerFeeRate, // "Taker Fee Rate"
        counterparty, // "Counterparty"
        status, // "Status"
        createdTime, // "Created Time"
      ] = row;
      const formatTotalPrice = (price: string): string => {
        if (Number.isInteger(price)) {
          return `${price},00`;
        } else {
          return parseFloat(price).toFixed(2).replace(".", ",").toString();
        }
      };

      return {
        numeroOrdem: orderNumber.toString(),
        tipoTransacao: orderType === "Buy" ? "compras" : "vendas",
        dataHoraTransacao: excelDateToJSDate(Number(createdTime)),
        exchangeUtilizada: selectedBroker,
        ativoDigital: assetType,
        documentoComprador: orderType === "Sell" ? "" : "",
        apelidoVendedor: orderType === "Buy" ? counterparty : "",
        apelidoComprador: orderType === "Sell" ? counterparty : "",
        quantidadeComprada: orderType === "Buy" ? quantity.toString() : "",
        quantidadeVendida: orderType === "Sell" ? quantity.toString() : "",
        valorCompra: orderType === "Buy" ? formatTotalPrice(totalPrice) : "",
        valorVenda: orderType === "Sell" ? formatTotalPrice(totalPrice) : "",
        valorTokenDataCompra: orderType === "Buy" ? price.toString() : "",
        valorTokenDataVenda: orderType === "Sell" ? price.toString() : "",
        taxaTransacao: orderType === "Buy" ? takerFee.toString() : makerFee.toString(),
      };
    });
  };

  const processExcelGateIO = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    const [, ...rows] = json;

    const formatNumber = (value: string): string => {
      return parseFloat(value).toFixed(2).replace(".", ",").split("/")[0];
    };

    return rows.map((row) => {
      const [
        no, // Ex: "No"
        time, // Ex: "Time"
        type, // Ex: "Type"
        fundType, // Ex: "Fund Type"
        paymentMethod, // Ex: "Payment Method"
        price, // Ex: "Price"
        amount, // Ex: "Amount"
        total, // Ex: "Total"
        status, // Ex: "Status"
        name, // Ex: "Name"
      ] = row;
      const ativoDigital = fundType.split("/")[0];

      return {
        numeroOrdem: no.toString(),
        tipoTransacao: type === "Compra" ? "compras" : "vendas",
        dataHoraTransacao: excelDateToJSDate(Number(time)),
        exchangeUtilizada: selectedBroker,
        ativoDigital,
        documentoComprador: type === "Venda" ? "" : "",
        apelidoVendedor: type === "Compra" ? name : "",
        apelidoComprador: type === "Venda" ? name : "",
        quantidadeComprada: type === "Compra" ? amount : "",
        quantidadeVendida: type === "Venda" ? amount : "",
        valorCompra: type === "Compra" ? formatNumber(total.toString()) : "",
        valorVenda: type === "Venda" ? formatNumber(total.toString()) : "",
        valorTokenDataCompra: type === "Compra" ? price : "",
        valorTokenDataVenda: type === "Venda" ? price : "",
        taxaTransacao: "0",
      };
    });
  };

  const processExcelKucoin = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    const [, ...rows] = json;

    const formatNumber = (value: string): string => {
      return parseFloat(value).toFixed(2).replace(".", ",");
    };

    return rows.map((row) => {
      const [
        time, // "TIME"
        side, // "SIDE"
        status, // "STATUS"
        legalCurrency, // "LEGAL/CURRENCY"
        legalAmount, // "LEGAL_AMOUNT"
        price, // "PRICE"
        currencyAmount, // "CURRENCY_AMOUNT"
        rate, // "RATE"
        traderName, // "OP_TRADER_NAME"
        orderId, // "ORDER_ID"
      ] = row;

      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "BUY" ? "compras" : "vendas",
        dataHoraTransacao: excelDateToJSDate(Number(time)),
        exchangeUtilizada: selectedBroker,
        ativoDigital: legalCurrency.split("/")[1],
        documentoComprador: side === "SELL" ? "" : "",
        apelidoVendedor: side === "BUY" ? traderName : "",
        apelidoComprador: side === "SELL" ? traderName : "",
        quantidadeComprada: side === "BUY" ? currencyAmount : "",
        quantidadeVendida: side === "SELL" ? currencyAmount : "",
        valorCompra: side === "BUY" ? formatNumber(legalAmount.toString()) : "",
        valorVenda: side === "SELL" ? formatNumber(legalAmount.toString()) : "",
        valorTokenDataCompra: side === "BUY" ? price : "",
        valorTokenDataVenda: side === "SELL" ? price : "",
        taxaTransacao: rate,
      };
    });
  };

  const processExcelBybit = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    const [, ...rows] = json;

    return rows.map((row) => {
      const [
        numeroOrdem,
        p2pConvert,
        tipoTransacao,
        fiatAmount,
        currencyFiat,
        price,
        currencyPrice,
        coinAmount,
        cryptocurrency,
        transactionFees,
        cryptocurrencyFees,
        counterparty,
        status,
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

  const processExcelCoinEx = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    const [, ...rows] = json; // Ignora a primeira linha de cabeçalhos

    const formatNumber = (value: string): string => {
      return parseFloat(value.split(" ")[0]).toFixed(2).replace(".", ",");
    };

    return rows.map((row) => {
      const [
        orderId, // "ORDER ID"
        createdAt, // "CREATED AT"
        side, // "SIDE"
        legalCurrency, // "CURRENCY"
        legalAmount, // "AMOUNT"
        price, // "PRICE"
        total, // "TOTAL"
        traderName, // "TRADER NAME"
        paymentMethod, // "PAYMENT METHOD"
        status, // "STATUS"
      ] = row;

      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "BUY" ? "compras" : "vendas",
        dataHoraTransacao: createdAt,
        exchangeUtilizada: selectedBroker,
        ativoDigital: legalCurrency,
        documentoComprador: side === "SELL" ? "" : "",
        apelidoComprador: side === "SELL" ? traderName : "",
        apelidoVendedor: side === "BUY" ? traderName : "",
        quantidadeComprada: side === "BUY" ? total : "",
        quantidadeVendida: side === "SELL" ? total : "",
        valorCompra: side === "BUY" ? formatNumber(price) : "",
        valorVenda: side === "SELL" ? formatNumber(price) : "",
        valorTokenDataCompra: side === "BUY" ? legalAmount : "",
        valorTokenDataVenda: side === "SELL" ? legalAmount : "",
        taxaTransacao: "0",
      };
    });
  };

  const processExcelBitget = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]; // Lê o Excel como uma matriz de strings
    const [, ...rows] = json; // Ignora a primeira linha de cabeçalhos

    const formatNumber = (value: string): string => {
      return parseFloat(value).toFixed(2).replace(".", ","); // Formata o número corretamente
    };

    return rows.map((row) => {
      const [
        empty,
        orderId, // "Order number"
        createdAt, // "Time created"
        side, // "Order type"
        crypto, // "Crypto"
        fiat, // "Fiat"
        totalPrice, // "Total price"
        price, // "Price"
        youReceive, // "You receive"
        counterparty, // "Counterparty"
        status, // "Status"
      ] = row;
      const oneSide = side.replace(/,$/, "").replace(" ", "");
      const oneCounterparty = counterparty.replace(/,$/, "");
      const oneDate = createdAt.replace(/\//g, "-").replace(/,$/, "");
      console.log(rows);
      return {
        numeroOrdem: orderId,
        tipoTransacao: oneSide === "Buy" ? "compras" : "vendas",
        dataHoraTransacao: oneDate,
        exchangeUtilizada: selectedBroker,
        ativoDigital: crypto,
        documentoComprador: oneSide === "Sell" ? "" : "", // CPF do comprador (deixe vazio por enquanto)
        apelidoComprador: oneSide === "Sell" ? oneCounterparty : "", // Nome do comprador
        apelidoVendedor: oneSide === "Buy" ? oneCounterparty : "", // Nome do vendedor
        quantidadeComprada: oneSide === "Buy" ? youReceive : "", // Quantidade comprada
        quantidadeVendida: oneSide === "Sell" ? youReceive : "", // Quantidade vendida
        valorCompra: oneSide === "Buy" ? formatNumber(totalPrice) : "", // Valor da compra
        valorVenda: oneSide === "Sell" ? formatNumber(totalPrice) : "", // Valor da venda
        valorTokenDataCompra: oneSide === "Buy" ? formatNumber(price) : "", // Preço no momento da compra
        valorTokenDataVenda: oneSide === "Sell" ? formatNumber(price) : "", // Preço no momento da venda
        taxaTransacao: "0", // A Bitget parece não ter taxa especificada neste formato
      };
    });
  };

  const processExcelHuobi = (workbook: XLSX.WorkBook): any[] => {
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
        orderType, // "Order Type"
        crypto, // "Coin"
        amount, // "Amount"
        price, // "Price"
        total, // "Total"
        fee, // "Fee"
        pointCard, // "Point Card"
        legalCurrency, // "Currency"
        time, // "Time"
        status, // "Status"
        counterparty, // "Counterparty"
      ] = row;

      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "Buy" ? "compras" : "vendas",
        dataHoraTransacao: time,
        exchangeUtilizada: "Huobi",
        ativoDigital: crypto,
        apelidoComprador: side === "Sell" ? counterparty : "",
        apelidoVendedor: side === "Buy" ? counterparty : "",
        quantidadeComprada: side === "Buy" ? amount : "",
        quantidadeVendida: side === "Sell" ? amount : "",
        valorCompra: side === "Buy" ? formatNumber(total) : "",
        valorVenda: side === "Sell" ? formatNumber(total) : "",
        valorTokenDataCompra: side === "Buy" ? formatNumber(price) : "",
        valorTokenDataVenda: side === "Sell" ? formatNumber(price) : "",
        taxaTransacao: formatNumber(fee),
      };
    });
  };
  // manutenção
  const processExcelBingX = (workbook: XLSX.WorkBook): any[] => {
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
        orderType, // "Order Type"
        crypto, // "Coin"
        amount, // "Amount"
        price, // "Price"
        total, // "Total"
        fee, // "Fee"
        pointCard, // "Point Card"
        legalCurrency, // "Currency"
        time, // "Time"
        status, // "Status"
        counterparty, // "Counterparty"
      ] = row;

      return {
        numeroOrdem: orderId,
        tipoTransacao: side === "Buy" ? "compras" : "vendas",
        dataHoraTransacao: time,
        exchangeUtilizada: "Huobi",
        ativoDigital: crypto,
        apelidoComprador: side === "Sell" ? counterparty : "",
        apelidoVendedor: side === "Buy" ? counterparty : "",
        quantidadeComprada: side === "Buy" ? amount : "",
        quantidadeVendida: side === "Sell" ? amount : "",
        valorCompra: side === "Buy" ? formatNumber(total) : "",
        valorVenda: side === "Sell" ? formatNumber(total) : "",
        valorTokenDataCompra: side === "Buy" ? formatNumber(price) : "",
        valorTokenDataVenda: side === "Sell" ? formatNumber(price) : "",
        taxaTransacao: formatNumber(fee),
      };
    });
  };

  return (
    <div className="gap-2py-4 my-4 flex w-full flex-col items-end md:flex-row">
      <div className={`flex w-full flex-col gap-2 ${!selectedBroker ? "md:w-full" : "md:w-1/2"}`}>
        <Select
          title="Exchange Utilizada"
          placeholder="Bybit https://www.bybit.com/ SG"
          options={exchangeOptions}
          value={selectedBroker}
          onChange={(e) => setSelectedBroker(e.target.value)}
        />
      </div>
      <div className={`flex w-full ${!selectedBroker ? "w-0" : "md:w-1/2"}`}>
        <label
          htmlFor="file-upload"
          className={`w-full ${selectedBroker ? "block" : "hidden"} cursor-pointer rounded bg-blue-500 px-4 py-2 text-center font-bold text-white hover:bg-blue-700`}
        >
          Escolher Arquivo(s) Excel
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xls, .xlsx, .csv"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
