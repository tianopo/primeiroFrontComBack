import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Modal } from "src/components/Modal/Modal";
import { useChangePassword } from "../hooks/useChangePassword";

interface IModalPassword {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalPassword = ({ isOpen, onClose }: IModalPassword) => {
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPasswords, setShowNewPasswords] = useState(false);

  const { context, mutate, isPending } = useChangePassword();
  const {
    formState: { errors },
  } = context;

  if (!isOpen) return null;

  const onSubmit = (data: any) => {
    if (!novaSenha || !confirmarSenha) return;
    if (novaSenha !== confirmarSenha) return;
    mutate(data);
  };

  return (
    <Modal onClose={onClose} fit>
      <h2 className="mb-4 text-xl font-bold">Alterar senha</h2>
      <FormProvider {...context}>
        <FormX onSubmit={onSubmit} className="flex flex-col gap-3">
          {/* Campo Senha Antiga */}
          <InputX
            title="Senha Antiga"
            typ={showOldPassword ? "text" : "password"}
            placeholder="Senha Antiga"
            value={senhaAntiga}
            onChange={(e) => setSenhaAntiga(e.target.value)}
          />
          <label className="flex w-11/12 flex-row items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={showOldPassword}
              onChange={() => setShowOldPassword(!showOldPassword)}
              className="
                h-4
                w-4
                appearance-none
                rounded-6
                bg-primary
                outline-none
                checked:bg-slate-800
                focus:outline-none"
            />
            {showOldPassword ? "Ocultar" : "Mostrar"} Senha Antiga
          </label>

          {/* Campo Nova Senha */}
          <InputX
            title="Nova Senha"
            typ={showNewPasswords ? "text" : "password"}
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />

          {/* Campo Confirmar Senha */}
          <InputX
            title="Confirmar Senha"
            typ={showNewPasswords ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />

          {/* Checkbox para Nova Senha e Confirmar Senha */}
          <label className="flex w-11/12 flex-row items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={showNewPasswords}
              onChange={() => setShowNewPasswords(!showNewPasswords)}
              className="
                h-4
                w-4
                appearance-none
                rounded-6
                bg-primary
                outline-none
                checked:bg-slate-800
                focus:outline-none"
            />
            {showNewPasswords ? "Ocultar" : "Mostrar"} Nova Senha
          </label>

          {/* Botão de enviar */}
          <button
            disabled={
              senhaAntiga.length === 0 ||
              novaSenha.length === 0 ||
              confirmarSenha.length === 0 ||
              isPending ||
              Object.keys(errors).length > 0
            }
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Alterar Senha
          </button>
        </FormX>
      </FormProvider>
    </Modal>
  );
};
