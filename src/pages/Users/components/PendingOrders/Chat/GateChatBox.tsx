import { ArrowCircleRight, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { useSendChatMessageGate } from "src/pages/Users/hooks/Gate/useSendChatMessageGate";
import { useAccessControl } from "src/routes/context/AccessControl";

type GateKeyType = "empresa" | "pessoal";

type GateChatBoxProps = {
  orderId: string;
  keyType: GateKeyType;
};

const getOperatorPrefix = (name: unknown) => {
  const firstName = String(name ?? "")
    .trim()
    .split(/\s+/)[0];
  return firstName ? `${firstName}: ` : "";
};

export const GateChatBox = ({ orderId, keyType }: GateChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatGate, isPending } = useSendChatMessageGate();
  const { name } = useAccessControl();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sendLockedRef = useRef(false);

  const handleSend = () => {
    const text = message.trim();

    if (!text || isPending || sendLockedRef.current) return;

    sendLockedRef.current = true;
    setMessage("");

    sendChatGate(
      {
        txid: orderId,
        keyType,
        message: `${getOperatorPrefix(name)}${text}`,
        type: "text",
      },
      {
        onError: () => setMessage(text),
        onSettled: () => {
          sendLockedRef.current = false;
        },
      },
    );
  };

  const handleFileSend = (file?: File) => {
    if (!file || isPending || sendLockedRef.current) return;

    sendLockedRef.current = true;

    sendChatGate(
      {
        txid: orderId,
        keyType,
        file,
        type: "image",
      },
      {
        onSettled: () => {
          sendLockedRef.current = false;
        },
      },
    );
  };

  return (
    <div className="my-2 flex w-full items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
      <input
        id={`chat-input-gate-${keyType}-${orderId}`}
        name={`chat-input-gate-${keyType}-${orderId}`}
        type="text"
        placeholder="Digite sua mensagem..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !isPending && message.trim()) {
            event.preventDefault();
            handleSend();
          }
        }}
        className="w-full flex-1 rounded border-0 px-2 text-12 focus:outline-none"
      />

      <button
        type="button"
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
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          handleFileSend(file);
        }}
      />

      <button
        type="button"
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
