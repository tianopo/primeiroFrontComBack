import { useState } from "react";
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
  const [copiedKey, setCopiedKey] = useState("");

  const isMaster =
    String(acesso ?? "")
      .trim()
      .toLowerCase() === "master";

  const handleCopyPixKey = async (key: string) => {
    if (!key) return;

    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);

      setTimeout(() => {
        setCopiedKey("");
      }, 1200);
    } catch {
      setCopiedKey("");
    }
  };

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
          <p className="text-sm text-gray-500">Dados da conta conectada a GOWD</p>
        </div>

        <div className={`grid gap-3 ${isMaster ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-500">Usuário</div>
            <div className="break-all font-medium">{name || "—"}</div>
          </div>

          {isMaster ? (
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-500">Role</div>
              <div className="font-medium">{acesso || "—"}</div>
            </div>
          ) : null}
        </div>

        <div className={`grid gap-3 ${isMaster ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {isMaster ? (
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-500">AccountId</div>
              <div className="break-all font-medium">{bankAccountId}</div>
            </div>
          ) : null}

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
              {bankPixKeys.map((item, index) => {
                const pixKey = String(item.key ?? "").trim();

                return (
                  <div
                    key={`${pixKey}-${index}`}
                    className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="break-all text-sm font-medium">{pixKey || "—"}</div>

                    {pixKey ? (
                      <button
                        type="button"
                        onClick={() => handleCopyPixKey(pixKey)}
                        className="w-fit rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        {copiedKey === pixKey ? "Copiada" : "Copiar chave"}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
