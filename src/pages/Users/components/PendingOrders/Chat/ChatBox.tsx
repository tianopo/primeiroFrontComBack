import { ArrowCircleRight, FilePdf, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useSendChatMessageBybit } from "../../../hooks/Bybit/useSendChatMessageBybit";
import { KeyType } from "../../PendingOrders";

interface ChatBoxProps {
  orderId: string;
  keyType: KeyType;
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ChatBox = ({ orderId, keyType }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatMessage, isPending } = useSendChatMessageBybit();
  const { name } = useAccessControl();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const send = (
    payload: { message: string; contentType: "str" | "pic" | "pdf" },
    onSuccess?: () => void,
  ) => {
    sendChatMessage({ ...payload, orderId, keyType }, { onSuccess });
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    send({ message: `${name?.split(" ")[0] ?? ""}: ${text}`, contentType: "str" }, () =>
      setMessage(""),
    );
  };

  const handleFileSend = async (file?: File, contentType?: "pic" | "pdf") => {
    if (!file || !contentType) return;
    send({ message: await fileToBase64(file), contentType });
  };

  return (
    <div className="my-2 flex w-full items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
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
        className="w-full flex-1 rounded border-0 px-2 text-12 focus:outline-none"
      />

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
        onChange={(e) => handleFileSend(e.target.files?.[0], "pic")}
      />

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
        onChange={(e) => handleFileSend(e.target.files?.[0], "pdf")}
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
