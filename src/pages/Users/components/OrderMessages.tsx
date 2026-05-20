import { useState } from "react";
import { ModalMedia } from "src/components/Other/Modal/ModalMedia";

interface OrderMessagesProps {
  messages: any[];
}

const BYBIT_HOSTS = ["https://api.bybit.com", "https://api.bytick.com"];

const buildMediaUrl = (pathOrUrl: string, hostIndex = 0) => {
  const value = String(pathOrUrl ?? "").trim();

  if (!value) return "";

  // Binance já vem com URL completa
  if (/^https?:\/\//i.test(value)) return value;

  // Bybit costuma vir como path relativo
  const host = BYBIT_HOSTS[Math.min(hostIndex, BYBIT_HOSTS.length - 1)];

  return `${host}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getMessageText = (msg: any) => {
  return String(msg?.message ?? msg?.content ?? "");
};

const isImageMessage = (msg: any) => {
  const type = String(msg?.type ?? "").toLowerCase();
  const contentType = String(msg?.contentType ?? "").toLowerCase();

  return type === "image" || contentType === "pic" || Boolean(msg?.imageUrl);
};

const getImageRaw = (msg: any) => {
  return String(msg?.imageUrl || msg?.thumbnailUrl || msg?.message || msg?.content || "").trim();
};

export const OrderMessages = ({ messages }: OrderMessagesProps) => {
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [previewHostIdx, setPreviewHostIdx] = useState<number>(0);

  if (!messages || messages.length === 0) return null;

  const cryptotechAliases = [
    "crypto tech dev",
    "crypto tech dv",
    "cryptotech desenvolvimento e trading ltda",
  ];

  const hasPreview = !!previewSrc;
  const modalSrc = hasPreview ? buildMediaUrl(previewSrc, previewHostIdx) : "";

  return (
    <>
      <ModalMedia
        open={hasPreview}
        src={modalSrc}
        title="IMAGEM"
        onClose={() => {
          setPreviewSrc("");
          setPreviewHostIdx(0);
        }}
      />

      <div className="mt-2 max-h-48 max-w-[400px] overflow-y-auto overflow-x-hidden rounded-md border bg-gray-50 p-2">
        <p className="mb-1 text-sm font-semibold">Mensagens:</p>

        <div className="flex flex-col gap-1">
          {messages.map((msg: any, i: number) => {
            const sender = String(msg?.fromNickName || msg?.nickName || "").toLowerCase();

            const isFromCryptotech = cryptotechAliases.includes(sender);

            const isImage = isImageMessage(msg);
            const rawImage = getImageRaw(msg);
            const imgSrc = isImage ? buildMediaUrl(rawImage, 0) : "";

            const isRead =
              String(msg?.status ?? "").toLowerCase() === "unread" ||
              Number(msg?.read ?? msg?.isRead ?? 0) === 1;

            const readCls = isRead ? "font-bold" : "font-normal";

            return (
              <div
                key={`${msg?.id ?? msg?.uuid ?? msg?.createTime ?? i}-${i}`}
                className={`rounded p-2 text-sm shadow-inner ${
                  isFromCryptotech ? "bg-gray-100" : "bg-red-100"
                }`}
              >
                {isImage && rawImage ? (
                  <button
                    type="button"
                    className="group flex w-full flex-col items-start gap-2 text-left"
                    onClick={() => {
                      setPreviewSrc(rawImage);
                      setPreviewHostIdx(0);
                    }}
                    title="Clique para ampliar"
                  >
                    <img
                      src={imgSrc}
                      alt={`Imagem ${i + 1}`}
                      className="h-12 w-28 rounded-md border object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // fallback apenas para Bybit path relativo
                        if (/^https?:\/\//i.test(rawImage)) return;

                        const next = buildMediaUrl(rawImage, 1);
                        e.currentTarget.src = next;
                      }}
                    />

                    <span className={`text-xs text-gray-600 group-hover:underline ${readCls}`}>
                      Clique para ampliar
                    </span>
                  </button>
                ) : (
                  <p className={`whitespace-pre-wrap ${readCls}`}>{getMessageText(msg) || "-"}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
