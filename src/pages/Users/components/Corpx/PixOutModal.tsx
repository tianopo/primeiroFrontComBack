import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { useCorpxPixOut } from "../../hooks/Corpx/useCorpxPixOut";
import { PixKeyType } from "../../utils/Interface";
import { PixOutResponse } from "./PixOutResponse";

const KEY_TYPES: PixKeyType[] = ["CPF", "CNPJ", "EMAIL", "PHONE", "EVP"];

export const PixOutModal = ({ accountId, onClose }: { accountId: string; onClose: () => void }) => {
  const { mutate: pixOut, isPending, data } = useCorpxPixOut();

  const [amount, setAmount] = useState("100.00");
  const [keyType, setKeyType] = useState<PixKeyType>("CPF");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("Intermediação de ativos digitais");
  const [identifier, setIdentifier] = useState(`order-${Date.now()}`);
  console.log(accountId);
  const canSend = !!accountId && !!key && !!amount && Number(amount) > 0;

  const submit = () => {
    pixOut({
      idempotencyKey: identifier,
      body: {
        accountId,
        amount: Number(amount),
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
      <h3 className="text-xl font-semibold">Fazer PIX (Cash Out)</h3>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Valor (BRL)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Tipo de chave
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as PixKeyType)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
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
            placeholder="12345678901 / email / +5511... / uuid"
          />
        </label>

        <label className="text-sm md:col-span-2">
          Descrição (opcional)
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>

        <label className="text-sm md:col-span-2">
          Identifier (Idempotency-Key)
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={!canSend || isPending}>
          {isPending ? "Enviando..." : "Enviar"}
        </Button>
      </div>

      <div className="mt-3">
        <div className="font-semibold">Resposta</div>
        <PixOutResponse data={data} />
      </div>
    </Modal>
  );
};
