import React, { useRef, useState } from "react";

export const CSVUploader = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [tarifaTotal, setTarifaTotal] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    // Regex que divide apenas por vírgulas fora de aspas
    const csvSplitRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

    const parsedHeaders = lines[0].split(csvSplitRegex).map((h) => h.trim().replace(/^"|"$/g, ""));
    const parsedRows = lines
      .slice(1)
      .map((line) => line.split(csvSplitRegex).map((cell) => cell.trim().replace(/^"|"$/g, "")));

    setHeaders(parsedHeaders);
    setRows(parsedRows);

    // === Soma dinâmica das tarifas ===
    // Tenta achar coluna de descrição/histórico e coluna de valor pela label
    const lowerHeaders = parsedHeaders.map((h) => h.toLowerCase());

    const descricaoIndex = lowerHeaders.findIndex(
      (h) =>
        h.includes("descri") || h.includes("histó") || h.includes("histor") || h.includes("transa"),
    );
    const valorIndex = lowerHeaders.findIndex((h) => h.includes("valor"));

    let total = 0;

    if (descricaoIndex !== -1 && valorIndex !== -1) {
      parsedRows.forEach((row) => {
        const descricao = (row[descricaoIndex] || "").toLowerCase();

        if (descricao.includes("tarifa")) {
          let valorStr = row[valorIndex] || "0";

          // Remove símbolos de moeda e espaços
          valorStr = valorStr.replace(/[R$\s]/gi, "");
          // Remove separador de milhar e troca vírgula por ponto
          valorStr = valorStr.replace(/\./g, "").replace(",", ".");

          const valorNum = parseFloat(valorStr);
          if (!Number.isNaN(valorNum)) {
            total += valorNum;
          }
        }
      });
    }

    setTarifaTotal(total);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Constrói transações a partir de headers/rows para uso em ambos bancos
   * Funciona para:
   *  - Fidúcia (Internet Banking Fidúcia 01-15.csv)
   *  - Corpx (extrato_completo_2025-11-01_2025-11-01.csv)
   */
  const buildProcessedTransactions = () => {
    const lowerHeaders = headers.map((h) => h.toLowerCase());

    const dataIndex = lowerHeaders.findIndex((h) => h.includes("data")); // "data" / "data lançamento"
    const amountIndex = lowerHeaders.findIndex((h) => h.includes("valor")); // "valor" / "valor (r$)"
    const memoIndex = lowerHeaders.findIndex(
      (h) =>
        h.includes("transa") || h.includes("descri") || h.includes("histó") || h.includes("histor"),
    ); // "transações" / "descricao" / "histórico"
    const typeIndex = lowerHeaders.findIndex((h) => h.includes("tipo")); // "tipo de transação" / "tipo"

    if (dataIndex === -1 || amountIndex === -1 || memoIndex === -1 || typeIndex === -1) {
      alert(
        "Certifique-se de que os cabeçalhos possuem colunas de: data, valor, descrição/transação, tipo.",
      );
      return null;
    }

    const processedTransactions = rows
      .map((row, index) => {
        // --- Data ---
        // Fidúcia e Corpx costumam vir como dd/mm/aaaa
        const rawDate = (row[dataIndex] || "").replace(/[^0-9]/g, "");
        let date = rawDate;
        if (rawDate.length === 8) {
          const day = rawDate.substring(0, 2);
          const month = rawDate.substring(2, 4);
          const year = rawDate.substring(4, 8);
          date = `${year}${month}${day}`; // yyyymmdd
        }

        // --- Valor ---
        let rawAmount = row[amountIndex] || "0";
        // Remove símbolo de moeda e espaços
        rawAmount = rawAmount.replace(/[R$\s]/gi, "");
        // Remove separador de milhar e troca vírgula por ponto
        rawAmount = rawAmount.replace(/\./g, "").replace(",", ".");
        let amount = parseFloat(rawAmount);

        // --- Tipo (débito/crédito) ---
        const typeRaw = (row[typeIndex] || "").trim().toLowerCase();
        if (typeRaw.includes("débito") || typeRaw.includes("debito") || typeRaw === "d") {
          amount = -Math.abs(amount);
        } else if (typeRaw.includes("crédito") || typeRaw.includes("credito") || typeRaw === "c") {
          amount = Math.abs(amount);
        } else {
          // fallback: se não conseguir identificar, mantém o sinal original
        }

        const memo = row[memoIndex];
        if (!date || Number.isNaN(amount) || !memo) return null;

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

  /**
   * Exporta OFX para o banco Fidúcia
   */
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
          <BALAMT>0,00</BALAMT>
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
    link.download = `fiducia-${Date.now()}.ofx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Exporta OFX para o banco Corpx
   * – Mesma lógica de transações, mudando apenas os dados da conta.
   */
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
          <BALAMT>0,00</BALAMT>
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

  return (
    <div className="space-y-4">
      {/* Botões */}
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
          </>
        )}
      </div>

      {/* Exibe soma das tarifas */}
      {headers.length > 0 && (
        <p className="font-semibold text-red-600">
          Total de tarifas: R$ {tarifaTotal.toFixed(2).replace(".", ",")}
        </p>
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
