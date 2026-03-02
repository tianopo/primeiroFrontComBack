import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { parseBRL } from "src/pages/Home/config/helpers";
import { useCorpxDictLookupPixKey } from "src/pages/Users/hooks/Corpx/useCorpxDictLookupPixKey";
import { useCorpxPixOut } from "src/pages/Users/hooks/Corpx/useCorpxPixOut";
import { PixKeyType } from "src/pages/Users/utils/Interface";
import { DictLookupResponseView } from "./DictLookupResponse";
import { PixOutResponse } from "./PixOutResponse";

const KEY_TYPES: PixKeyType[] = ["CPF", "CNPJ", "EMAIL", "PHONE", "EVP"];

export const PixToolModal = ({
  accountId: accountIdProp,
  onClose,
}: {
  accountId?: string;
  onClose: () => void;
}) => {
  const { mutate: lookup, isPending: lookupPending, data: lookupData } = useCorpxDictLookupPixKey();
  const { mutate: pixOut, isPending: outPending, data: outData } = useCorpxPixOut();

  const [view, setView] = useState<"lookup" | "out">("lookup");

  const [accountId, setAccountId] = useState(accountIdProp ?? "");
  const [keyType, setKeyType] = useState<PixKeyType>("CPF");
  const [key, setKey] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Intermediação de ativos digitais");
  const [identifier, setIdentifier] = useState(`order-${Date.now()}`);

  const canLookup = !!key?.trim();
  const canSend = !!accountId?.trim() && !!key?.trim() && !!amount?.trim();

  const submitLookup = () => {
    if (!canLookup) return toast.error("Informe a chave PIX.");
    lookup({ pixKey: key, keyType });
  };

  const submitOut = () => {
    if (!canSend) return toast.error("Preencha accountId, chave e valor.");

    const parsed = parseBRL(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return toast.error("Valor inválido.");
    }

    pixOut({
      idempotencyKey: identifier,
      body: {
        accountId,
        amount: parsed,
        currency: "BRL",
        keyType,
        key,
        description,
        identifier,
      },
    });
  };

  return (
    <Modal onClose={onClose} fit>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">PIX • Consulta DICT / Envio (Cash Out)</h3>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => setView("lookup")}
          className={`rounded-6 px-4 py-2 ${view === "lookup" ? "bg-primary text-white" : "bg-gray-200"}`}
          disabled={lookupPending || outPending}
        >
          Consultar chave
        </Button>
        <Button
          onClick={() => setView("out")}
          className={`rounded-6 px-4 py-2 ${view === "out" ? "bg-primary text-white" : "bg-gray-200"}`}
          disabled={lookupPending || outPending}
        >
          Enviar PIX
        </Button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Tipo de chave
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as PixKeyType)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            disabled={lookupPending || outPending}
          >
            {KEY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm md:col-span-2">
          Chave PIX
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="CPF / CNPJ / email / +55... / uuid"
            disabled={lookupPending || outPending}
          />
        </label>

        {view === "out" && (
          <>
            <label className="text-sm md:col-span-2">
              AccountId
              <input
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
                placeholder="accountId"
                disabled={lookupPending || outPending}
              />
            </label>

            <label className="text-sm">
              Valor (BRL)
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
                placeholder="Ex: 500,00"
                disabled={lookupPending || outPending}
              />
            </label>

            <label className="text-sm">
              Identifier (Idempotency-Key)
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
                disabled={lookupPending || outPending}
              />
            </label>

            <label className="text-sm md:col-span-2">
              Descrição (opcional)
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
                disabled={lookupPending || outPending}
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose} disabled={lookupPending || outPending}>
          Fechar
        </Button>

        {view === "lookup" ? (
          <Button onClick={submitLookup} disabled={!canLookup || lookupPending || outPending}>
            {lookupPending ? "Consultando..." : "Consultar"}
          </Button>
        ) : (
          <Button onClick={submitOut} disabled={!canSend || outPending || lookupPending}>
            {outPending ? "Enviando..." : "Enviar PIX"}
          </Button>
        )}
      </div>

      <div className="mt-4">
        <div className="font-semibold">Resposta</div>
        {view === "lookup" ? (
          <DictLookupResponseView data={lookupData} />
        ) : (
          <PixOutResponse data={outData} />
        )}
      </div>
    </Modal>
  );
};
