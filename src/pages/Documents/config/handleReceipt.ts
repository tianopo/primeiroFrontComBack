export const handleReceipt = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load image
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
      `ID do recibo: #ORD-1866527751835926528`,
      `Data da impressão: ${now}`,
      `CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA`,
      `CPF/CNPJ: 55.636.113/0001-70`,
      `Banco: 382 - Fidúcia SCM`,
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

    ctx.fillText("INFORMAÇÕES DA ORDEM", canvas.width / 2, 460);
    y += 70;
    ctx.font = "16px Arial";
    const dataOrdem = [
      `ID da ordem: #ORD-1866527751835926528`,
      `Data da Ordem: 29/04/2025`,
      `Exchange: Bybit`,
      `Apelido: user1234`,
      `Nome: NERY MARTINS`,
      `Ativo: USDT`,
      `Tipo: venda`,
      `Preço unitário: R$ 6,239`,
      `Quantidade: 160.2821`,
      `CPF/CNPJ: 705.735.652-87`,
    ];

    ctx.textAlign = "left";
    dataOrdem.forEach((line) => {
      ctx.fillText(line, 50, y);
      y += 30;
    });

    // Rodapé
    ctx.font = "bold 16px Arial";
    ctx.fillText("www.cryptotechdev.com", 50, canvas.height - 30);

    // Load WhatsApp icon and draw it with the number
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

      // Salvar como imagem após carregar o ícone
      const link = document.createElement("a");
      link.download = "recibo-transacao.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };
};
