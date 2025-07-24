import * as XLSX from "xlsx";

export const processExcelMEXC = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

  return json
    .map((row) => {
      if (row.length < 13) return false; // Linha inválida ou vazia

      const [
        ,
        ,
        // Comerciante
        // UID do usuário
        uidOponente, // UID do oponente (apelido)
        dataHora, // Horário de início (UTC-03:00)
        // Horário de término
        ,
        cryptocurrency, // Token de negociação
        tipo, // Direção de negociação (Comprar/Vender)
        status, // Status (Concluído, etc.)
        coinAmount, // Quantidade da ordem
        price, // Preço
        // Taxa
        // Token de liquidação
        ,
        ,
        fiatAmount, // Montante da ordem
      ] = row;

      const normalize = (value: string) =>
        value
          ?.toString()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();

      const formatToTwoDecimalPlaces = (value: string): string => {
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
      };

      const adjustDateTime = (dateTime: string): string => {
        const date = new Date(dateTime);
        date.setTime(date.getTime() - 3 * 60 * 60 * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      if (normalize(status) !== "concluido") return false;
      if (!fiatAmount || fiatAmount === "") return false;

      return {
        numeroOrdem: adjustDateTime(dataHora),
        tipo: normalize(tipo) === "vender" ? "compras" : "vendas",
        dataHora: adjustDateTime(dataHora),
        exchange: selectedBroker,
        ativo: cryptocurrency,
        apelido: uidOponente,
        quantidade: coinAmount,
        valor: formatToTwoDecimalPlaces(fiatAmount),
        valorToken: price,
        taxa: "0",
      };
    })
    .filter(Boolean);
};
