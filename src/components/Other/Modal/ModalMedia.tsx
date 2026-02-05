import { X } from "@phosphor-icons/react";
import { useEffect } from "react";

type ModalMediaProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  title?: string;
};

export const ModalMedia = ({ open, onClose, src, title }: ModalMediaProps) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        // clica no fundo fecha
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-white p-3 shadow-xl">
        <button
          type="button"
          className="absolute right-3 top-3 rounded-md p-2 hover:bg-gray-100"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {title && <div className="mb-2 pr-10 text-sm font-semibold">{title}</div>}

        <div className="flex max-h-[80vh] items-center justify-center overflow-auto rounded-xl bg-gray-50 p-2">
          {/* preview */}
          <img
            src={src}
            alt={title ?? "Imagem"}
            className="max-h-[78vh] w-auto max-w-full rounded-md"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>ESC para fechar</span>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-black px-3 py-2 text-white hover:opacity-90"
          >
            Abrir em nova aba
          </a>
        </div>
      </div>
    </div>
  );
};
