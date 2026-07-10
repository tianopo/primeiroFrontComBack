import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { Modal } from "src/components/Modal/Modal";
import { Extrato } from "src/pages/Users/components/Gowd/Extrato/Extrato";
import { useAccessControl } from "src/routes/context/AccessControl";
import { useGowdBaasCreateAccount } from "../Users/hooks/Gowd/Baas/useGowdBaasCreateAccount";
import { BankTokenCard } from "./components/BankTokenCard";

export const Bank = () => {
  const { name, acesso, bankAccountId, bankBranchNumber, bankAccountNumber, bankPixKeys } =
    useAccessControl();

  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <BankTokenCard
        name={name}
        acesso={acesso}
        bankAccountId={bankAccountId}
        bankBranchNumber={bankBranchNumber}
        bankAccountNumber={bankAccountNumber}
        bankPixKeys={bankPixKeys}
      />

      <CardContainer full>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Conta BAAS</h3>
            {!bankAccountId ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Nenhuma conta BAAS foi encontrada no token deste usuário. Após criar ou atualizar a
                conta, faça login novamente ou renove o token para carregar os dados bancários.
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                Conta BAAS carregada pelo token: <strong>{bankAccountId}</strong>
              </div>
            )}
          </div>

          <Extrato
            scope="baas"
            accountId={bankAccountId}
            title="Extrato da Conta BAAS"
            companyLabel={`Conta BAAS: ${bankAccountId || "não selecionada"}`}
            pixKeyLabel="Chave Pix da conta BAAS"
          />
        </div>
      </CardContainer>
    </div>
  );
};
