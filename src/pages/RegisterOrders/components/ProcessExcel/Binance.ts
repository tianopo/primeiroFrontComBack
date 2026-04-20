import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelBinance = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as Array<Array<string | number>>;

  const normalize = (value: string | number) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const formatToTwoDecimalPlaces = (value: string | number): string => {
    const numericValue = parseFloat(String(value).replace(",", "."));
    return Number.isNaN(numericValue) ? "" : numericValue.toFixed(2).replace(".", ",");
  };

  // "26-03-01 12:23:29" -> "2026-03-01 12:23:29"
  const adjustDateTimeBinance = (dateTime: string | number): string => {
    const raw = String(dateTime ?? "").trim();
    if (!raw) return "";

    const m = raw.match(/^(\d{2,4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (!m) return raw;

    let year = m[1];
    const month = m[2];
    const day = m[3];
    const hh = m[4];
    const mm = m[5];
    const ss = m[6];

    // se vier "26" -> 2026
    if (year.length === 2) year = `20${year}`;

    return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
  };

  // acha a linha do header no CSV PT
  const headerRowIndex = rows.findIndex(
    (r) =>
      normalize(r?.[0] ?? "") === "numero do pedido" && normalize(r?.[1] ?? "") === "tipo de ordem",
  );

  if (headerRowIndex === -1) {
    toast.error(`Estrutura do CSV da ${selectedBroker.split(" ")[0]} não reconhecida.`);
    return [];
  }

  const header = rows[headerRowIndex].map((h) => normalize(h));

  const idx = (name: string) => header.findIndex((h) => h === normalize(name));

  const iOrderId = idx("Número do Pedido");
  const iSide = idx("Tipo de Ordem");
  const iAsset = idx("Ativo");
  const iTotalPrice = idx("Preço Total");
  const iPrice = idx("Preço");
  const iQuantity = idx("Quantidade");
  const iCounterparty = idx("Contraparte");
  const iStatus = idx("Status");
  const iCreateTime = idx("Hora de Criação");

  return rows
    .slice(headerRowIndex + 1)
    .map((row) => {
      const orderId = row[iOrderId];
      if (!orderId) return false;

      const status = row[iStatus];
      if (normalize(status) !== "completed") return false; // ✅ só concluídas

      const side = row[iSide];
      const asset = row[iAsset];
      const totalPrice = row[iTotalPrice];
      const price = row[iPrice];
      const quantity = row[iQuantity];
      const counterparty = row[iCounterparty];
      const createTime = row[iCreateTime];

      return {
        numeroOrdem: String(orderId).trim(),
        tipo: normalize(side) === "buy" ? "compras" : "vendas",
        dataHora: adjustDateTimeBinance(createTime),
        exchange: selectedBroker,
        ativo: String(asset ?? "").trim(),
        apelido: String(counterparty ?? "").trim(),
        quantidade: String(quantity ?? "").trim(),
        valor: formatToTwoDecimalPlaces(totalPrice),
        valorToken: formatToTwoDecimalPlaces(price),
        taxa: "0",
      };
    })
    .filter(Boolean);
};
