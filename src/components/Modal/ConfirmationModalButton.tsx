// ConfirmationModalButton.tsx
import { ReactNode } from "react";
import { Button } from "../Buttons/Button";

interface IConfirmationModalButtonProps {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;

  // ✅ NOVO
  showExtra?: boolean;
  extra?: ReactNode;
  confirmDisabled?: boolean;
}

export const ConfirmationModalButton = ({
  text,
  onConfirm,
  onCancel,
  showExtra,
  extra,
  confirmDisabled,
}: IConfirmationModalButtonProps) => {
  const hasExtra = Boolean(showExtra && extra);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={[
          "flex flex-col gap-2 overflow-y-auto rounded-lg bg-white p-2 shadow-lg",
          hasExtra ? "max-h-[85vh] w-11/12 md:w-2/3" : "h-1/3 w-3/4 md:w-1/3",
        ].join(" ")}
      >
        <div className="p-4">
          <h5 className="mb-3 text-center">{text}</h5>

          {/* ✅ aparece só quando o boolean ativar */}
          {hasExtra ? <div className="mb-4">{extra}</div> : null}

          <div className="flex justify-center gap-4">
            <Button onClick={onCancel} className="rounded-6 bg-variation-error p-2 text-white">
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="rounded-6 bg-variation-confirmation p-2 text-white"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
