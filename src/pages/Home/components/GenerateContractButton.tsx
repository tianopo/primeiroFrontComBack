import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { confirmContract } from "src/pages/Users/utils/confirmContract";

// ✅ ajuste o path conforme onde está seu confirmContract
// ou: import { confirmContract } from "src/pages/PendingOrders/utils/confirmContract";

type Transaction = {
  tipo: "compras" | "vendas";
  numeroOrdem: string | number;
  dataHora: string; // ex: "20/02/2026 14:58:54"
  exchange: string;
  ativo: string;
  quantidade: string;
  valor: string;
  User?: {
    name?: string;
    document?: string;
  };
};

function base64ToBlob(base64: string, mime = "application/pdf"): Blob {
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const toBRDateTime = (value: string) => {
  // aceita: "YYYY-MM-DD HH:MM:SS" ou "YYYY-MM-DDTHH:MM:SS"
  const m = String(value ?? "")
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T])(\d{2}):(\d{2})(?::(\d{2}))?/);

  if (!m) return value;

  const [, yyyy, mm, dd, HH, MM, SS = "00"] = m;
  return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`;
};

export const GenerateContractButton: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ apenas vendas
  if (transaction.tipo !== "vendas") return null;

  const handleGenerateContract = async () => {
    try {
      setIsGenerating(true);

      const exchange = String(transaction.exchange || "").split(" ")[0] || "-";
      const ordem = String(transaction.numeroOrdem ?? "-");

      const contract = await confirmContract({
        usuario: {
          apelido: transaction.User?.name ?? "-",
          name: transaction.User?.name ?? "-",
          document: transaction.User?.document ?? "-",
        },
        ordem,
        data: toBRDateTime(transaction.dataHora),
        exchange,
        quantidade: String(transaction.quantidade ?? "-"),
        valor: String(transaction.valor ?? "-"),
        ativo: String(transaction.ativo ?? "-"),
      });

      // contract.pdfBase64 = base64 puro
      const blob = base64ToBlob(contract.pdfBase64, "application/pdf");
      downloadBlob(blob, contract.fileName || `contrato-${ordem}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao gerar contrato (PDF).");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleGenerateContract} disabled={isGenerating}>
      {isGenerating ? "Gerando..." : "Gerar Contrato"}
    </Button>
  );
};
