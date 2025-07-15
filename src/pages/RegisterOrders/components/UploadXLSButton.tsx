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
import { processExcelMEXC } from "./ProcessExcel/MEXC";

interface IUploadXLSButton {
  setFormData: Dispatch<SetStateAction<any[]>>;
  formData: any[];
}

export const UploadXLSButton = ({ setFormData, formData }: IUploadXLSButton) => {
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
      setFormData(combinedData);
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) {
          reject("Nenhum dado encontrado no arquivo.");
          return;
        }

        let workbook: XLSX.WorkBook;

        try {
          if (fileExtension === "csv") {
            workbook = XLSX.read(data as string, { type: "string" });
          } else {
            workbook = XLSX.read(data as ArrayBuffer, { type: "array" });
          }
        } catch (err) {
          toast.error("Erro ao ler arquivo. Verifique o formato.");
          reject(err);
          return;
        }

        const result = processExcel(workbook);
        setSelectedBroker("");
        resolve(result);
      };

      reader.onerror = (error) => {
        toast.error("Erro ao ler o arquivo.");
        reject(error);
      };

      if (fileExtension === "csv") {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
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
      case "MEXC https://www.mexc.com/ SC":
        return processExcelMEXC(workbook, selectedBroker);
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
          title="Exchange"
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
