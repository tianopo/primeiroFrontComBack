import * as XLSX from "xlsx";

export const processExcelMEXC = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

  return json
    .slice(1)
    .map((row) => {
      if (row.length < 12) return false;

      const [
        uid, // uidComerciante
        ,
        idOrdem, // idAnuncio
        ,
        tipoAnuncio,
        dataHora,
        nomeMoeda, // moeda
        ,
        estado,
        quantidade,
        preco,
        montante, // formaPagamento
        ,
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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      if (normalize(estado) !== "pronto") return false;
      if (!montante || montante === "") return false;

      return {
        numeroOrdem: idOrdem,
        tipo: normalize(tipoAnuncio) === "vender" ? "compras" : "vendas",
        dataHora: adjustDateTime(dataHora),
        exchange: selectedBroker,
        ativo: nomeMoeda,
        apelido: uid,
        quantidade,
        valor: formatToTwoDecimalPlaces(montante),
        valorToken: preco,
        taxa: "0",
      };
    })
    .filter(Boolean);
};
