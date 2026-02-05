import { useState } from "react";
import { ModalMedia } from "src/components/Other/Modal/ModalMedia";

interface OrderMessagesProps {
  messages: any[];
}

const HOSTS = ["https://api.bybit.com", "https://api.bytick.com"];

const buildBybitMediaUrl = (pathOrUrl: string, hostIndex = 0) => {
  const u = String(pathOrUrl ?? "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const host = HOSTS[Math.min(hostIndex, HOSTS.length - 1)];
  return `${host}${u.startsWith("/") ? "" : "/"}${u}`;
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
  const modalSrc = hasPreview ? buildBybitMediaUrl(previewSrc, previewHostIdx) : "";

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
            const sender = (msg?.fromNickName || msg?.nickName || "")?.toLowerCase();
            const isFromCryptotech = cryptotechAliases.includes(sender);

            const isPic = msg?.contentType === "pic";
            const raw = msg?.message;

            // ✅ quando read/isRead == 1 => negrito
            const isRead = Number(msg?.read ?? msg?.isRead ?? 0) === 1;
            const readCls = isRead ? "font-bold" : "font-normal";

            const imgSrc = isPic ? buildBybitMediaUrl(raw, 0) : "";

            return (
              <div
                key={i}
                className={`rounded p-2 text-sm shadow-inner ${
                  isFromCryptotech ? "bg-gray-100" : "bg-red-100"
                }`}
              >
                {isPic ? (
                  <button
                    type="button"
                    className="group flex h-16 w-full flex-col items-start gap-2 text-left"
                    onClick={() => {
                      setPreviewSrc(raw);
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
                        const next = buildBybitMediaUrl(raw, 1);
                        (e.currentTarget as HTMLImageElement).src = next;
                      }}
                    />
                    <span className={`text-xs text-gray-600 group-hover:underline ${readCls}`}>
                      Clique para ampliar
                    </span>
                  </button>
                ) : (
                  <p className={`whitespace-pre-wrap ${readCls}`}>{msg?.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
