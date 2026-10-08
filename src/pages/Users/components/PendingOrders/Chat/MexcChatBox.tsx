import { ArrowCircleRight, FilePdf, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { useSendChatMessageMexc } from "src/pages/Users/hooks/MEXC/useSendChatMessageMexc";
import { useAccessControl } from "src/routes/context/AccessControl";

type MexcKeyType = "empresa" | "pessoal";

type MexcChatBoxProps = {
  orderId: string;
  keyType: MexcKeyType;
};

const getOperatorPrefix = (name: unknown) => {
  const firstName = String(name ?? "")
    .trim()
    .split(/\s+/)[0];
  return firstName ? `${firstName}: ` : "";
};

export const MexcChatBox = ({ orderId, keyType }: MexcChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatMexc, isPending } = useSendChatMessageMexc();
  const { name } = useAccessControl();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sendLockedRef = useRef(false);

  const handleSend = () => {
    const text = message.trim();

    if (!text || isPending || sendLockedRef.current) return;

    sendLockedRef.current = true;
    setMessage("");

    sendChatMexc(
      {
        orderNo: orderId,
        keyType,
        content: `${getOperatorPrefix(name)}${text}`,
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

  const handleFileSend = (file: File | undefined, type: "image" | "file") => {
    if (!file || isPending || sendLockedRef.current) return;

    sendLockedRef.current = true;

    sendChatMexc(
      {
        orderNo: orderId,
        keyType,
        file,
        type,
        content: file.name,
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
        id={`chat-input-mexc-${keyType}-${orderId}`}
        name={`chat-input-mexc-${keyType}-${orderId}`}
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
          handleFileSend(file, "image");
        }}
      />

      <button
        type="button"
        className="rounded-6 bg-red-500 px-2 py-1.5 text-white hover:opacity-80 disabled:cursor-not-allowed"
        onClick={() => pdfInputRef.current?.click()}
        disabled={isPending}
        title="Enviar PDF"
      >
        <FilePdf size={22} weight="duotone" />
      </button>

      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          handleFileSend(file, "file");
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
