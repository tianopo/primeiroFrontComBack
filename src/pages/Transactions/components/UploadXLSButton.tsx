import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { Select } from "src/components/Form/Select/Select";
import { excelDateToJSDate } from "src/utils/formats";
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
          const workbook = XLSX.read(data, { type: "array" });
          const result = processExcel(workbook);
          resolve(result);
        } else {
          reject("No data found");
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
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
      const formatTotalPrice = (price: string) => {
        if (Number.isInteger(price)) {
          return `${price},00`;
        } else {
          return parseFloat(price).toFixed(2).replace(".", ",");
        }
      };

      return {
        numeroOrdem: orderNumber,
        tipoTransacao: orderType === "Buy" ? "compras" : "vendas",
        dataHoraTransacao: excelDateToJSDate(Number(createdTime)),
        exchangeUtilizada: selectedBroker,
        ativoDigital: assetType,
        cpfComprador: orderType === "Sell" ? "" : "",
        apelidoVendedor: orderType === "Buy" ? counterparty : "",
        apelidoComprador: orderType === "Sell" ? counterparty : "",
        quantidadeComprada: orderType === "Buy" ? quantity : "",
        quantidadeVendida: orderType === "Sell" ? quantity : "",
        valorCompra: orderType === "Buy" ? formatTotalPrice(totalPrice) : "",
        valorVenda: orderType === "Sell" ? formatTotalPrice(totalPrice) : "",
        valorTokenDataCompra: orderType === "Buy" ? price : "",
        valorTokenDataVenda: orderType === "Sell" ? price : "",
        taxaTransacao: orderType === "Buy" ? takerFee : makerFee,
      };
    });
  };

  const processExcelGateIO = (workbook: XLSX.WorkBook): any[] => {
    // Lógica de processamento específica para Gate.IO
    return [];
  };

  const processExcelKucoin = (workbook: XLSX.WorkBook): any[] => {
    // Lógica de processamento específica para Kucoin
    return [];
  };

  const processExcelBybit = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    console.log(json);
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
        cpfComprador: tipoTransacao === "SELL" ? "" : "",
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

  return (
    <div className="flex w-full flex-col items-end gap-2 md:flex-row">
      <div className="flex w-full md:w-1/2">
        <Select
          title="Exchange Utilizada"
          placeholder="Bybit https://www.bybit.com/ SG"
          options={[
            "Bybit https://www.bybit.com/ SG",
            "Binance https://www.binance.com/ CN",
            "Gate.IO https://www.gate.io/ AE",
            "Kucoin https://www.kucoin.com/ SC",
          ]}
          value={selectedBroker}
          onChange={(e) => setSelectedBroker(e.target.value)}
        />
      </div>
      <div className="flex w-full md:w-1/2">
        <label
          htmlFor="file-upload"
          className="w-full cursor-pointer rounded bg-blue-500 px-4 py-2 text-center font-bold text-white hover:bg-blue-700"
        >
          Escolher Arquivo(s) .xls
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
