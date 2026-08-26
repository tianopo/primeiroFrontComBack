import { ArrowCircleRight, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { useSendChatMessageGate } from "src/pages/Users/hooks/Gate/useSendChatMessageGate";
import { useAccessControl } from "src/routes/context/AccessControl";

type GateKeyType = "empresa" | "pessoal";

type GateChatBoxProps = {
  orderId: string;
  keyType: GateKeyType;
};

export const GateChatBox = ({ orderId, keyType }: GateChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatGate, isPending } = useSendChatMessageGate();
  const { name } = useAccessControl();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = message.trim();

    if (!text || isPending) return;

    setMessage("");

    sendChatGate(
      {
        txid: orderId,
        keyType,
        message: `${name?.split(" ")[0] ?? ""}: ${text}`,
        type: "text",
      },
      {
        onError: () => setMessage(text),
      },
    );
  };

  const handleFileSend = async (file?: File) => {
    if (!file || isPending) return;

    sendChatGate({
      txid: orderId,
      keyType,
      file,
      type: "image",
    });
  };

  return (
    <div className="my-2 flex w-full items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
      <input
        id={`chat-input-gate-${keyType}-${orderId}`}
        name={`chat-input-gate-${keyType}-${orderId}`}
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
        accept="image/png,image/jpeg,image/jpg"
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
