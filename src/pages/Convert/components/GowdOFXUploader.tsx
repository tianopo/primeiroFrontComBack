import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

type GowdResume = {
  bankId: string;
  institution: string;
  branch: string;
  account: string;
  holderName: string;
  holderDocument: string;
  period: string;
  balance: string;
};

type GowdTxn = {
  dateISO: string; // "YYYY-MM-DD HH:mm:ss"
  dtPostedOfx: string; // "YYYYMMDDHHmmss"
  amount: number; // + entrada / - saída
  memo: string;
  name: string;
  document: string;
  bankName: string;
  branchNumber: string;
  accountNumber: string;
  e2eId: string;
  fitId: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * ✅ Parse robusto pt-BR:
 * - "5.000" => 5000
 * - "5.000,00" => 5000
 * - "500,00" => 500
 * - "-0.85" => -0.85
 * - número => retorna direto
 */
const parseAmountBR = (v: any): number => {
  if (typeof v === "number") return v;

  let s = String(v ?? "").trim();
  if (!s) return NaN;

  // remove símbolos comuns
  s = s.replace(/\s/g, "").replace(/R\$/gi, "");

  // negativos em parênteses
  let negative = false;
  if (s.startsWith("(") && s.endsWith(")")) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }

  // se tem "." e "," -> "." milhares, "," decimal
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    // se só "," -> decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(".")) {
    // só "." -> pode ser milhares OU decimal
    const parts = s.split(".");
    const last = parts[parts.length - 1];
    // heurística: "5.000" / "1.230.000" => milhares
    if (parts.length > 1 && last.length === 3) {
      s = parts.join("");
    }
    // caso contrário, mantém "." como decimal
  }

  const n = Number.parseFloat(s);
  if (!Number.isFinite(n)) return NaN;
  return negative ? -n : n;
};

const parseDateTimeAny = (value: unknown) => {
  if (value == null || value === "") {
    return { iso: "", ofx: "" };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getFullYear();
    const mm = value.getMonth() + 1;
    const dd = value.getDate();
    const HH = value.getHours();
    const MI = value.getMinutes();
    const SS = value.getSeconds();

    return {
      iso: `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(HH)}:${pad2(MI)}:${pad2(SS)}`,
      ofx: `${yyyy}${pad2(mm)}${pad2(dd)}${pad2(HH)}${pad2(MI)}${pad2(SS)}`,
    };
  }

  // Serial de data do Excel
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      const yyyy = parsed.y;
      const mm = parsed.m;
      const dd = parsed.d;
      const HH = parsed.H ?? 0;
      const MI = parsed.M ?? 0;
      const SS = Math.floor(parsed.S ?? 0);

      return {
        iso: `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(HH)}:${pad2(MI)}:${pad2(SS)}`,
        ofx: `${yyyy}${pad2(mm)}${pad2(dd)}${pad2(HH)}${pad2(MI)}${pad2(SS)}`,
      };
    }
  }

  const raw = String(value).trim();

  // 31/07/2026 16:52:45
  // 31/07/2026 16:52
  const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);

  if (br) {
    const dd = Number(br[1]);
    const mm = Number(br[2]);
    const yyyy = Number(br[3]);
    const HH = Number(br[4] ?? 0);
    const MI = Number(br[5] ?? 0);
    const SS = Number(br[6] ?? 0);

    return {
      iso: `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(HH)}:${pad2(MI)}:${pad2(SS)}`,
      ofx: `${yyyy}${pad2(mm)}${pad2(dd)}${pad2(HH)}${pad2(MI)}${pad2(SS)}`,
    };
  }

  // 2026-07-31 16:52:45 / 2026-07-31T16:52:45
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (isoMatch) {
    const yyyy = Number(isoMatch[1]);
    const mm = Number(isoMatch[2]);
    const dd = Number(isoMatch[3]);
    const HH = Number(isoMatch[4]);
    const MI = Number(isoMatch[5]);
    const SS = Number(isoMatch[6] ?? 0);

    return {
      iso: `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(HH)}:${pad2(MI)}:${pad2(SS)}`,
      ofx: `${yyyy}${pad2(mm)}${pad2(dd)}${pad2(HH)}${pad2(MI)}${pad2(SS)}`,
    };
  }

  return {
    iso: "",
    ofx: "",
  };
};

const normalizeHeader = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const escapeOfx = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const sanitizeFitId = (value: string): string =>
  value
    .replace(/[<>&\r\n\t]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 240);

const buildOfx = (resume: GowdResume | null, txns: GowdTxn[]) => {
  const now = new Date();

  const dtServer =
    `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}` +
    `${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;

  const bankId = resume?.bankId || "33630661";
  const acctId = resume?.account || "0000000000";
  const acctType = "CHECKING";

  const sorted = [...txns]
    .filter(
      (transaction) => Boolean(transaction.dtPostedOfx) && Number.isFinite(transaction.amount),
    )
    .sort((a, b) => a.dtPostedOfx.localeCompare(b.dtPostedOfx));

  const dtStart = sorted[0]?.dtPostedOfx || dtServer;
  const dtEnd = sorted[sorted.length - 1]?.dtPostedOfx || dtServer;

  const transactionLines = sorted.map((transaction) => {
    const trnType = transaction.amount < 0 ? "DEBIT" : "CREDIT";

    const name = transaction.memo.trim() || transaction.name.trim() || "GOWD";

    const memoParts = [
      transaction.memo,
      transaction.name,
      transaction.document ? `Document: ${transaction.document}` : "",
      transaction.bankName ? `Bank: ${transaction.bankName}` : "",
      transaction.branchNumber ? `Branch: ${transaction.branchNumber}` : "",
      transaction.accountNumber ? `Account: ${transaction.accountNumber}` : "",
      transaction.e2eId ? `E2E: ${transaction.e2eId}` : "",
    ].filter(Boolean);

    return [
      "<STMTTRN>",
      `<TRNTYPE>${trnType}`,
      `<DTPOSTED>${transaction.dtPostedOfx}`,
      `<TRNAMT>${transaction.amount.toFixed(2)}`,
      `<FITID>${escapeOfx(transaction.fitId)}`,
      `<NAME>${escapeOfx(name.slice(0, 32))}`,
      `<MEMO>${escapeOfx(memoParts.join(" | "))}`,
      "</STMTTRN>",
    ].join("\r\n");
  });

  /*
   * Tenta utilizar o saldo informado pela Gowd.
   * Ex.: "R$ 1.324,30"
   */
  const parsedBalance = parseAmountBR(resume?.balance);

  const finalBalance = Number.isFinite(parsedBalance)
    ? parsedBalance
    : sorted.reduce((acc, transaction) => acc + transaction.amount, 0);

  const lines = [
    "OFXHEADER:100",
    "DATA:OFXSGML",
    "VERSION:102",
    "SECURITY:NONE",
    "ENCODING:UTF-8",
    "CHARSET:1252",
    "COMPRESSION:NONE",
    "OLDFILEUID:NONE",
    "NEWFILEUID:NONE",
    "",
    "<OFX>",
    "<SIGNONMSGSRSV1>",
    "<SONRS>",
    "<STATUS>",
    "<CODE>0",
    "<SEVERITY>INFO",
    "</STATUS>",
    `<DTSERVER>${dtServer}`,
    "<LANGUAGE>POR",
    "</SONRS>",
    "</SIGNONMSGSRSV1>",
    "<BANKMSGSRSV1>",
    "<STMTTRNRS>",
    "<TRNUID>1",
    "<STATUS>",
    "<CODE>0",
    "<SEVERITY>INFO",
    "</STATUS>",
    "<STMTRS>",
    "<CURDEF>BRL",
    "<BANKACCTFROM>",
    `<BANKID>${escapeOfx(bankId)}`,
    `<ACCTID>${escapeOfx(acctId)}`,
    `<ACCTTYPE>${acctType}`,
    "</BANKACCTFROM>",
    "<BANKTRANLIST>",
    `<DTSTART>${dtStart}`,
    `<DTEND>${dtEnd}`,
    ...transactionLines,
    "</BANKTRANLIST>",

    // Alguns importadores exigem saldo contábil.
    "<LEDGERBAL>",
    `<BALAMT>${finalBalance.toFixed(2)}`,
    `<DTASOF>${dtEnd}`,
    "</LEDGERBAL>",

    "</STMTRS>",
    "</STMTTRNRS>",
    "</BANKMSGSRSV1>",
    "</OFX>",
    "",
  ];

  return lines.join("\r\n");
};

export const GowdOFXUploader = () => {
  const [resume, setResume] = useState<GowdResume | null>(null);
  const [transactions, setTransactions] = useState<GowdTxn[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => fileInputRef.current?.click();

  const parseResumeSheet = (ws: XLSX.WorkSheet): GowdResume => {
    const rows = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: "",
    }) as unknown[][];

    const getValue = (...names: string[]): string => {
      const normalizedNames = names.map(normalizeHeader);

      for (const row of rows) {
        const key = normalizeHeader(row?.[0]);

        if (normalizedNames.some((name) => key === name || key.startsWith(name))) {
          return String(row?.[1] ?? "").trim();
        }
      }

      return "";
    };

    return {
      bankId: getValue("ISPB"),
      institution: getValue("Institution", "Instituição"),
      branch: getValue("Branch", "Agência"),
      account: getValue("Account", "Conta"),
      holderName: getValue("Name", "Nome"),
      holderDocument: getValue("Document", "Documento"),
      period: getValue("Period", "Período"),

      // Agora encontra "Balance of the day ..."
      balance: getValue("Balance of the day", "Balance", "Saldo do dia", "Saldo"),
    };
  };

  const parseBankStatementSheet = (ws: XLSX.WorkSheet): GowdTxn[] => {
    const rows = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: "",
    }) as unknown[][];

    if (!rows.length) return [];

    // Procura o cabeçalho nas primeiras 20 linhas.
    // Assim não depende obrigatoriamente de estar na linha 1.
    const headerRowIndex = rows.slice(0, 20).findIndex((row) => {
      const normalized = row.map(normalizeHeader);

      return normalized.includes("created at") && normalized.includes("amount");
    });

    if (headerRowIndex === -1) {
      toast.error("Estrutura do extrato Gowd não reconhecida: não encontrei Created At e Amount.");

      return [];
    }

    const header = rows[headerRowIndex].map(normalizeHeader);

    const idx = (...names: string[]): number => {
      for (const name of names) {
        const index = header.indexOf(normalizeHeader(name));

        if (index !== -1) return index;
      }

      return -1;
    };

    const iCreatedAt = idx("Created At", "Data", "Timestamp");
    const iAmount = idx("Amount", "Valor");
    const iDescription = idx("Description", "Descrição");
    const iName = idx("Name", "Nome");
    const iDocument = idx("Document", "Documento");
    const iBankName = idx("Bank Name", "Banco");
    const iBranch = idx("Branch Number", "Branch", "Agência");
    const iAccount = idx("Account Number", "Account", "Conta");
    const iExternal = idx("External Code");
    const iIdentifier = idx("Identifier");
    const iE2E = idx("E2E ID", "EndToEnd", "End To End");
    const iIdentifierRefund = idx("Identifier Refund");
    const iE2ERefund = idx("E2E ID Refund");

    if (iCreatedAt === -1 || iAmount === -1) {
      toast.error("Estrutura do extrato Gowd não reconhecida: Created At ou Amount ausente.");

      return [];
    }

    return rows
      .slice(headerRowIndex + 1)
      .map((row, index) => {
        const createdAt = row[iCreatedAt];
        const amountRaw = row[iAmount];

        const amountNum = parseAmountBR(amountRaw);
        const { iso, ofx } = parseDateTimeAny(createdAt);

        if (!iso || !ofx || !Number.isFinite(amountNum)) {
          return null;
        }

        const valueAt = (column: number): string =>
          column >= 0 ? String(row[column] ?? "").trim() : "";

        const memo = valueAt(iDescription);
        const name = valueAt(iName);
        const document = valueAt(iDocument);
        const bankName = valueAt(iBankName);
        const branchNumber = valueAt(iBranch);
        const accountNumber = valueAt(iAccount);

        const externalCode = valueAt(iExternal);
        const identifier = valueAt(iIdentifier);
        const e2eOriginal = valueAt(iE2E);

        const identifierRefund = valueAt(iIdentifierRefund);
        const e2eRefund = valueAt(iE2ERefund);

        const e2eId = e2eOriginal || e2eRefund;

        /*
         * IMPORTANTE:
         *
         * Na Gowd, duas linhas diferentes podem ter o MESMO:
         * Identifier
         * External Code
         * E2E ID
         *
         * Exemplo:
         * Payout transfer  -9578,00
         * Fixed fee transfer -0,85
         *
         * Se os dois tiverem o mesmo FITID, programas contábeis
         * entendem uma das operações como duplicada.
         *
         * Por isso incluímos:
         * - identificador
         * - data/hora
         * - valor
         * - descrição
         *
         * tornando o FITID único e determinístico.
         */
        const fitIdBase = [
          identifier || identifierRefund || externalCode || e2eId || "GOWD",
          ofx,
          amountNum.toFixed(2),
          memo || "TX",
        ].join("-");

        const fitId = sanitizeFitId(fitIdBase);

        return {
          dateISO: iso,
          dtPostedOfx: ofx,
          amount: amountNum,
          memo,
          name,
          document,
          bankName,
          branchNumber,
          accountNumber,
          e2eId,
          fitId,
        } satisfies GowdTxn;
      })
      .filter((transaction): transaction is GowdTxn => transaction !== null);
  };

  const handleImportGowd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {
        type: "array",
        cellDates: true,
        raw: true,
      });

      const resumeSheetName = wb.SheetNames.find((name) => {
        const normalized = normalizeHeader(name);

        return (
          normalized === "resume" || normalized.includes("resume") || normalized.includes("resumo")
        );
      });

      const bankSheetName = wb.SheetNames.find((name) => {
        const normalized = normalizeHeader(name);

        return (
          normalized === "bank statement" ||
          normalized.includes("bank statement") ||
          normalized.includes("statement") ||
          normalized.includes("extrato")
        );
      });

      if (!bankSheetName) {
        toast.error("Não encontrei a aba 'Bank Statement' no arquivo da Gowd.");
        return;
      }

      const resumeWs = resumeSheetName ? wb.Sheets[resumeSheetName] : null;
      const bankWs = wb.Sheets[bankSheetName];

      const parsedResume = resumeWs ? parseResumeSheet(resumeWs) : null;
      const parsedTxns = parseBankStatementSheet(bankWs);

      setResume(parsedResume);
      setTransactions(parsedTxns);

      toast.success(`Importado: ${parsedTxns.length} transações (todas).`);
    } catch {
      toast.error("Falha ao importar arquivo da Gowd.");
    }
  };

  const handleExportOfx = () => {
    if (!transactions.length) {
      toast.error("Importe o extrato da Gowd antes de exportar.");
      return;
    }

    const ofx = buildOfx(resume, transactions);
    const blob = new Blob([ofx], { type: "application/x-ofx" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `gowd-export-${new Date().toISOString().slice(0, 10)}.ofx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    const entradasArr = transactions.filter((t) => t.amount > 0);
    const saidasArr = transactions.filter((t) => t.amount < 0);

    const entradas = entradasArr.reduce((acc, t) => acc + t.amount, 0);

    const saidasAbs = saidasArr.reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const tarifasArr = saidasArr.map((t) => Math.abs(t.amount)).filter((v) => v >= 0.8 && v <= 0.9);

    const tarifas = tarifasArr.reduce((acc, v) => acc + v, 0);

    const totalMovimentadoAbs = transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return {
      totalTransacoes: transactions.length,
      entradasCount: entradasArr.length,
      saidasCount: saidasArr.length,
      tarifasCount: tarifasArr.length,

      entradas,
      saidas: saidasAbs,
      tarifasBancarias: tarifas,
      saidasSemTarifas: Math.max(0, saidasAbs - tarifas),
      movimentado: totalMovimentadoAbs,
    };
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={triggerFileInput}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Importar pela Gowd (.xlsx)
        </button>

        <button
          onClick={handleExportOfx}
          className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
        >
          Exportar .OFX
        </button>

        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          onChange={handleImportGowd}
          className="hidden"
        />
      </div>

      {resume && (
        <div className="rounded border border-gray-200 p-3 text-sm">
          <div className="font-semibold">Resumo</div>
          <div>Instituição: {resume.institution || "-"}</div>
          <div>ISPB (BankId): {resume.bankId || "-"}</div>
          <div>Agência: {resume.branch || "-"}</div>
          <div>Conta: {resume.account || "-"}</div>
          <div>Titular: {resume.holderName || "-"}</div>
          <div>Documento: {resume.holderDocument || "-"}</div>
          <div>Período: {resume.period || "-"}</div>
          <div>Saldo: {resume.balance || "-"}</div>
        </div>
      )}

      {transactions.length > 0 && (
        <>
          <div className="grid gap-2 rounded border border-gray-200 p-3 text-sm md:grid-cols-2">
            <div>
              <strong>Total transações:</strong> {totals.totalTransacoes}
            </div>
            <div>
              <strong>Movimentado (abs):</strong> {fmtBRL(totals.movimentado)}
            </div>
            <div>
              <strong>Total Entradas ({totals.entradasCount}):</strong> {fmtBRL(totals.entradas)}
            </div>
            <div>
              <strong>Total Saídas ({totals.saidasCount}):</strong> {fmtBRL(totals.saidas)}
            </div>
            <div>
              <strong>Tarifas bancárias (0,80–0,90) ({totals.tarifasCount}):</strong>{" "}
              {fmtBRL(totals.tarifasBancarias)}
            </div>
            <div>
              <strong>Saídas sem tarifas:</strong> {fmtBRL(totals.saidasSemTarifas)}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left font-semibold">Data</th>
                  <th className="border px-4 py-2 text-left font-semibold">Valor</th>
                  <th className="border px-4 py-2 text-left font-semibold">Descrição</th>
                  <th className="border px-4 py-2 text-left font-semibold">Nome</th>
                  <th className="border px-4 py-2 text-left font-semibold">Banco</th>
                  <th className="border px-4 py-2 text-left font-semibold">E2E</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={`${txn.fitId}-${idx}`} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{txn.dateISO}</td>
                    <td className="border px-4 py-2">{fmtBRL(txn.amount)}</td>
                    <td className="border px-4 py-2">{txn.memo}</td>
                    <td className="border px-4 py-2">{txn.name}</td>
                    <td className="border px-4 py-2">{txn.bankName}</td>
                    <td className="border px-4 py-2">{txn.e2eId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
