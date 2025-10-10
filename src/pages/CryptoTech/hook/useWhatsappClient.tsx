export const buildWaLink = (toE164: string, text: string) => {
  // wa.me não aceita "+"
  const phone = toE164.replace(/^\+/, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encoded}`;
};

export const dataUrlToFile = async (dataUrl: string, filename: string) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
};

export const canShareFiles = () =>
  typeof navigator !== "undefined" && typeof navigator.canShare === "function";

type ShareArgs = {
  to: string; // telefone do cliente (qualquer formato BR, ex: (12) 9 9999-9999)
  text: string; // mensagem a ser enviada
  imgDataUrl?: string; // opcional: imagem do QR (data URL)
  filename?: string; // nome do arquivo da imagem
};

// Abre WhatsApp com texto (desktop e mobile). Não envia imagem.
export const openWhatsappWithText = ({ to, text }: ShareArgs) => {
  const url = buildWaLink(to, text);
  window.open(url, "_blank", "noopener,noreferrer");
};

// Tenta compartilhar texto + imagem usando Web Share API (Android/Chrome)
export const shareTextAndImage = async ({
  to,
  text,
  imgDataUrl,
  filename = "pix-qr.png",
}: ShareArgs) => {
  if (!imgDataUrl || !canShareFiles() || !navigator || !("share" in navigator)) {
    // fallback: abre o wa.me com o texto
    openWhatsappWithText({ to, text });
    return false;
  }

  try {
    const file = await dataUrlToFile(imgDataUrl, filename);
    const can = navigator.canShare?.({ files: [file], text });
    if (!can) {
      openWhatsappWithText({ to, text });
      return false;
    }

    await navigator.share({ text, files: [file] });
    return true;
  } catch {
    openWhatsappWithText({ to, text });
    return false;
  }
};

export const useWhatsappClient = () => {
  return {
    openWhatsappWithText,
    shareTextAndImage,
    dataUrlToFile,
  };
};
