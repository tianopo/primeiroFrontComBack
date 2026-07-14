import { CardContainer } from "src/components/Layout/CardContainer";
import { Extrato } from "src/pages/Users/components/Gowd/Extrato/Extrato";
import { useAccessControl } from "src/routes/context/AccessControl";
import { BankTokenCard } from "./components/BankTokenCard";
import { useBankMe } from "../Users/hooks/Gowd/Baas/useBankMe";

export const Bank = () => {
  const { name, acesso, bankAccountId, bankBranchNumber, bankAccountNumber, bankPixKeys } =
    useAccessControl();

  const bankMe = useBankMe();

  const resolvedAccountId = bankMe.data?.accountId || bankAccountId;
  const resolvedBranchNumber = bankMe.data?.branchNumber || bankBranchNumber;
  const resolvedAccountNumber = bankMe.data?.accountNumber || bankAccountNumber;
  const resolvedPixKeys =
    bankMe.data?.pixKeys && bankMe.data.pixKeys.length > 0 ? bankMe.data.pixKeys : bankPixKeys;

  return (
    <div className="flex flex-col gap-4">
      <BankTokenCard
        name={bankMe.data?.name || name}
        acesso={bankMe.data?.role || acesso}
        bankAccountId={resolvedAccountId || ""}
        bankBranchNumber={resolvedBranchNumber || ""}
        bankAccountNumber={resolvedAccountNumber || ""}
        bankPixKeys={resolvedPixKeys}
      />

      <CardContainer full>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Conta BAAS</h3>

            {bankMe.isLoading ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                Carregando conta BAAS...
              </div>
            ) : !resolvedAccountId ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Nenhuma conta BAAS foi encontrada para este usuário.
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                Conta BAAS carregada: <strong>{resolvedAccountId}</strong>
                {bankMe.data?.source === "env" ? " — conta principal do .env" : ""}
              </div>
            )}
          </div>

          <Extrato
            scope="baas"
            accountId={resolvedAccountId || ""}
            title="Extrato da Conta BAAS"
            companyLabel={`Conta BAAS: ${resolvedAccountId || "não selecionada"}`}
            pixKeyLabel="Chave Pix da conta BAAS"
          />
        </div>
      </CardContainer>
    </div>
  );
};
