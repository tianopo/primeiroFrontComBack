import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export const processExcelCoinEx = (workbook: XLSX.WorkBook, selectedBroker: string): any[] => {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const json = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as Array<Array<string | number>>;

  const normalize = (value: unknown) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const titles = json[0] ?? [];
  const rows = json.slice(1);

  const expectedTitles = [
    "Order ID",
    "Time Created",
    "Order Direction",
    "Coins",
    "Price",
    "Total Value",
    "Amount",
    "Fee",
    "Real Name",
    "Payment Method",
    "Status",
    "Order Type",
  ];

  const isValid = expectedTitles.every(
    (title, index) => normalize(titles[index]) === normalize(title),
  );

  if (!isValid) {
    toast.error(`Esta planilha não pertence a ${selectedBroker.split(" ")[0]}`);
    return [];
  }

  const parseNumber = (value: unknown): number => {
    const raw = String(value ?? "")
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".");

    const parsed = Number(raw);

    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatNumber = (value: unknown): string => {
    return parseNumber(value).toFixed(2).replace(".", ",");
  };

  const isCompleted = (status: unknown) => {
    const value = normalize(status);

    return (
      value === "finished" || value === "completed" || value === "concluido" || value === "已完成"
    );
  };

  const mapSide = (side: unknown) => {
    const value = normalize(side);

    if (value === "buy") return "compras";
    if (value === "sell") return "vendas";

    return "vendas";
  };

  const calculateFeeInBrl = (feeCrypto: unknown, price: unknown): string => {
    const fee = parseNumber(feeCrypto);
    const tokenPrice = parseNumber(price);

    return (fee * tokenPrice).toFixed(2).replace(".", ",");
  };

  return rows
    .map((row) => {
      const [
        orderId,
        createdAt,
        side,
        coin,
        price,
        totalValue,
        amount,
        fee,
        realName,
        paymentMethod,
        status,
      ] = row;

      if (!orderId) return false;
      if (!isCompleted(status)) return false;

      return {
        numeroOrdem: String(orderId).trim(),
        tipo: mapSide(side),
        dataHora: String(createdAt ?? "").trim(),
        exchange: selectedBroker,
        ativo: String(coin ?? "").trim(),
        nome: String(realName ?? "").trim(),
        quantidade: formatNumber(amount),
        valor: formatNumber(totalValue),
        valorToken: formatNumber(price),
        taxa: calculateFeeInBrl(fee, price),
        pagamento: String(paymentMethod ?? "").trim(),
      };
    })
    .filter(Boolean);
};
