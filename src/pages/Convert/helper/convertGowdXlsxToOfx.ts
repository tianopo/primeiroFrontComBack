import * as XLSX from "xlsx";

type GowdXlsxTransaction = {
  date: string;
  amount: number;
  balance: number;
  description: string;
  name: string;
  document: string;
  bankName: string;
  bankIspb: string;
  branchNumber: string;
  accountNumber: string;
  externalCode: string;
  identifier: string;
  e2eId: string;
};

const sanitizeOfxText = (value: unknown) => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>&]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const parseDateToOfx = (value: unknown) => {
  const raw = String(value ?? "").trim();

  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/);

  if (match) {
    const [, dd, mm, yyyy, hh = "00", min = "00", ss = "00"] = match;
    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  }

  const date = new Date(raw);

  if (!Number.isNaN(date.getTime())) {
    return date
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
  }

  return "";
};

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;

  const raw = String(value ?? "0")
    .replace(/[R$\s]/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : 0;
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "application/x-ofx;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const findResumeValue = (rows: unknown[][], key: string) => {
  const found = rows.find((row) => {
    return (
      String(row?.[0] ?? "")
        .trim()
        .toLowerCase() === key.toLowerCase()
    );
  });

  return String(found?.[1] ?? "").trim();
};

const buildOfx = (params: {
  transactions: GowdXlsxTransaction[];
  bankId: string;
  accountId: string;
  currency: string;
  balance: number;
}) => {
  const { transactions, bankId, accountId, currency, balance } = params;

  const dates = transactions.map((tx) => tx.date).filter(Boolean);
  const dtStart = dates.reduce((a, b) => (a < b ? a : b));
  const dtEnd = dates.reduce((a, b) => (a > b ? a : b));

  const now = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);

  const transactionContent = transactions
    .map((tx, index) => {
      const fitId =
        tx.identifier ||
        tx.e2eId ||
        tx.externalCode ||
        `${tx.date}-${index}-${tx.amount.toFixed(2)}`;

      const name = [tx.description, tx.name, tx.document, tx.bankName]
        .filter(Boolean)
        .map(sanitizeOfxText)
        .join(" - ");

      return `
          <STMTTRN>
            <TRNTYPE>${tx.amount < 0 ? "DEBIT" : "CREDIT"}</TRNTYPE>
            <DTPOSTED>${tx.date}</DTPOSTED>
            <TRNAMT>${tx.amount.toFixed(2)}</TRNAMT>
            <FITID>${sanitizeOfxText(fitId)}</FITID>
            <NAME>${sanitizeOfxText(name)}</NAME>
            <MEMO>${sanitizeOfxText(name)}</MEMO>
          </STMTTRN>`;
    })
    .join("");

  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:NONE
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <DTSERVER>${now}</DTSERVER>
      <LANGUAGE>POR</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>${currency || "BRL"}</CURDEF>
        <BANKACCTFROM>
          <BANKID>${sanitizeOfxText(bankId || "33630661")}</BANKID>
          <ACCTID>${sanitizeOfxText(accountId || "GOWD")}</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${dtStart}</DTSTART>
          <DTEND>${dtEnd}</DTEND>
${transactionContent}
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>${balance.toFixed(2)}</BALAMT>
          <DTASOF>${dtEnd}</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
};

export const convertGowdXlsxToOfx = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const resumeSheet = workbook.Sheets["Resume"];
  const statementSheet = workbook.Sheets["Bank Statement"];

  if (!statementSheet) {
    throw new Error('A planilha precisa ter a aba "Bank Statement".');
  }

  const resumeRows = resumeSheet
    ? (XLSX.utils.sheet_to_json(resumeSheet, { header: 1 }) as unknown[][])
    : [];

  const bankStatementRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(statementSheet, {
    defval: "",
  });

  const bankId = findResumeValue(resumeRows, "ISPB");
  const accountId = findResumeValue(resumeRows, "Account");

  const balanceRaw =
    resumeRows.find((row) => String(row?.[0] ?? "").includes("Balance of the day"))?.[1] ?? 0;

  const transactions: GowdXlsxTransaction[] = bankStatementRows
    .map((row) => {
      const date = parseDateToOfx(row["Created At"]);

      if (!date) return null;

      return {
        date,
        amount: toNumber(row["Amount"]),
        balance: toNumber(row["Balance"]),
        description: String(row["Description"] ?? ""),
        name: String(row["Name"] ?? ""),
        document: String(row["Document"] ?? ""),
        bankName: String(row["Bank Name"] ?? ""),
        bankIspb: String(row["Bank ISPB"] ?? ""),
        branchNumber: String(row["Branch Number"] ?? ""),
        accountNumber: String(row["Account Number"] ?? ""),
        externalCode: String(row["External Code"] ?? ""),
        identifier: String(row["Identifier"] ?? ""),
        e2eId: String(row["E2E ID"] ?? ""),
      };
    })
    .filter(Boolean) as GowdXlsxTransaction[];

  if (!transactions.length) {
    throw new Error("Nenhuma transação válida encontrada no arquivo XLSX.");
  }

  const currency = String(bankStatementRows[0]?.["Currency"] ?? "BRL");

  const ofx = buildOfx({
    transactions,
    bankId,
    accountId,
    currency,
    balance: toNumber(balanceRaw),
  });

  const originalName = file.name.replace(/\.[^.]+$/, "");

  downloadTextFile(ofx, `${originalName || "gowd-extrato"}.ofx`);
};
