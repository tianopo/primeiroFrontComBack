import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { Modal } from "src/components/Modal/Modal";
import { Extrato } from "src/pages/Users/components/Gowd/Extrato/Extrato";
import { useGowdBaasCreateAccount } from "../Users/hooks/Gowd/Baas/useGowdBaasCreateAccount";
import { BankTokenCard } from "./components/BankTokenCard";

const defaultCreateAccountPayload = `{
  "name": "Novo Cliente",
  "document": {
    "type": "CPF",
    "number": "12345678901"
  },
  "email": "cliente@exemplo.com",
  "phone": "+5511999999999"
}`;

export const Bank = () => {
  const [accountId, setAccountId] = useState(
    () => localStorage.getItem("gowd-baas-accountId") ?? "",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [payloadText, setPayloadText] = useState(defaultCreateAccountPayload);

  const createAccount = useGowdBaasCreateAccount();

  const createNewAccount = async () => {
    const payload = JSON.parse(payloadText) as Record<string, unknown>;
    const result = await createAccount.mutateAsync(payload);

    const nextAccountId = String(
      (result as { id?: string; accountId?: string })?.accountId ??
        (result as { id?: string; accountId?: string })?.id ??
        "",
    );

    if (nextAccountId) {
      setAccountId(nextAccountId);
      localStorage.setItem("gowd-baas-accountId", nextAccountId);
    }

    setCreateOpen(false);
  };

  const saveAccountId = () => {
    localStorage.setItem("gowd-baas-accountId", accountId);
  };

  return (
    <div className="flex flex-col gap-4">
      <BankTokenCard />
      <CardContainer full>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">Conta BAAS</h3>
              <Button onClick={() => setCreateOpen(true)}>Criar conta</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Informe ou cole o accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
              <Button onClick={saveAccountId}>Salvar accountId</Button>
            </div>
          </div>

          <Extrato
            scope="baas"
            accountId={accountId}
            title="Extrato da Conta BAAS"
            companyLabel={`Conta BAAS: ${accountId || "não selecionada"}`}
            pixKeyLabel="Chave Pix da conta selecionada será consultada pelo Dict"
          />
        </div>
      </CardContainer>

      {createOpen ? (
        <Modal onClose={() => setCreateOpen(false)} title="Criar conta BAAS" fit>
          <div className="flex flex-col gap-3">
            <textarea
              className="min-h-[260px] rounded-lg border px-3 py-2 font-mono text-sm"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={createNewAccount} disabled={createAccount.isPending}>
                {createAccount.isPending ? "Criando..." : "Criar conta"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};
