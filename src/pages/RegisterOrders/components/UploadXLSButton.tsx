import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { Select } from "src/components/Form/Select/Select";
import { exchangeOptions } from "src/utils/selectsOptions";
import * as XLSX from "xlsx";
import { processExcelBinance } from "./ProcessExcel/Binance";
import { processExcelBingX } from "./ProcessExcel/BingX";
import { processExcelBitget } from "./ProcessExcel/Bitget";
import { processExcelBybit } from "./ProcessExcel/Bybit";
import { processExcelCoinEx } from "./ProcessExcel/CoinEx";
import { processExcelGateIO } from "./ProcessExcel/Gate.IO";
import { processExcelHuobi } from "./ProcessExcel/Huobi";
import { processExcelKucoin } from "./ProcessExcel/Kucoin";

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
        toast.error("Error reading file:" + error);
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
        return processExcelBybit(workbook, selectedBroker);
      case "Binance https://www.binance.com/ CN":
        return processExcelBinance(workbook, selectedBroker);
      case "Gate.IO https://www.gate.io/ AE":
        return processExcelGateIO(workbook, selectedBroker);
      case "Kucoin https://www.kucoin.com/ SC":
        return processExcelKucoin(workbook, selectedBroker);
      case "CoinEx https://www.coinex.com/ HK":
        return processExcelCoinEx(workbook, selectedBroker);
      case "Bitget https://www.bitget.com/ SC":
        return processExcelBitget(workbook, selectedBroker);
      case "Huobi https://www.htx.com/ CN":
        return processExcelHuobi(workbook, selectedBroker);
      case "BingX https://www.bingx.com/ AU":
        return processExcelBingX(workbook, selectedBroker);
      default: {
        toast.error("Escolha uma Exchange Válida");
        return [];
      }
    }
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
