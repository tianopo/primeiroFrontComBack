import { CardContainer } from "src/components/Layout/CardContainer";
import { useAccessControl } from "src/routes/context/AccessControl";

export const BankTokenCard = () => {
  const { bankAccountId, bankBranchNumber, bankAccountNumber, bankPixKeys } = useAccessControl();

  if (!bankAccountId) {
    return null;
  }

  return (
    <CardContainer full>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Dados bancários</h3>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">AccountId</div>
            <div className="break-all font-medium">{bankAccountId}</div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">Agência</div>
            <div className="font-medium">{bankBranchNumber || "—"}</div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">Número da conta</div>
            <div className="font-medium">{bankAccountNumber || "—"}</div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="mb-2 text-sm text-gray-500">Chaves Pix</div>

          {bankPixKeys.length === 0 ? (
            <div className="text-sm text-gray-400">Nenhuma chave Pix cadastrada.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {bankPixKeys.map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  className="break-all rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  {item.key}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
