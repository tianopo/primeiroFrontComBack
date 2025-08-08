import React, { useRef, useState } from "react";

export const CSVUploader = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
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
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const exportToOFX = () => {
    const dataIndex = headers.findIndex((h) => h.toLowerCase().includes("data"));
    const amountIndex = headers.findIndex((h) => h.toLowerCase().includes("valor"));
    const memoIndex = headers.findIndex((h) => h.toLowerCase().includes("transa"));
    const typeIndex = headers.findIndex((h) => h.toLowerCase().includes("tipo"));

    if (dataIndex === -1 || amountIndex === -1 || memoIndex === -1 || typeIndex === -1) {
      alert(
        "Certifique-se de que os cabeçalhos são: data, valor (R$), transações, tipo de transação.",
      );
      return;
    }

    // Processa as transações para calcular datas e construir o array
    const processedTransactions = rows
      .map((row, index) => {
        const rawDate = row[dataIndex].replace(/[^0-9]/g, "");

        let date = rawDate;
        if (rawDate.length === 8) {
          // converte ddmmyyyy -> yyyymmdd
          const day = rawDate.substring(0, 2);
          const month = rawDate.substring(2, 4);
          const year = rawDate.substring(4, 8);
          date = `${year}${month}${day}`;
        }

        let rawAmount = row[amountIndex];
        rawAmount = rawAmount.replace(/\./g, "");
        rawAmount = rawAmount.replace(",", ".");
        let amount = parseFloat(rawAmount);

        const type = row[typeIndex]?.trim().toLowerCase();
        if (type === "débito" || type === "debito") {
          amount = -Math.abs(amount);
        } else if (type === "crédito" || type === "credito") {
          amount = Math.abs(amount);
        }

        const memo = row[memoIndex];
        if (!date || isNaN(amount) || !memo) return null;

        // Gera FITID único: use índice e data
        const fitid = `${date}-${index}`;

        return { date, amount, memo, fitid };
      })
      .filter(Boolean) as { date: string; amount: number; memo: string; fitid: string }[];

    if (processedTransactions.length === 0) {
      alert("Nenhuma transação válida encontrada.");
      return;
    }

    // Calcula datas para DTSTART e DTEND
    const dates = processedTransactions.map((t) => t.date);
    const dtStart = dates.reduce((a, b) => (a < b ? a : b));
    const dtEnd = dates.reduce((a, b) => (a > b ? a : b));

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
    link.download = `export-${Date.now()}.ofx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Botões */}
      <div className="flex gap-4">
        <button
          onClick={triggerFileInput}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Importar CSV
        </button>

        {headers.length > 0 && (
          <button
            onClick={exportToOFX}
            className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Exportar como OFX
          </button>
        )}
      </div>

      {/* Input de arquivo invisível */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Tabela */}
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
