import { Extrato } from "src/pages/Users/components/Gowd/Extrato/Extrato";
import { useAccessControl } from "src/routes/context/AccessControl";
import { BankTokenCard } from "./components/BankTokenCard";

export const Bank = () => {
  const { name, acesso, bankAccountId, bankBranchNumber, bankAccountNumber, bankPixKeys } =
    useAccessControl();

  return (
    <div className="flex flex-col gap-4">
      <BankTokenCard
        name={name}
        acesso={acesso}
        bankAccountId={bankAccountId || ""}
        bankBranchNumber={bankBranchNumber || ""}
        bankAccountNumber={bankAccountNumber || ""}
        bankPixKeys={bankPixKeys}
      />

      <Extrato
        scope="baas"
        accountId={bankAccountId || ""}
        title="Extrato da Conta GOWD"
        companyLabel={`${acesso === "Master" ? "CNPJ: 55.636.113/0001-70" : name}`}
        pixKeyLabel={`${acesso === "Master" ? "Chave Pix: ab512de6-aa7b-4750-8321-914416061baa" : ""}`}
      />
    </div>
  );
};
