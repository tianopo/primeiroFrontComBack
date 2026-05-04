import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { parseBRL } from "src/pages/Home/config/helpers";
import { useGowdPixOut } from "src/pages/Users/hooks/Gowd/useGowdPixOut";
import { PixKeyType } from "src/pages/Users/utils/Interface";
import { PixOutResponse } from "./PixOutResponse";

const KEY_TYPES: PixKeyType[] = ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"];
const KEY_TYPES_WITH_AUTO = ["AUTO", ...KEY_TYPES] as const;

type PixKeyTypeSelectable = PixKeyType | "AUTO";

const onlyDigits = (value: string) => String(value ?? "").replace(/\D/g, "");

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

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

  if (digits.length === 10 || digits.length === 11) return true;
  if (digits.length === 12 || digits.length === 13) return true;
  if (raw.startsWith("+")) return true;
  if (/[()\-\s]/.test(raw)) return true;

  return false;
};

const detectPixKeyType = (value: string): PixKeyType => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (!raw) return "RANDOM";
  if (raw.includes("@")) return "EMAIL";

  const dashCount = (raw.match(/-/g) ?? []).length;
  if (dashCount >= 3) return "RANDOM";

  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(raw)) return "CPF";
  if (/^\d{2}\.\d{3}\.\d{3}-\d{4}-\d{2}$/.test(raw)) return "CNPJ";

  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";

  if (looksLikePhone(raw)) return "PHONE";

  return "RANDOM";
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

  if (!digits.startsWith("55")) digits = `55${digits}`;
  return `+${digits}`;
};

const normalizePixKeyForBackend = (value: string, type: PixKeyType) => {
  const raw = String(value ?? "").trim();

  if (type === "CPF" || type === "CNPJ") {
    return { pixKeyType: type, pixKey: onlyDigits(raw) };
  }

  if (type === "PHONE") {
    return { pixKeyType: type, pixKey: normalizePhoneForBackend(raw) };
  }

  return { pixKeyType: type, pixKey: raw };
};

const mapPixTypeForGowd = (type: PixKeyType): "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM" => {
  if (type === "RANDOM") return "RANDOM";
  return type;
};

export const PixToolModal = ({ onClose }: { onClose: () => void }) => {
  const { mutate: pixOut, isPending: outPending, data: outData } = useGowdPixOut();

  const identifierRef = useRef(`pixout-${Date.now()}`);

  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyTypeSelectable>("AUTO");
  const [key, setKey] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [documentNumber, setDocumentNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Pix para chave");
  const [webhookUrl, setWebhookUrl] = useState("https://SEU-DOMINIO.com/api/gowd/webhooks/order");

  const detectedType = useMemo(() => detectPixKeyType(key), [key]);
  const effectiveKeyType: PixKeyType = selectedKeyType === "AUTO" ? detectedType : selectedKeyType;

  const normalized = useMemo(
    () => normalizePixKeyForBackend(key, effectiveKeyType),
    [key, effectiveKeyType],
  );

  const canSend =
    !!String(normalized.pixKey ?? "").trim() &&
    !!String(fullName ?? "").trim() &&
    !!String(documentNumber ?? "").trim() &&
    !!amount.trim() &&
    !!String(webhookUrl ?? "").trim();

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

  const handleDocumentChange = (value: string) => {
    const raw = String(value ?? "");
    if (documentType === "CPF") {
      setDocumentNumber(formatCpf(raw));
      return;
    }
    setDocumentNumber(formatCnpj(raw));
  };

  const submitOut = () => {
    if (!String(normalized.pixKey ?? "").trim()) {
      toast.error("Informe a chave PIX.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Informe o nome completo.");
      return;
    }

    if (!documentNumber.trim()) {
      toast.error("Informe o documento.");
      return;
    }

    if (!amount.trim()) {
      toast.error("Informe o valor.");
      return;
    }

    if (!webhookUrl.trim()) {
      toast.error("Informe o webhookUrl.");
      return;
    }

    const parsed = parseBRL(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Valor inválido.");
      return;
    }

    const identifier = identifierRef.current;

    pixOut({
      idempotencyKey: identifier,
      body: {
        amount: {
          currency: "BRL",
          value: parsed.toFixed(2),
        },
        paymentMethod: "PIX",
        customer: {
          fullName: fullName.trim(),
          document: {
            type: documentType,
            number: onlyDigits(documentNumber),
          },
        },
        bank: {
          pix: {
            type: mapPixTypeForGowd(normalized.pixKeyType),
            key: String(normalized.pixKey ?? "").trim(),
          },
        },
        description: description.trim() || "Pix para chave",
        webhookUrl: webhookUrl.trim(),
        code: identifier,
      },
    });
  };

  return (
    <Modal onClose={onClose} fit>
      <h3 className="text-xl font-semibold">Fazer PIX (GOWD)</h3>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Tipo da chave
          <select
            value={selectedKeyType}
            onChange={(e) => handleTypeChange(e.target.value as PixKeyTypeSelectable)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            disabled={outPending}
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
            placeholder="CPF / CNPJ / EMAIL / telefone / RANDOM"
            disabled={outPending}
          />
        </label>

        <label className="text-sm md:col-span-2">
          Nome completo
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="Nome do recebedor"
            disabled={outPending}
          />
        </label>

        <label className="text-sm">
          Tipo do documento
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as "CPF" | "CNPJ")}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            disabled={outPending}
          >
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
          </select>
        </label>

        <label className="text-sm">
          Documento
          <input
            value={documentNumber}
            onChange={(e) => handleDocumentChange(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder={documentType === "CPF" ? "000.000.000-00" : "00.000.000-0000-00"}
            disabled={outPending}
          />
        </label>

        <label className="text-sm">
          Valor (BRL)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="Ex: 500,00"
            disabled={outPending}
          />
        </label>

        <label className="text-sm">
          Descrição
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            disabled={outPending}
          />
        </label>

        <label className="text-sm md:col-span-2">
          Webhook URL
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="https://SEU-DOMINIO.com/api/gowd/webhooks/order"
            disabled={outPending}
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose} disabled={outPending}>
          Fechar
        </Button>

        <Button onClick={submitOut} disabled={!canSend || outPending}>
          {outPending ? "Enviando..." : "Enviar PIX"}
        </Button>
      </div>

      <div className="mt-4">
        <div className="font-semibold">Resposta PIX</div>
        <PixOutResponse data={outData} />
      </div>
    </Modal>
  );
};
