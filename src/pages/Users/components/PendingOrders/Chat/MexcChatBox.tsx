import { ArrowCircleRight, FilePdf, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { useSendChatMessageMexc } from "src/pages/Users/hooks/MEXC/useSendChatMessageMexc";
import { useAccessControl } from "src/routes/context/AccessControl";

type MexcKeyType = "empresa" | "pessoal";

type MexcChatBoxProps = {
  orderId: string;
  keyType: MexcKeyType;
};

export const MexcChatBox = ({ orderId, keyType }: MexcChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { mutate: sendChatMexc, isPending } = useSendChatMessageMexc();
  const { name } = useAccessControl();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const text = message.trim();

    if (!text || isPending) return;

    setMessage("");

    sendChatMexc(
      {
        orderNo: orderId,
        keyType,
        content: `${name?.split(" ")[0] ?? ""}: ${text}`,
        type: "text",
      },
      {
        onError: () => setMessage(text),
      },
    );
  };

  const handleFileSend = async (file?: File, type?: "image" | "file") => {
    if (!file || !type || isPending) return;

    sendChatMexc({
      orderNo: orderId,
      keyType,
      file,
      type,
      content: file.name,
    });
  };

  return (
    <div className="my-2 flex w-full items-center gap-2 rounded-6 border-1 border-gray-300 p-1">
      <input
        id={`chat-input-mexc-${keyType}-${orderId}`}
        name={`chat-input-mexc-${keyType}-${orderId}`}
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
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          handleFileSend(file, "image");
        }}
      />

      <button
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
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          handleFileSend(file, "file");
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
