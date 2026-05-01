import JSZip from "jszip";
import { formatBRL, formatTimestampBR, maskDocument } from "src/utils/formats";

export const generateSingleReceipt = (item: any): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve("");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const logo = new Image();
    logo.src = "/logo.png";
    logo.onload = () => {
      ctx.drawImage(logo, 300, 20, 180, 180);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("RECIBO PÚBLICO DE TRANSAÇÃO", canvas.width / 2, 240);

      ctx.font = "16px Arial";
      const now = new Date().toLocaleString("pt-BR");
      const dataRecibo = [
        `${item?.pixInStatement ? `EndToEnd: ${item?.pixInStatement?.originalEndToEnd}` : `ID do recibo: ${item.id}`}`,
        `${item?.pixInStatement ? `Data da transação: ${item?.pixInStatement?.timestamp}` : `Data da impressão: ${now}`}`,
        `CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA`,
        `CPF/CNPJ: 55.636.113/0001-70`,
        `Banco: CORPX BANK`,
      ];

      ctx.textAlign = "left";
      let y = 280;
      dataRecibo.forEach((line) => {
        ctx.fillText(line, 50, y);
        y += 30;
      });

      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("INFORMAÇÕES DA ORDEM", canvas.width / 2, y + 40);
      y += 70;

      ctx.font = "16px Arial";
      const counterpartyName = item?.side === 0 ? item?.sellerRealName : item?.buyerRealName;

      const dataOrdem = [
        `ID da ordem: ${item.id}`,
        `Data da Ordem: ${item.formattedDate}`,
        `Exchange: ${item.exchange}`,
        `Apelido: ${item.targetNickName || "Não informado"}`,
        `Nome: ${counterpartyName || "Não informado"}`,
        `Ativo: ${item.tokenId}`,
        `Moeda: ${item.currencyId}`,
        `Tipo: ${item.side === 0 ? "compras" : "vendas"}`,
        `Valor: ${String(item.amount ?? "").replace(".", ",")}`,
        `Preço unitário: ${String(item.price ?? "").replace(".", ",")}`,
        `Quantidade: ${item.notifyTokenQuantity}`,
        `CPF/CNPJ: ${item.document || "Não informado"}`,
      ];

      ctx.textAlign = "left";
      dataOrdem.forEach((line) => {
        ctx.fillText(line, 50, y);
        y += 30;
      });

      // Footer
      ctx.font = "bold 16px Arial";
      ctx.fillText("www.cryptotechdev.com", 50, canvas.height - 50);

      const whatsappIcon = new Image();
      whatsappIcon.src = "/socialMedias/whatsapp.png";
      whatsappIcon.onload = () => {
        const iconSize = 20;
        const xRight = canvas.width - 50;
        const text = "WhatsApp: (12) 99254-6355";
        const textWidth = ctx.measureText(text).width;

        ctx.drawImage(
          whatsappIcon,
          xRight - textWidth - iconSize - 10,
          canvas.height - 50,
          iconSize,
          iconSize,
        );

        ctx.textAlign = "right";
        ctx.fillText(text, xRight, canvas.height - 35);

        const base64 = canvas.toDataURL("image/png");
        resolve(base64);
      };
    };
  });
};

export const handleReceipt = (data: any[]) => {
  const zip = new JSZip(); // Cria o zip

  const generateReceipt = (item: any): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const logo = new Image();
      logo.src = "/logo.png";
      logo.onload = () => {
        ctx.drawImage(logo, 300, 20, 180, 180);

        ctx.fillStyle = "#000000";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("RECIBO PÚBLICO DE TRANSAÇÃO", canvas.width / 2, 240);

        ctx.font = "16px Arial";
        const now = new Date().toLocaleString("pt-BR");
        const dataRecibo = [
          `ID do recibo: ${item.numeroOrdem}`,
          `Data da impressão: ${now}`,
          `CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA`,
          `CPF/CNPJ: 55.636.113/0001-70`,
          `Banco: CORPX BANK`,
        ];

        ctx.textAlign = "left";
        let y = 280;
        dataRecibo.forEach((line) => {
          ctx.fillText(line, 50, y);
          y += 30;
        });

        ctx.fillStyle = "#000000";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("INFORMAÇÕES DA ORDEM", canvas.width / 2, y + 40);
        y += 70;

        ctx.font = "16px Arial";

        const dataOrdem = [
          `ID da ordem: ${item.numeroOrdem}`,
          `Data da Ordem: ${item.dataHora.split(" ")[0].split("-").reverse().join("/")}`,
          `Exchange: ${item.exchange.split(" ")[0]}`,
          `Apelido: ${item.User?.Accounts?.find((acc: any) => acc.exchange === item.exchange)?.counterparty || "Não informado"}`,
          `Nome: ${item.User?.name || "Não informado"}`,
          `Ativo: ${item.ativo}`,
          `Tipo: ${item.tipo}`,
          `Valor: ${item.valor}`,
          `Preço unitário: R$ ${item.valorToken.replace(".", ",")}`,
          `Quantidade: ${item.quantidade}`,
          `Documento: ${item.User?.document || "Não informado"}`,
        ];

        ctx.textAlign = "left";
        dataOrdem.forEach((line) => {
          ctx.fillText(line, 50, y);
          y += 30;
        });

        // Footer - Site
        ctx.font = "bold 16px Arial";
        ctx.fillText("www.cryptotechdev.com", 50, canvas.height - 50);

        // Footer - WhatsApp
        const whatsappIcon = new Image();
        whatsappIcon.src = "/socialMedias/whatsapp.png";
        whatsappIcon.onload = () => {
          const iconSize = 20;
          const xRight = canvas.width - 50;
          const text = "WhatsApp: (12) 99254-6355";
          const textWidth = ctx.measureText(text).width;

          ctx.drawImage(
            whatsappIcon,
            xRight - textWidth - iconSize - 10,
            canvas.height - 50,
            iconSize,
            iconSize,
          );

          ctx.textAlign = "right";
          ctx.fillText(text, xRight, canvas.height - 35);

          canvas.toBlob((blob) => {
            if (blob) {
              const fileName = `recibo-${item.User?.name || "cliente"}-${item.valor}-${item.numeroOrdem}.png`;
              zip.file(fileName, blob);
            }
            resolve();
          }, "image/png");
        };
      };
    });
  };

  Promise.all(data.map((item) => generateReceipt(item))).then(() => {
    zip.generateAsync({ type: "blob" }).then((content: Blob | MediaSource) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "recibos-cryptotech.zip";
      link.click();
    });
  });
};

export const generateStatementReceipt = (tx: any): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1100;

    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve("");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const logo = new Image();
    logo.src = "/logo.png";

    const centerX = canvas.width / 2;

    // ✅ bloco centralizado, mas texto alinhado à esquerda (todas as linhas começam no mesmo x)
    const BLOCK_W = 680;
    const BLOCK_X = centerX - BLOCK_W / 2;

    const lineBlock = (text: string, y: number, font = "20px Arial", bold = false) => {
      ctx.fillStyle = "#000";
      ctx.font = `${bold ? "bold " : ""}${font}`;
      ctx.textAlign = "left";
      ctx.fillText(text, BLOCK_X, y);
    };

    const draw = () => {
      // logo
      try {
        ctx.drawImage(logo, centerX - 90, 20, 180, 180);
      } catch {}

      // título
      ctx.fillStyle = "#000";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText("RECIBO DE TRANSAÇÃO PIX", centerX, 240);

      const e2e = String(tx?.endToEndId || tx?.originalEndToEnd || "-");
      const timestamp = formatTimestampBR(String(tx?.timestamp || ""));
      const description = String(tx?.description || "-");
      const amount = typeof tx?.amount === "number" ? tx.amount : Number(tx?.amount || 0);

      const isIN = tx?.operation === "LOAD";
      console.log(tx);
      const counterpartyName = tx?.payer?.name;
      const counterpartyDoc = tx?.payer?.document;

      const bankNameRaw = tx?.payer?.bankName;
      const bankName = bankNameRaw ? String(bankNameRaw).trim() : ""; // ✅ vazio se não existir

      const branch = tx?.payer?.branch;
      const account = tx?.payer?.account;
      const counterpartyPixKey = tx?.payer?.pixKey;

      // ✅ monta todas as linhas do “bloco de informações” (sem banco quando não existir)
      const lines: Array<{ text: string; font?: string; bold?: boolean; gap?: number }> = [
        { text: "CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA", font: "20px Arial", bold: true },
        { text: "CNPJ: 55.636.113/0001-70", font: "20px Arial" },
        { text: "Banco: GOWD", font: "20px Arial" },
        { text: "", gap: 10 },

        { text: "DADOS DA TRANSAÇÃO", font: "22px Arial", bold: true },
        { text: `EndToEnd (E2E): ${e2e}`, font: "20px Arial" },
        { text: `Data/Hora: ${timestamp}`, font: "20px Arial" },
        { text: `Descrição: ${description}`, font: "20px Arial" },
        { text: "", gap: 10 },

        { text: isIN ? "PAGADOR" : "RECEBEDOR", font: "22px Arial", bold: true },
        { text: `Nome: ${counterpartyName ?? "-"}`, font: "20px Arial" },
        { text: `Documento: ${maskDocument(counterpartyDoc)}`, font: "20px Arial" },

        // ✅ banco só se existir
        ...(bankName ? [{ text: `Banco: ${bankName}`, font: "20px Arial" }] : []),

        { text: `${branch && "Agência: " + branch}`, font: "20px Arial" },
        { text: `Conta: ${account ?? "-"}`, font: "20px Arial" },

        ...(counterpartyPixKey
          ? [{ text: `Chave PIX: ${String(counterpartyPixKey)}`, font: "20px Arial" }]
          : []),
      ];

      // ✅ valor MAIS GRANDE (destaque abaixo do título)
      ctx.font = "bold 46px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.fillText(formatBRL(Math.abs(amount)), centerX, 305);

      // ✅ centralização vertical do bloco:
      // calcula altura total e posiciona para ficar “no meio” abaixo do valor
      const lineH = 32; // altura padrão
      const blockTopMin = 360; // começa depois do valor
      const footerSafe = 90; // espaço pro rodapé

      const totalHeight = lines.reduce(
        (acc, l) => acc + (l.text === "" ? (l.gap ?? 10) : lineH),
        0,
      );

      const availableTop = blockTopMin;
      const availableBottom = canvas.height - footerSafe;
      const availableH = availableBottom - availableTop;

      const startY = availableTop + Math.max(0, (availableH - totalHeight) / 2);

      // desenha o bloco
      let y = startY;
      for (const l of lines) {
        if (l.text === "") {
          y += l.gap ?? 10;
          continue;
        }
        lineBlock(l.text, y, l.font ?? "20px Arial", Boolean(l.bold));
        y += lineH;
      }

      // rodapé
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#000";

      ctx.textAlign = "left";
      ctx.fillText("www.cryptotechdev.com", 50, canvas.height - 40);

      ctx.textAlign = "right";
      ctx.fillText("WhatsApp: (12) 99254-6355", canvas.width - 50, canvas.height - 40);

      resolve(canvas.toDataURL("image/png"));
    };

    logo.onload = draw;
    logo.onerror = draw;
  });
};
