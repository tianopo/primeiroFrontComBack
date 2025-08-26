import { ArrowCircleRight } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useSendChatMessage } from "../hooks/useSendChatMessage";
import { KeyType } from "./PendingOrders";

interface ChatBoxProps {
  orderId: string;
  keyType: KeyType;
}

export const ChatBox = ({ orderId, keyType }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatMessage, isPending } = useSendChatMessage();

  const handleSend = () => {
    if (!message.trim()) return;

    sendChatMessage(
      { message, contentType: "str", orderId, keyType },
      { onSuccess: () => setMessage("") },
    );
  };

  return (
    <div className="my-2 flex gap-2 rounded-6 border-1 border-gray-300">
      <input
        id={`chat-input-${orderId}`}
        name={`chat-input-${orderId}`}
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
        className="flex-1 rounded border-0 px-2 py-1 text-12 focus:border-0"
      />
      <button
        className={`rounded-6 bg-primary px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed`}
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
