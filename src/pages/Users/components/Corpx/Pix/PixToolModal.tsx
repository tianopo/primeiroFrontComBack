import { useMemo, useState } from "react";
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
const KEY_TYPES_WITH_AUTO = ["AUTO", ...KEY_TYPES] as const;

type PixKeyTypeSelectable = PixKeyType | "AUTO";

const onlyDigits = (value: string) => String(value ?? "").replace(/\D/g, "");

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

const looksLikePhone = (value: string) => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (!digits) return false;
  if (raw.includes("@")) return false;

  if (digits.length === 10 || digits.length === 11) return true; // sem +55
  if (digits.length === 12 || digits.length === 13) return true; // com 55
  if (raw.startsWith("+")) return true;
  if (/[()\-\s]/.test(raw)) return true;

  return false;
};

const detectPixKeyType = (value: string): PixKeyType => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (!raw) return "EVP";
  if (raw.includes("@")) return "EMAIL";

  // ✅ EVP: se tiver 3 ou mais traços "-"
  const dashCount = (raw.match(/-/g) ?? []).length;
  if (dashCount >= 3) return "EVP";

  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(raw)) return "CPF";
  if (/^\d{2}\.\d{3}\.\d{3}-\d{4}-\d{2}$/.test(raw)) return "CNPJ";

  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";

  if (looksLikePhone(raw)) return "PHONE";

  return "EVP";
};

const formatPixInputValue = (value: string, type: PixKeyType) => {
  const raw = String(value ?? "");

  if (type === "CPF") return formatCpf(raw);
  if (type === "CNPJ") return formatCnpj(raw);

  return raw;
};

const normalizePhoneForBackend = (value: string) => {
  let digits = onlyDigits(value);

  if (!digits) return "";

  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }

  return `+${digits}`;
};

const normalizePixKeyForBackend = (value: string, type: PixKeyType) => {
  const raw = String(value ?? "").trim();

  if (type === "CPF" || type === "CNPJ") {
    return {
      pixKeyType: type,
      pixKey: onlyDigits(raw),
    };
  }

  if (type === "PHONE") {
    return {
      pixKeyType: type,
      pixKey: normalizePhoneForBackend(raw),
    };
  }

  return {
    pixKeyType: type,
    pixKey: raw,
  };
};

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
  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyTypeSelectable>("AUTO");
  const [key, setKey] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Intermediação de ativos digitais");
  const [identifier, setIdentifier] = useState(`order-${Date.now()}`);

  const detectedType = useMemo(() => detectPixKeyType(key), [key]);

  const effectiveKeyType: PixKeyType = selectedKeyType === "AUTO" ? detectedType : selectedKeyType;

  const normalized = useMemo(
    () => normalizePixKeyForBackend(key, effectiveKeyType),
    [key, effectiveKeyType],
  );

  const canLookup = !!key.trim();
  const canSend = !!accountId.trim() && !!key.trim() && !!amount.trim();

  const handlePixKeyChange = (value: string) => {
    const typeForFormatting =
      selectedKeyType === "AUTO" ? detectPixKeyType(value) : selectedKeyType;

    setKey(formatPixInputValue(value, typeForFormatting));
  };

  const handleTypeChange = (value: PixKeyTypeSelectable) => {
    setSelectedKeyType(value);

    const typeForFormatting = value === "AUTO" ? detectPixKeyType(key) : value;
    setKey((prev) => formatPixInputValue(prev, typeForFormatting));
  };

  const submitLookup = () => {
    if (!canLookup) {
      toast.error("Informe a chave PIX.");
      return;
    }

    lookup({
      pixKey: normalized.pixKey,
      keyType: normalized.pixKeyType,
    });
  };

  const submitOut = () => {
    if (!canSend) {
      toast.error("Preencha accountId, chave e valor.");
      return;
    }

    const parsed = parseBRL(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Valor inválido.");
      return;
    }

    pixOut({
      idempotencyKey: identifier,
      body: {
        accountId,
        amount: parsed,
        currency: "BRL",
        keyType: normalized.pixKeyType,
        key: normalized.pixKey,
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
          className={`rounded-6 px-4 py-2 ${
            view === "lookup" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          disabled={lookupPending || outPending}
        >
          Consultar chave
        </Button>

        <Button
          onClick={() => setView("out")}
          className={`rounded-6 px-4 py-2 ${
            view === "out" ? "bg-primary text-white" : "bg-gray-200"
          }`}
          disabled={lookupPending || outPending}
        >
          Enviar PIX
        </Button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Tipo de chave
          <select
            value={selectedKeyType}
            onChange={(e) => handleTypeChange(e.target.value as PixKeyTypeSelectable)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            disabled={lookupPending || outPending}
          >
            {KEY_TYPES_WITH_AUTO.map((t) => (
              <option key={t} value={t}>
                {t === "AUTO" ? `AUTO (${detectedType})` : t}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end text-xs text-gray-500">
          Identificado automaticamente:
          <strong className="ml-1">{detectedType}</strong>
          {selectedKeyType !== "AUTO" && (
            <>
              <span className="mx-1">•</span>
              <span>
                usando manualmente: <strong>{selectedKeyType}</strong>
              </span>
            </>
          )}
        </div>

        <label className="text-sm md:col-span-2">
          Chave PIX
          <input
            value={key}
            onChange={(e) => handlePixKeyChange(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="CPF / CNPJ / EMAIL / telefone / EVP"
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
