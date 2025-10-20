import JSZip from "jszip";

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
        `ID do recibo: ${item.id}`,
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
        `ID da ordem: ${item.id}`,
        `Data da Ordem: ${item.formattedDate}`,
        `Exchange: Bybit`,
        `Apelido: ${item.targetNickName || "Não informado"}`,
        `Nome: ${item.buyerRealName || "Não informado"}`,
        `Ativo: ${item.tokenId}`,
        `Tipo: ${item.side === 0 ? "compras" : "vendas"}`,
        `Valor: R$ ${item.amount.replace(".", ",")}`,
        `Preço unitário: R$ ${item.price.replace(".", ",")}`,
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
