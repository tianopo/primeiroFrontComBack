import React, { useRef, useState } from "react";

export const OFXUploader = () => {
  const [transactions, setTransactions] = useState<
    { date: string; amount: string; memo: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    const matches = [...text.matchAll(transactionRegex)];

    const parsedTransactions = matches.map((match) => {
      const block = match[1];

      const dateMatch = block.match(/<DTPOSTED>([^\n\r<]+)/)?.[1] ?? "";
      const amountMatch = block.match(/<TRNAMT>([^\n\r<]+)/)?.[1] ?? "";
      const memo = block.match(/<NAME>([^\n\r<]+)/)?.[1] ?? "";

      return {
        date: dateMatch.slice(0, 8),
        amount: amountMatch,
        memo: memo,
      };
    });

    setTransactions(parsedTransactions);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={triggerFileInput}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Importar OFX
      </button>

      <input
        type="file"
        accept=".ofx"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {transactions.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left font-semibold">Data</th>
                <th className="border px-4 py-2 text-left font-semibold">Valor</th>
                <th className="border px-4 py-2 text-left font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{txn.date}</td>
                  <td className="border px-4 py-2">{txn.amount}</td>
                  <td className="border px-4 py-2">{txn.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
