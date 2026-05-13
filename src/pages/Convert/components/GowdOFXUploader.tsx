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

const parseDateTimeAny = (value: any) => {
  if (value == null || value === "") return { iso: "", ofx: "" };

  // Excel serial number
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const yyyy = parsed.y;
      const mm = parsed.m;
      const dd = parsed.d;
      const HH = parsed.H;
      const MI = parsed.M;
      const SS = Math.floor(parsed.S);

      const iso = `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(HH)}:${pad2(MI)}:${pad2(SS)}`;
      const ofx = `${yyyy}${pad2(mm)}${pad2(dd)}${pad2(HH)}${pad2(MI)}${pad2(SS)}`;
      return { iso, ofx };
    }
  }

  // "30/04/2026 20:36:19"
  const raw = String(value).trim();
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const HH = Number(m[4]);
    const MI = Number(m[5]);
    const SS = Number(m[6]);

    const iso = `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(HH)}:${pad2(MI)}:${pad2(SS)}`;
    const ofx = `${yyyy}${pad2(mm)}${pad2(dd)}${pad2(HH)}${pad2(MI)}${pad2(SS)}`;
    return { iso, ofx };
  }

  return { iso: raw, ofx: "" };
};

const buildOfx = (resume: GowdResume | null, txns: GowdTxn[]) => {
  const now = new Date();
  const dtServer =
    `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}` +
    `${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;

  const bankId = resume?.bankId || "00000000";
  const acctId = resume?.account || "0000000000";
  const acctType = "CHECKING";

  const sorted = [...txns]
    .filter((t) => t.dtPostedOfx)
    .sort((a, b) => (a.dtPostedOfx > b.dtPostedOfx ? 1 : -1));
  const dtStart = sorted[0]?.dtPostedOfx || dtServer;
  const dtEnd = sorted[sorted.length - 1]?.dtPostedOfx || dtServer;

  const trns = sorted
    .map((t) => {
      const trnType = t.amount < 0 ? "DEBIT" : "CREDIT";
      const amt = t.amount.toFixed(2);
      const name = (t.memo || "").slice(0, 32).replace(/[<>]/g, "");
      const memo =
        `${t.name || ""}${t.bankName ? ` | ${t.bankName}` : ""}${t.e2eId ? ` | E2E: ${t.e2eId}` : ""}`
          .trim()
          .replace(/[<>]/g, "");

      return [
        "<STMTTRN>",
        `<TRNTYPE>${trnType}`,
        `<DTPOSTED>${t.dtPostedOfx}`,
        `<TRNAMT>${amt}`,
        `<FITID>${t.fitId}`,
        `<NAME>${name || "TX"}`,
        `<MEMO>${memo}`,
        "</STMTTRN>",
      ].join("\n");
    })
    .join("\n");

  return [
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
    "<STATUS><CODE>0<SEVERITY>INFO</STATUS>",
    `<DTSERVER>${dtServer}`,
    "<LANGUAGE>POR",
    "</SONRS>",
    "</SIGNONMSGSRSV1>",
    "<BANKMSGSRSV1>",
    "<STMTTRNRS>",
    "<TRNUID>1",
    "<STATUS><CODE>0<SEVERITY>INFO</STATUS>",
    "<STMTRS>",
    "<CURDEF>BRL",
    "<BANKACCTFROM>",
    `<BANKID>${bankId}`,
    `<ACCTID>${acctId}`,
    `<ACCTTYPE>${acctType}`,
    "</BANKACCTFROM>",
    "<BANKTRANLIST>",
    `<DTSTART>${dtStart}`,
    `<DTEND>${dtEnd}`,
    trns,
    "</BANKTRANLIST>",
    "</STMTRS>",
    "</STMTTRNRS>",
    "</BANKMSGSRSV1>",
    "</OFX>",
    "",
  ].join("\n");
};

export const GowdOFXUploader = () => {
  const [resume, setResume] = useState<GowdResume | null>(null);
  const [transactions, setTransactions] = useState<GowdTxn[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => fileInputRef.current?.click();

  const parseResumeSheet = (ws: XLSX.WorkSheet): GowdResume => {
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }) as any[][];
    const map = new Map<string, string>();

    for (const r of rows) {
      const k = String(r?.[0] ?? "").trim();
      const v = String(r?.[1] ?? "").trim();
      if (k) map.set(k, v);
    }

    return {
      bankId: map.get("ISPB") || "",
      institution: map.get("Institution") || "",
      branch: map.get("Branch") || "",
      account: map.get("Account") || "",
      holderName: map.get("Name") || "",
      holderDocument: map.get("Document") || "",
      period: map.get("Period") || "",
      balance: map.get("Balance") || "",
    };
  };

  const parseBankStatementSheet = (ws: XLSX.WorkSheet): GowdTxn[] => {
    // ✅ raw:true para pegar números de verdade (evita "5.000" virar 5)
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }) as any[][];
    if (!rows.length) return [];

    const header = rows[0].map((h: any) =>
      String(h ?? "")
        .trim()
        .toLowerCase(),
    );
    const idx = (name: string) => header.indexOf(name.toLowerCase());

    const iCreatedAt = idx("Created At");
    const iAmount = idx("Amount");
    const iDescription = idx("Description");
    const iName = idx("Name");
    const iDocument = idx("Document");
    const iBankName = idx("Bank Name");
    const iBranch = idx("Branch Number");
    const iAccount = idx("Account Number");
    const iExternal = idx("External Code");
    const iIdentifier = idx("Identifier");
    const iE2E = idx("E2E ID");

    if (iCreatedAt === -1 || iAmount === -1) {
      toast.error("Estrutura do extrato Gowd não reconhecida (aba Bank Statement).");
      return [];
    }

    // ✅ pega TODAS as transações (sem filtro de entrada/saída)
    return rows
      .slice(1)
      .map((r, line) => {
        const createdAt = r[iCreatedAt];
        const amountRaw = r[iAmount];

        const amountNum = parseAmountBR(amountRaw);
        const { iso, ofx } = parseDateTimeAny(createdAt);

        // se não tiver data ou valor, ignora linha vazia
        if (!iso || !Number.isFinite(amountNum)) return null;

        const memo = String(r[iDescription] ?? "").trim();
        const name = String(r[iName] ?? "").trim();
        const document = String(r[iDocument] ?? "").trim();
        const bankName = String(r[iBankName] ?? "").trim();
        const branchNumber = String(r[iBranch] ?? "").trim();
        const accountNumber = String(r[iAccount] ?? "").trim();

        const externalCode = String(r[iExternal] ?? "").trim();
        const identifier = String(r[iIdentifier] ?? "").trim();
        const e2eId = String(r[iE2E] ?? "").trim();

        const fitId = identifier || externalCode || e2eId || `${ofx || "0"}-${line}`;

        return {
          dateISO: iso,
          dtPostedOfx: ofx || "",
          amount: amountNum,
          memo,
          name,
          document,
          bankName,
          branchNumber,
          accountNumber,
          e2eId,
          fitId,
        } as GowdTxn;
      })
      .filter(Boolean) as GowdTxn[];
  };

  const handleImportGowd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: false });

      const resumeSheetName = wb.SheetNames.find((n) => n.toLowerCase().includes("resume"));
      const bankSheetName = wb.SheetNames.find((n) => n.toLowerCase().includes("bank statement"));

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
