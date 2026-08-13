import { useState } from "react";
import { ModalMedia } from "src/components/Other/Modal/ModalMedia";

interface OrderMessagesProps {
  messages: any[];
}

const BYBIT_HOSTS = ["https://api.bybit.com", "https://api.bytick.com"];

const CRYPTOTECH_ALIASES = [
  "crypto tech dev",
  "crypto tech dv",
  "cryptotech",
  "cryptotech dev e trading ltda",
  "cryptotech desenvolvimento e trading ltda",
];

const buildMediaUrl = (pathOrUrl: string, hostIndex = 0) => {
  const value = String(pathOrUrl ?? "").trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;

  const host = BYBIT_HOSTS[Math.min(hostIndex, BYBIT_HOSTS.length - 1)];

  return `${host}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getMessageText = (msg: any) => {
  return String(msg?.mensagem ?? msg?.message ?? msg?.content ?? "");
};

const getFileName = (msg: any) => {
  return String(msg?.arquivo ?? msg?.fileName ?? "").trim();
};

const getSender = (msg: any) => {
  return String(msg?.apelido ?? msg?.fromNickName ?? msg?.nickName ?? "").toLowerCase();
};

const getType = (msg: any) => {
  return String(msg?.tipo ?? msg?.type ?? msg?.contentType ?? "").toLowerCase();
};

const isImageMessage = (msg: any) => {
  const type = getType(msg);

  return (
    type === "image" ||
    type === "pic" ||
    type === "2" ||
    Boolean(msg?.imageUrl || msg?.thumbnailUrl || msg?.arquivo)
  );
};

const isPdfMessage = (msg: any) => {
  const type = getType(msg);
  const file = getFileName(msg).toLowerCase();

  return type === "pdf" || type === "4" || file.endsWith(".pdf");
};

const getMediaRaw = (msg: any) => {
  return String(
    msg?.imageUrl ||
      msg?.thumbnailUrl ||
      msg?.url ||
      msg?.fileUrl ||
      msg?.arquivo ||
      msg?.mensagem ||
      msg?.message ||
      msg?.content ||
      "",
  ).trim();
};

export const OrderMessages = ({ messages }: OrderMessagesProps) => {
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewHostIdx, setPreviewHostIdx] = useState(0);
  const [previewTitle, setPreviewTitle] = useState("MÍDIA");

  if (!messages?.length) return null;

  const modalSrc = previewSrc ? buildMediaUrl(previewSrc, previewHostIdx) : "";

  const openPreview = (src: string, title: string) => {
    setPreviewSrc(src);
    setPreviewHostIdx(0);
    setPreviewTitle(title);
  };

  return (
    <>
      <ModalMedia
        open={Boolean(previewSrc)}
        src={modalSrc}
        title={previewTitle}
        onClose={() => {
          setPreviewSrc("");
          setPreviewHostIdx(0);
          setPreviewTitle("MÍDIA");
        }}
      />

      <div className="mt-2 max-h-48 max-w-[400px] overflow-y-auto overflow-x-hidden rounded-md border bg-gray-50 p-2">
        <p className="mb-1 text-sm font-semibold">Mensagens:</p>

        <div className="flex flex-col gap-1">
          {messages.map((msg, i) => {
            const sender = getSender(msg);
            const type = getType(msg);
            const text = getMessageText(msg);
            const fileName = getFileName(msg);
            const rawMedia = getMediaRaw(msg);

            const isFromCryptotech = CRYPTOTECH_ALIASES.includes(sender);
            const isImage = isImageMessage(msg);
            const isPdf = isPdfMessage(msg);

            const isRead =
              String(msg?.status ?? "").toLowerCase() === "unread" ||
              Number(msg?.read ?? msg?.lido ?? msg?.isRead ?? 0) === 1;

            const readCls = isRead ? "font-bold" : "font-normal";

            return (
              <div
                key={`${msg?.id ?? msg?.uuid ?? msg?.createTime ?? i}-${i}`}
                className={`rounded p-2 text-sm shadow-inner ${
                  isFromCryptotech ? "bg-gray-100" : "bg-red-100"
                }`}
              >
                {isImage && rawMedia ? (
                  <button
                    type="button"
                    className="group flex w-full flex-col items-start gap-2 text-left"
                    onClick={() => openPreview(rawMedia, "IMAGEM")}
                    title="Clique para ampliar"
                  >
                    <img
                      src={buildMediaUrl(rawMedia, 0)}
                      alt={fileName || `Imagem ${i + 1}`}
                      className="h-12 w-28 rounded-md border object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (/^https?:\/\//i.test(rawMedia)) return;
                        e.currentTarget.src = buildMediaUrl(rawMedia, 1);
                      }}
                    />

                    <span className={`text-xs text-gray-600 group-hover:underline ${readCls}`}>
                      {fileName || "Clique para ampliar"}
                    </span>
                  </button>
                ) : isPdf && rawMedia ? (
                  <button
                    type="button"
                    className={`flex w-full flex-col items-start rounded-6 border border-gray-200 bg-white px-2 py-1 text-left hover:bg-gray-100 ${readCls}`}
                    onClick={() => openPreview(rawMedia, "PDF")}
                    title="Clique para abrir PDF"
                  >
                    <span className="text-xs font-semibold text-gray-600">PDF</span>
                    <span className="break-words text-sm text-gray-900">
                      {fileName || "Abrir PDF"}
                    </span>
                  </button>
                ) : (
                  <p className={`whitespace-pre-wrap break-words ${readCls}`}>
                    {text || fileName || "-"}
                  </p>
                )}

                {type === "SYS_ORDER_CARD" && (
                  <span className="mt-1 block text-[10px] text-gray-500">Sistema</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
