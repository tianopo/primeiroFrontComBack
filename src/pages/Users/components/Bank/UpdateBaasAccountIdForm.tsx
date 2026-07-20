import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { responseError } from "src/config/responseErrors";
import { useGowdBaasUpdateUserAccountId } from "../../hooks/Gowd/Baas/useGowdBaasUpdateUserAccountId";

type UpdateBaasAccountIdFormProps = {
  userId: string;
  userDocument: string;
  currentAccountId: string;
  onUpdated?: () => void | Promise<void>;
};

export const UpdateBaasAccountIdForm = ({
  userId,
  userDocument,
  currentAccountId,
  onUpdated,
}: UpdateBaasAccountIdFormProps) => {
  const updateAccountId = useGowdBaasUpdateUserAccountId();
  const [newAccountId, setNewAccountId] = useState("");

  const handleUpdate = async () => {
    if (!userId) {
      responseError("Usuário não informado.");
      return;
    }

    if (!newAccountId.trim()) {
      responseError("Informe o novo accountId ativo da Gowd.");
      return;
    }

    await updateAccountId.mutateAsync({
      userId,
      currentAccountId,
      newAccountId: newAccountId.trim(),
      documentNumber: userDocument,
      status: "ACTIVE",
    });

    await onUpdated?.();
  };

  return (
    <section className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
      <h4 className="mb-3 text-lg font-bold text-yellow-900">Atualizar accountId BAAS</h4>

      <p className="text-sm text-yellow-800">
        Existe uma conta BAAS salva no banco, mas a Gowd não encontrou esse ID. Informe o accountId
        real da conta ativa.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">AccountId salvo atualmente</label>
          <input
            className="rounded-lg border bg-gray-100 px-3 py-2"
            value={currentAccountId}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Novo accountId ativo</label>
          <input
            className="rounded-lg border bg-white px-3 py-2"
            placeholder="Cole o accountId real da Gowd"
            value={newAccountId}
            onChange={(event) => setNewAccountId(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={handleUpdate} disabled={updateAccountId.isPending}>
          {updateAccountId.isPending ? "Atualizando..." : "Atualizar accountId"}
        </Button>
      </div>
    </section>
  );
};
