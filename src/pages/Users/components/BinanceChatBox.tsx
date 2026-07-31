import { ArrowCircleRight, ImageSquare } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useSendChatMessageBinance } from "../hooks/Binance/useSendChatMessageBinance";

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
  });

type BinanceChatBoxProps = {
  orderId: string;
  isPending: boolean;
  sendChatBinance: ReturnType<typeof useSendChatMessageBinance>["mutate"];
};

export const BinanceChatBox = ({ orderId, isPending, sendChatBinance }: BinanceChatBoxProps) => {
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = message.trim();
    if (!text || isPending) return;

    setMessage("");

    sendChatBinance(
      { orderNo: orderId, content: text, type: "text" },
      { onError: () => setMessage(text) },
    );
  };

  const handleFileSend = async (file?: File) => {
    if (!file) return;

    sendChatBinance({
      orderNo: orderId,
      content: await fileToBase64(file),
      type: "pic",
      fileName: file.name,
    });
  };

  return (
    <div className="my-2 flex items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
      <input
        id={`chat-input-binance-${orderId}`}
        name={`chat-input-binance-${orderId}`}
        type="text"
        placeholder="Digite sua mensagem..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isPending && message.trim()) {
            e.preventDefault();
            handleSend();
          }
        }}
        className="flex-1 rounded border-0 px-2 text-12 focus:outline-none"
      />

      <button
        className="rounded-6 bg-blue-500 px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed"
        onClick={() => imageInputRef.current?.click()}
        disabled={isPending}
        title="Enviar imagem"
      >
        <ImageSquare size={22} weight="duotone" />
      </button>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          handleFileSend(file);
        }}
      />

      <button
        className="rounded-6 bg-primary px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed"
        onClick={handleSend}
        disabled={isPending || !message.trim()}
      >
        {isPending ? (
          "Enviando..."
        ) : (
          <ArrowCircleRight color="white" weight="duotone" width={24} height={24} />
        )}
      </button>
    </div>
  );
};
