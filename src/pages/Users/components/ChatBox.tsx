import { ArrowCircleRight, FilePdf, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useSendChatMessageBybit } from "../hooks/useSendChatMessageBybit";
import { KeyType } from "./PendingOrders";

interface ChatBoxProps {
  orderId: string;
  keyType: KeyType;
}

export const ChatBox = ({ orderId, keyType }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatMessage, isPending } = useSendChatMessageBybit();
  const { name } = useAccessControl();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;

    const firstName = name?.split(" ")[0];
    const formattedMessage = `${firstName}: ${message}`;

    sendChatMessage(
      { message: formattedMessage, contentType: "str", orderId, keyType },
      { onSuccess: () => setMessage("") },
    );
  };

  // converte arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSend = async (file: File, type: "pic" | "pdf") => {
    const base64 = await fileToBase64(file);

    sendChatMessage(
      { message: base64, contentType: type, orderId, keyType },
      { onSuccess: () => console.log(`${type} enviado com sucesso`) },
    );
  };

  return (
    <div className="my-2 flex items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
      {/* Input de texto */}
      <input
        id={`chat-input-${keyType}-${orderId}`}
        name={`chat-input-${keyType}-${orderId}`}
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

      {/* Botão para selecionar imagem */}
      <button
        className="rounded-6 bg-blue-500 px-2 py-1.5 text-white hover:opacity-80"
        onClick={() => imageInputRef.current?.click()}
        disabled={isPending}
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
          if (file) handleFileSend(file, "pic");
        }}
      />

      {/* Botão para selecionar PDF */}
      <button
        className="rounded-6 bg-red-500 px-2 py-1.5 text-white hover:opacity-80"
        onClick={() => pdfInputRef.current?.click()}
        disabled={isPending}
      >
        <FilePdf size={22} weight="duotone" />
      </button>
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSend(file, "pdf");
        }}
      />

      {/* Botão de enviar texto */}
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
