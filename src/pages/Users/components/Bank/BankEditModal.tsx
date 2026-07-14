import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { responseError } from "src/config/responseErrors";
import { Extrato } from "src/pages/Users/components/Gowd/Extrato/Extrato";
import { useGowdBaasCreatePixKey } from "../../hooks/Gowd/Baas/useGowdBaasCreatePixKey";
import { useGowdBaasDeletePixKey } from "../../hooks/Gowd/Baas/useGowdBaasDeletePixKey";
import { useGowdBaasGetAccount } from "../../hooks/Gowd/Baas/useGowdBaasGetAccount";
import { useGowdBaasListPixKeys } from "../../hooks/Gowd/Baas/useGowdBaasListPixKeys";
import { BankAccountCreateForm } from "./BankAccountCreateForm";

type BankEditTabKey = "account" | "statement" | "pixKeys";

interface IBankEditModal {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userDocument: string;
  userLabel?: string;
  initialAccountId?: string;
}

const onlyDigits = (value: string) => String(value ?? "").replace(/\D/g, "");

const getDocumentType = (document: string) => {
  const digits = onlyDigits(document);
  return digits.length > 11 ? "CNPJ" : "CPF";
};

export const BankEditModal = ({
  open,
  onClose,
  userId,
  userName,
  userDocument,
  userLabel,
  initialAccountId = "",
}: IBankEditModal) => {
  const [activeTab, setActiveTab] = useState<BankEditTabKey>("account");
  const [accountId, setAccountId] = useState(initialAccountId);
  const [accountDetails, setAccountDetails] = useState<any>(null);

  const [pixKeyType, setPixKeyType] = useState<"CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM">(
    "CPF",
  );
  const [pixKey, setPixKey] = useState("");

  const getAccount = useGowdBaasGetAccount();
  const createPixKey = useGowdBaasCreatePixKey();
  const deletePixKey = useGowdBaasDeletePixKey();

  const pixKeysQuery = useGowdBaasListPixKeys(accountId, {
    enabled: open && activeTab === "pixKeys" && Boolean(accountId),
  });

  useEffect(() => {
    if (!open) return;

    setActiveTab("account");
    setAccountId(initialAccountId ?? "");
    setAccountDetails(null);
    setPixKeyType(getDocumentType(userDocument) as "CPF" | "CNPJ");
    setPixKey(onlyDigits(userDocument));
  }, [open, initialAccountId, userDocument]);

  if (!open) return null;

  const tabBtnClass = (tab: BankEditTabKey) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      activeTab === tab
        ? "bg-black text-white"
        : "border border-gray-300 bg-white text-black hover:bg-gray-100"
    }`;

  const handleGetAccountDetails = async () => {
    if (!accountId.trim()) {
      responseError("Informe o accountId para consultar os detalhes da conta.");
      return;
    }

    const result = await getAccount.mutateAsync(accountId.trim());
    setAccountDetails(result);
  };

  const handleCreatePixKey = async () => {
    if (!accountId.trim()) {
      responseError("Informe o accountId antes de criar a chave Pix.");
      return;
    }

    if (!pixKey.trim()) {
      responseError("Informe a chave Pix.");
      return;
    }

    await createPixKey.mutateAsync({
      accountId: accountId.trim(),
      body: {
        type: pixKeyType,
        key: pixKey.trim(),
      },
    });

    setPixKey("");
    await pixKeysQuery.refetch();
  };

  const handleDeletePixKey = async (keyId: string) => {
    if (!accountId.trim()) {
      responseError("Informe o accountId antes de deletar a chave Pix.");
      return;
    }

    await deletePixKey.mutateAsync({
      accountId: accountId.trim(),
      keyId,
    });

    await pixKeysQuery.refetch();
  };

  const pixKeys = Array.isArray(pixKeysQuery.data)
    ? pixKeysQuery.data
    : Array.isArray((pixKeysQuery.data as any)?.items)
      ? (pixKeysQuery.data as any).items
      : Array.isArray((pixKeysQuery.data as any)?.data)
        ? (pixKeysQuery.data as any).data
        : [];

  return (
    <Modal onClose={onClose} title={`Bank BAAS${userLabel ? ` - ${userLabel}` : ""}`} fit>
      <div className="flex max-h-[80vh] w-full flex-col gap-4 overflow-y-auto">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="grid gap-2 md:grid-cols-3">
            <div>
              <div className="text-xs text-gray-500">Usuário</div>
              <div className="font-semibold">{userName || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Documento</div>
              <div className="font-semibold">{userDocument || "—"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">UserId</div>
              <div className="break-all font-semibold">{userId || "—"}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            className={tabBtnClass("account")}
            onClick={() => setActiveTab("account")}
          >
            Conta
          </button>

          <button
            type="button"
            className={tabBtnClass("statement")}
            onClick={() => setActiveTab("statement")}
          >
            Extrato
          </button>

          <button
            type="button"
            className={tabBtnClass("pixKeys")}
            onClick={() => setActiveTab("pixKeys")}
          >
            Chaves Pix
          </button>
        </div>

        {activeTab === "account" && (
          <div className="flex flex-col gap-4">
            <BankAccountCreateForm
              userId={userId}
              userName={userName}
              userDocument={userDocument}
              onCreated={(result) => {
                const nextAccountId = String(
                  (result as any)?.accountId ??
                    (result as any)?.accountRequestId ??
                    (result as any)?.id ??
                    "",
                );

                if (nextAccountId) {
                  setAccountId(nextAccountId);
                }

                setAccountDetails(result);
              }}
            />

            <section className="rounded-md border border-gray-200 p-4">
              <h4 className="mb-3 text-lg font-bold">Consultar detalhes da conta</h4>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="rounded-lg border px-3 py-2"
                  placeholder="Informe o accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />

                <Button onClick={handleGetAccountDetails} disabled={getAccount.isPending}>
                  {getAccount.isPending ? "Consultando..." : "Buscar detalhes"}
                </Button>
              </div>

              {accountDetails ? (
                <pre className="mt-4 max-h-[360px] overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-white">
                  {JSON.stringify(accountDetails, null, 2)}
                </pre>
              ) : null}
            </section>
          </div>
        )}

        {activeTab === "statement" && (
          <div className="flex flex-col gap-3">
            {!accountId ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Informe ou crie um accountId na aba Conta antes de consultar o extrato.
              </div>
            ) : (
              <Extrato
                scope="baas"
                accountId={accountId}
                title={`Extrato BAAS - ${userName || "Usuário"}`}
                companyLabel={`Conta BAAS: ${accountId}`}
                pixKeyLabel="Chave Pix da conta BAAS"
              />
            )}
          </div>
        )}

        {activeTab === "pixKeys" && (
          <div className="flex flex-col gap-4">
            {!accountId ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                Informe ou crie um accountId na aba Conta antes de gerenciar chaves Pix.
              </div>
            ) : (
              <>
                <section className="rounded-md border border-gray-200 p-4">
                  <h4 className="mb-3 text-lg font-bold">Criar chave Pix</h4>

                  <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                    <select
                      className="rounded-lg border px-3 py-2"
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value as any)}
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="EMAIL">EMAIL</option>
                      <option value="PHONE">PHONE</option>
                      <option value="RANDOM">RANDOM</option>
                    </select>

                    <input
                      className="rounded-lg border px-3 py-2"
                      placeholder="Chave Pix"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                    />

                    <Button onClick={handleCreatePixKey} disabled={createPixKey.isPending}>
                      {createPixKey.isPending ? "Criando..." : "Criar chave"}
                    </Button>
                  </div>
                </section>

                <section className="rounded-md border border-gray-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-lg font-bold">Chaves Pix cadastradas</h4>

                    <Button
                      onClick={() => pixKeysQuery.refetch()}
                      disabled={pixKeysQuery.isFetching}
                    >
                      {pixKeysQuery.isFetching ? "Atualizando..." : "Atualizar"}
                    </Button>
                  </div>

                  {pixKeysQuery.isLoading ? (
                    <div className="text-sm text-gray-500">Carregando chaves Pix...</div>
                  ) : pixKeys.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-500">
                      Nenhuma chave Pix encontrada.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {pixKeys.map((item: any, index: number) => {
                        const keyId = String(item?.id ?? item?.keyId ?? "");
                        const keyValue = String(item?.key ?? "");
                        const type = String(item?.type ?? item?.keyType ?? "");

                        return (
                          <div
                            key={`${keyId || keyValue}-${index}`}
                            className="grid gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-[160px_minmax(0,1fr)_auto]"
                          >
                            <div>
                              <div className="text-xs text-gray-500">Tipo</div>
                              <div className="font-semibold">{type || "—"}</div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500">Chave</div>
                              <div className="break-all font-semibold">{keyValue || "—"}</div>
                            </div>

                            <Button
                              type="button"
                              onClick={() => handleDeletePixKey(keyId)}
                              disabled={!keyId || deletePixKey.isPending}
                            >
                              Deletar
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
