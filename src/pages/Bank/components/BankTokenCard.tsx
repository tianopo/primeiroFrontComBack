import { CardContainer } from "src/components/Layout/CardContainer";

type BankTokenCardProps = {
  name: string;
  acesso: string;
  bankAccountId: string;
  bankBranchNumber: string;
  bankAccountNumber: string;
  bankPixKeys: Array<{ key: string }>;
};

export const BankTokenCard = ({
  name,
  acesso,
  bankAccountId,
  bankBranchNumber,
  bankAccountNumber,
  bankPixKeys,
}: BankTokenCardProps) => {
  if (!bankAccountId) {
    return (
      <CardContainer full>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Dados bancários</h3>
          <p className="text-sm text-gray-500">Nenhuma conta BAAS encontrada para este usuário.</p>
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer full>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold">Dados bancários</h3>
          <p className="text-sm text-gray-500">Dados da conta BAAS do usuário logado.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">Usuário</div>
            <div className="break-all font-medium">{name || "—"}</div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">Role</div>
            <div className="font-medium">{acesso || "—"}</div>
          </div>
        </div>

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
