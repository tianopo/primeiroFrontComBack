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

    const parsedHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const parsedRows = lines
      .slice(1)
      .map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));

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
    const typeIndex = headers.findIndex((h) => h.toLowerCase().includes("tipo")); // Novo índice

    if (dataIndex === -1 || amountIndex === -1 || memoIndex === -1 || typeIndex === -1) {
      alert(
        "Certifique-se de que os cabeçalhos são: data, valor (R$), transações, tipo de transação.",
      );
      return;
    }

    const now = new Date();
    const dateTimeStr = now
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const ofxHeader = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1
      <STATUS>
        <CODE>0
        <SEVERITY>INFO
      </STATUS>
      <STMTRS>
        <BANKTRANLIST>
`;

    const transactions = rows
      .map((row) => {
        const rawDate = row[dataIndex].replace(/[^0-9]/g, ""); // formato yyyymmdd
        const date = rawDate.padEnd(8, "0");

        let amount = parseFloat(row[amountIndex].replace(",", ".").replace(/[^\d.-]/g, ""));

        const type = row[typeIndex]?.trim().toLowerCase();
        if (type === "débito" || type === "debito") {
          amount = -Math.abs(amount); // sempre negativo
        } else if (type === "crédito" || type === "credito") {
          amount = Math.abs(amount); // sempre positivo
        }

        const memo = row[memoIndex];

        if (!date || isNaN(amount) || !memo) return "";

        return `
          <STMTTRN>
            <TRNTYPE>OTHER
            <DTPOSTED>${date}
            <TRNAMT>${amount.toFixed(2).replace(".", ",")}
            <NAME>${memo}
          </STMTTRN>
        `;
      })
      .join("\n");

    const ofxFooter = `
        </BANKTRANLIST>
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
