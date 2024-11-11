import { Button } from "../Buttons/Button";

interface IConfirmationDeleteProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDelete = ({ onConfirm, onCancel }: IConfirmationDeleteProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex h-1/3 w-3/4 flex-col justify-center gap-1 overflow-y-auto rounded-lg bg-white p-2 shadow-lg md:w-1/3">
        <div className="p-4">
          <h5 className="mb-4 text-center">Você tem certeza que deseja excluir este dado ?</h5>
          <div className="flex justify-center gap-4">
            <Button onClick={onCancel} className="rounded-6 bg-variation-error p-2 text-white">
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
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
