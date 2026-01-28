import React, { useRef, useState } from "react";
import { parseDateToYYYYMMDD } from "../helper/parseDateToYYYYMMDD";

export const CSVUploader = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [tarifaTotal, setTarifaTotal] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceFileName, setSourceFileName] = useState<string>("");

  // Conta delimitadores fora de aspas
  const countCharOutsideQuotes = (line: string, ch: string) => {
    let inQuotes = false;
    let count = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        // trata escape "" dentro de aspas
        if (inQuotes && line[i + 1] === '"') {
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes && c === ch) {
        count++;
      }
    }
    return count;
  };

  const detectDelimiter = (firstLine: string): string => {
    const candidates = [",", ";", "\t"]; // CSV comum, Brasil, e TSV
    let best = ",";
    let bestCount = -1;

    for (const c of candidates) {
      const cnt = countCharOutsideQuotes(firstLine, c);
      if (cnt > bestCount) {
        bestCount = cnt;
        best = c;
      }
    }

    return best;
  };

  // Parser por caractere, respeitando aspas
  const parseLine = (line: string, delimiter: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];

      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // pula escape
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && c === delimiter) {
        out.push(cur);
        cur = "";
        continue;
      }

      cur += c;
    }
    out.push(cur);
    return out;
  };

  const cleanCell = (s: string) =>
    (s ?? "")
      .replace(/\uFEFF/g, "") // remove BOM se existir
      .replace(/\r/g, "")
      .trim();

  const normalizeRowToHeaders = (row: string[], headerLen: number) => {
    const r = row.map(cleanCell);
    if (r.length < headerLen) return [...r, ...Array(headerLen - r.length).fill("")];
    if (r.length > headerLen) return r.slice(0, headerLen);
    return r;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    // normaliza quebras de linha
    const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = normalized.split("\n").filter((line) => line.trim() !== "");
    if (!lines.length) return;

    const delimiter = detectDelimiter(lines[0]); // <-- aqui resolve Pinbank

    const newHeadersRaw = parseLine(lines[0], delimiter).map(cleanCell);
    const headerLen = newHeadersRaw.length;

    const newRowsRaw = lines
      .slice(1)
      .map((line) => normalizeRowToHeaders(parseLine(line, delimiter), headerLen));

    // --- Acumular arquivos em vez de substituir ---
    let finalHeaders: string[] = [];
    let finalRows: string[][] = [];

    if (headers.length === 0) {
      finalHeaders = newHeadersRaw;
      finalRows = newRowsRaw;
    } else {
      const currentLower = headers.map((h) => h.toLowerCase());
      const incomingLower = newHeadersRaw.map((h) => h.toLowerCase());

      const sameStructure =
        currentLower.length === incomingLower.length &&
        currentLower.every((h, idx) => h === incomingLower[idx]);

      if (sameStructure) {
        finalHeaders = headers;
        finalRows = [...rows, ...newRowsRaw];
      } else {
        finalHeaders = newHeadersRaw;
        finalRows = newRowsRaw;
      }
    }

    setHeaders(finalHeaders);
    setRows(finalRows);

    // === Soma dinâmica das tarifas (com base no conjunto acumulado) ===
    const lowerHeaders = finalHeaders.map((h) => h.toLowerCase());

    const descricaoIndex = lowerHeaders.findIndex(
      (h) =>
        h.includes("descri") || h.includes("histó") || h.includes("histor") || h.includes("transa"),
    );
    const valorIndex = lowerHeaders.findIndex((h) => h.includes("valor"));

    let total = 0;

    if (descricaoIndex !== -1 && valorIndex !== -1) {
      finalRows.forEach((row) => {
        const descricao = (row[descricaoIndex] || "").toLowerCase();

        if (descricao.includes("tarifa")) {
          let valorStr = row[valorIndex] || "0";
          valorStr = valorStr.replace(/[R$\s]/gi, "");
          valorStr = valorStr.replace(/\./g, "").replace(",", ".");
          const valorNum = parseFloat(valorStr);
          if (!Number.isNaN(valorNum)) total += valorNum;
        }
      });
    }

    setTarifaTotal(total);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const buildProcessedTransactions = () => {
    const lowerHeaders = headers.map((h) => h.toLowerCase());

    const dataIndex = lowerHeaders.findIndex((h) => h.includes("data"));
    const amountIndex = lowerHeaders.findIndex((h) => h.includes("valor"));
    const memoIndex = lowerHeaders.findIndex(
      (h) =>
        h.includes("transa") || h.includes("descri") || h.includes("histó") || h.includes("histor"),
    );
    // agora é OPCIONAL
    const typeIndex = lowerHeaders.findIndex((h) => h.includes("tipo"));

    // ✅ não exige mais "tipo"
    if (dataIndex === -1 || amountIndex === -1 || memoIndex === -1) {
      alert(
        "Certifique-se de que os cabeçalhos possuem colunas de: data, valor, descrição/transação.",
      );
      return null;
    }

    const parseAmountBR = (value: string) => {
      let rawAmount = value || "0";
      rawAmount = rawAmount.replace(/[R$\s]/gi, "");
      rawAmount = rawAmount.replace(/\./g, "").replace(",", ".");
      const n = parseFloat(rawAmount);
      return Number.isNaN(n) ? NaN : n;
    };

    const processedTransactions = rows
      .map((row, index) => {
        // --- Data ---
        const date = parseDateToYYYYMMDD(row[dataIndex] || "");
        if (!date) return null; // ignora "Saldo anterior" etc

        // --- Memo ---
        const memo = (row[memoIndex] || "").trim();
        if (!memo) return null;

        // --- Valor (com sinal do próprio campo) ---
        let amount = parseAmountBR(row[amountIndex] || "");
        if (Number.isNaN(amount)) return null;

        // --- Tipo (se existir, corrige sinal) ---
        if (typeIndex !== -1) {
          const typeRaw = (row[typeIndex] || "").trim().toLowerCase();
          if (typeRaw.includes("débito") || typeRaw.includes("debito") || typeRaw === "d") {
            amount = -Math.abs(amount);
          } else if (
            typeRaw.includes("crédito") ||
            typeRaw.includes("credito") ||
            typeRaw === "c"
          ) {
            amount = Math.abs(amount);
          }
        }
        // se NÃO existir coluna tipo: mantém o sinal que veio (ex.: -316, -5, 4000,00)

        const fitid = `${date}-${index}`;
        return { date, amount, memo, fitid };
      })
      .filter(Boolean) as { date: string; amount: number; memo: string; fitid: string }[];

    if (processedTransactions.length === 0) {
      alert("Nenhuma transação válida encontrada.");
      return null;
    }

    const dates = processedTransactions.map((t) => t.date);
    const dtStart = dates.reduce((a, b) => (a < b ? a : b));
    const dtEnd = dates.reduce((a, b) => (a > b ? a : b));

    return { processedTransactions, dtStart, dtEnd };
  };

  const sanitizeOfxText = (s: string) => {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[<>&]/g, " ") // evita quebrar SGML
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const exportToOFXFiducia = () => {
    const result = buildProcessedTransactions();
    if (!result) return;

    const { processedTransactions, dtStart, dtEnd } = result;

    const now = new Date();
    const dateTimeStr = now
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 8);

    const ofxHeader = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
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
      <DTSERVER>${dateTimeStr}</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
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
        <CURDEF>BRL</CURDEF>
        <BANKACCTFROM>
          <BANKID>28077646</BANKID>
          <ACCTID>28077641</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${String(dtStart).slice(0, 8)}</DTSTART>
          <DTEND>${String(dtEnd).slice(0, 8)}</DTEND>
`;

    const transactions = processedTransactions
      .map(
        (t) => `
          <STMTTRN>
            <TRNTYPE>OTHER</TRNTYPE>
            <DTPOSTED>${String(t.date).slice(0, 8)}</DTPOSTED>
            <TRNAMT>${Number(t.amount).toFixed(2)}</TRNAMT>
            <FITID>${sanitizeOfxText(String(t.fitid))}</FITID>
            <NAME>${sanitizeOfxText(String(t.memo))}</NAME>
          </STMTTRN>`,
      )
      .join("\n");

    const ofxFooter = `
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>0.00</BALAMT>
          <DTASOF>${String(dtEnd).slice(0, 8)}</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const ofxContent = ofxHeader + transactions + ofxFooter;

    const blob = new Blob([ofxContent], { type: "text/ofx" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fiducia-${Date.now()}.ofx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToOFXCorpx = () => {
    const result = buildProcessedTransactions();
    if (!result) return;

    const { processedTransactions, dtStart, dtEnd } = result;

    const now = new Date();
    const dateTimeStr = now
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 8);

    const ofxHeader = `OFXHEADER:100
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
      <DTSERVER>${dateTimeStr}</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>2</TRNUID>
      <STATUS>
        <CODE>0</CODE>
        <SEVERITY>INFO</SEVERITY>
      </STATUS>
      <STMTRS>
        <CURDEF>BRL</CURDEF>
        <BANKACCTFROM>
          <BANKID>00000000</BANKID>       <!-- Substituir pelo BANKID real do Corpx -->
          <ACCTID>00000000</ACCTID>       <!-- Substituir pela conta real do Corpx -->
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${dtStart}</DTSTART>
          <DTEND>${dtEnd}</DTEND>
`;

    const transactions = processedTransactions
      .map(
        (t) => `
          <STMTTRN>
            <TRNTYPE>OTHER</TRNTYPE>
            <DTPOSTED>${t.date}</DTPOSTED>
            <TRNAMT>${t.amount.toFixed(2).replace(".", ",")}</TRNAMT>
            <FITID>${t.fitid}</FITID>
            <NAME>${t.memo}</NAME>
          </STMTTRN>`,
      )
      .join("\n");

    const ofxFooter = `
        </BANKTRANLIST>
        <LEDGERBAL>
          <BALAMT>0,00</BALMT>
          <DTASOF>${dtEnd}</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const ofxContent = ofxHeader + transactions + ofxFooter;

    const blob = new Blob([ofxContent], { type: "text/ofx" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `corpx-${Date.now()}.ofx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToOFXPinbank = () => {
    // ==== parser específico pra Pinbank (pra bater com o .ofx modelo) ====
    const lowerHeaders = headers.map((h) => h.toLowerCase());

    const dataIndex = lowerHeaders.findIndex((h) => h.includes("data"));
    const descIndex = lowerHeaders.findIndex((h) => h.includes("descri") || h.includes("transa"));
    const valorIndex = lowerHeaders.findIndex((h) => h.includes("valor"));
    const tipoIndex = lowerHeaders.findIndex((h) => h.includes("tipo"));
    const refIndex = lowerHeaders.findIndex((h) => h.includes("refer"));

    if (dataIndex === -1 || descIndex === -1 || valorIndex === -1 || tipoIndex === -1) {
      alert(
        "Pinbank: preciso das colunas Data, Descrição, Valor, Tipo de transação (e Referência opcional).",
      );
      return;
    }

    const sanitizeName = (s: string) =>
      (s || "")
        .replace(/[()]/g, "") // remove parênteses igual o modelo
        .replace(/\s{2,}/g, " ") // normaliza espaços
        .trim();

    const parsePinbankDateToYYYYMMDD = (s: string) => {
      // Ex.: 31/01/2025 16:25:07 -> 20250131
      const m = String(s || "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (m) {
        const [, dd, mm, yyyy] = m;
        return `${yyyy}${mm}${dd}`;
      }
      // fallback: extrai dígitos e tenta inferir
      const digits = String(s || "").replace(/\D/g, "");
      if (digits.length >= 8) {
        const first4 = Number(digits.slice(0, 4));
        if (first4 >= 1900 && first4 <= 2100) return digits.slice(0, 8);
        const dd = digits.slice(0, 2);
        const mm = digits.slice(2, 4);
        const yyyy = digits.slice(4, 8);
        return `${yyyy}${mm}${dd}`;
      }
      return "";
    };

    const parseMoney = (raw: string, tipo: string) => {
      const rawStr = String(raw || "");
      let s = rawStr.replace(/[R$\s]/gi, "");
      s = s.replace(/\./g, "").replace(",", ".");
      let n = parseFloat(s);
      if (Number.isNaN(n)) n = 0;

      // Pinbank geralmente já vem com "-" no débito, mas garantimos consistência:
      const t = String(tipo || "").toLowerCase();
      const hasMinusInText = rawStr.includes("-");
      if (t.includes("débito") || t.includes("debito") || t === "d") {
        n = hasMinusInText ? -Math.abs(n) : -Math.abs(n);
      } else if (t.includes("crédito") || t.includes("credito") || t === "c") {
        n = Math.abs(n);
      }
      return n;
    };

    // monta transações no formato do OFX modelo
    const txs = rows
      .map((row, idx) => {
        const dt = parsePinbankDateToYYYYMMDD(row[dataIndex]);
        if (!dt) return null;

        const memo = sanitizeName(row[descIndex] || "");
        if (!memo) return null;

        const amount = parseMoney(row[valorIndex], row[tipoIndex]);

        // FITID: usa "Referência" quando tiver (modelo faz isso)
        let fitid = "";
        if (refIndex !== -1) {
          fitid = String(row[refIndex] || "").replace(/\D/g, "");
        }
        if (!fitid) {
          fitid = `${dt}${idx}`; // fallback
        }

        return { date: dt, amount, memo, fitid };
      })
      .filter(Boolean) as { date: string; amount: number; memo: string; fitid: string }[];

    if (!txs.length) {
      alert("Pinbank: nenhuma transação válida encontrada.");
      return;
    }

    // no OFX modelo:
    // DTSTART = data mais nova | DTEND = data mais antiga (invertido)
    const dates = txs.map((t) => t.date);
    const minDate = dates.reduce((a, b) => (a < b ? a : b)); // mais antiga
    const maxDate = dates.reduce((a, b) => (a > b ? a : b)); // mais nova

    const dtsServer = minDate; // modelo usa a mais antiga
    const dtStartOut = maxDate; // invertido no modelo
    const dtEndOut = minDate; // invertido no modelo

    // constantes iguais ao arquivo extrato_pinbank_01-31.ofx
    const CURDEF = "USD";
    const BANKID = "70835896";
    const ACCTID = "70835891";

    const ofxHeader = `OFXHEADER:100
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
      <DTSERVER>${dtsServer}</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
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
        <CURDEF>${CURDEF}</CURDEF>
        <BANKACCTFROM>
          <BANKID>${BANKID}</BANKID>
          <ACCTID>${ACCTID}</ACCTID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>

        <BANKTRANLIST>
          <DTSTART>${dtStartOut}</DTSTART>
          <DTEND>${dtEndOut}</DTEND>
`;

    const transactions = txs
      .map(
        (t) => `                <STMTTRN>
                  <TRNTYPE>OTHER</TRNTYPE>
                  <DTPOSTED>${t.date}</DTPOSTED>
                  <TRNAMT>${t.amount.toFixed(2)}</TRNAMT>
                  <FITID>${t.fitid}</FITID>
                  <NAME>${t.memo}</NAME>
                </STMTTRN>`,
      )
      .join("\n");

    const ofxFooter = `
        </BANKTRANLIST>

        <LEDGERBAL>
          <BALAMT>0.00</BALAMT>
          <DTASOF>${dtEndOut}</DTASOF>
        </LEDGERBAL>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
`;

    const ofxContent = ofxHeader + transactions + ofxFooter;

    const blob = new Blob([ofxContent], { type: "text/ofx" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pinbank-${Date.now()}.ofx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={triggerFileInput}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Importar CSV
        </button>

        {headers.length > 0 && (
          <>
            <button
              onClick={exportToOFXFiducia}
              className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Exportar OFX (Fidúcia)
            </button>

            <button
              onClick={exportToOFXCorpx}
              className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
            >
              Exportar OFX (Corpx)
            </button>

            <button
              onClick={exportToOFXPinbank}
              className="rounded bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
            >
              Exportar OFX (Pinbank)
            </button>
          </>
        )}
      </div>
      {/* Exibe soma das tarifas + quantidade de linhas */}
      {headers.length > 0 && (
        <div className="space-y-1">
          <p className="font-semibold text-red-600">
            Total de tarifas (todos os CSVs carregados): R${" "}
            {tarifaTotal.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-sm text-gray-700">
            Total de linhas (transações carregadas): <strong>{rows.length}</strong>
          </p>
        </div>
      )}

      {/* Input de arquivo invisível */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Tabela de visualização */}
      {headers.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header, index) => (
                  <th key={index} className="border px-4 py-2 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
