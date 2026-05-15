import { useEffect, useMemo, useRef, useState } from "react";
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
type DocumentType = "CPF" | "CNPJ" | "";

export type PixToolInitialValues = {
  pixKey?: string;
  fullName?: string;
  documentNumber?: string;
  amount?: string | number;
  orderId?: string | number;
  description?: string;
};

type PixToolModalProps = {
  onClose: () => void;
  initialValues?: PixToolInitialValues | null;
};

const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

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
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(
    8,
    12,
  )}-${digits.slice(12, 14)}`;
};

const formatDocument = (value: string) => {
  const digits = onlyDigits(value);

  if (digits.length > 11) {
    return formatCnpj(digits);
  }

  return formatCpf(digits);
};

const resolveDocumentType = (value: unknown): DocumentType => {
  const digits = onlyDigits(value);

  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";

  return "";
};

const maskMiddleSixDigits = (value: unknown) => {
  const digits = onlyDigits(value);

  if (!digits) return "";

  if (digits.length <= 6) {
    return "*".repeat(digits.length);
  }

  const firstVisible = Math.min(3, digits.length);
  const maskSize = Math.min(6, Math.max(0, digits.length - firstVisible));
  const start = digits.slice(0, firstVisible);
  const end = digits.slice(firstVisible + maskSize);

  return `${start}${"*".repeat(maskSize)}${end}`;
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

const mapPixTypeForGowd = (type: PixKeyType): "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM" => {
  if (type === "RANDOM") return "RANDOM";

  return type;
};

const buildPixPayoutDescription = (params: {
  orderId?: string | number;
  fullName: string;
  documentNumber: string;
  pixKeyType: PixKeyType;
  pixKey: string;
}) => {
  const orderId = String(params.orderId ?? "").trim();
  const fullName = String(params.fullName ?? "").trim() || "nome completo";
  const documentType = resolveDocumentType(params.documentNumber) || "tipo do documento";
  const maskedDocument = maskMiddleSixDigits(params.documentNumber) || "documento";
  const pixKeyType = params.pixKeyType || "tipo da chave";
  const pixKey = String(params.pixKey ?? "").trim() || "chave pix";

  const orderPart = orderId ? ` da ordem '${orderId}'` : "";

  return `Será feito o pagamento${orderPart} para '${fullName}' de '${documentType}': '${maskedDocument}' para chave pix '${pixKeyType}': '${pixKey}'`;
};

const formatInitialAmount = (value: unknown) => {
  const raw = String(value ?? "").trim();

  if (!raw) return "";

  if (raw.includes(",")) return raw;

  if (/^\d+(\.\d{1,2})?$/.test(raw)) {
    return raw.replace(".", ",");
  }

  return raw;
};

export const PixToolModal = ({ onClose, initialValues }: PixToolModalProps) => {
  const { mutate: pixOut, isPending: outPending, data: outData } = useGowdPixOut();

  const identifierRef = useRef(`pixout-${Date.now()}`);

  const initialPixKey = String(initialValues?.pixKey ?? "");
  const initialPixKeyType = detectPixKeyType(initialPixKey);

  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyTypeSelectable>("AUTO");
  const [key, setKey] = useState(() => formatPixInputValue(initialPixKey, initialPixKeyType));
  const [fullName, setFullName] = useState(() => String(initialValues?.fullName ?? ""));
  const [documentNumber, setDocumentNumber] = useState(() =>
    formatDocument(String(initialValues?.documentNumber ?? "")),
  );
  const [amount, setAmount] = useState(() => formatInitialAmount(initialValues?.amount));
  const [description, setDescription] = useState(() => String(initialValues?.description ?? ""));

  const detectedType = useMemo(() => detectPixKeyType(key), [key]);

  const effectiveKeyType: PixKeyType = selectedKeyType === "AUTO" ? detectedType : selectedKeyType;

  const normalized = useMemo(
    () => normalizePixKeyForBackend(key, effectiveKeyType),
    [key, effectiveKeyType],
  );

  const detectedDocumentType = useMemo<DocumentType>(() => {
    return resolveDocumentType(documentNumber);
  }, [documentNumber]);

  const autoDescription = useMemo(() => {
    return buildPixPayoutDescription({
      orderId: initialValues?.orderId,
      fullName,
      documentNumber,
      pixKeyType: mapPixTypeForGowd(normalized.pixKeyType),
      pixKey: String(normalized.pixKey ?? ""),
    });
  }, [initialValues?.orderId, fullName, documentNumber, normalized.pixKeyType, normalized.pixKey]);

  useEffect(() => {
    setDescription(autoDescription);
  }, [autoDescription]);

  useEffect(() => {
    const pixKey = String(initialValues?.pixKey ?? "");
    const pixKeyType = detectPixKeyType(pixKey);

    setSelectedKeyType("AUTO");
    setKey(formatPixInputValue(pixKey, pixKeyType));
    setFullName(String(initialValues?.fullName ?? ""));
    setDocumentNumber(formatDocument(String(initialValues?.documentNumber ?? "")));
    setAmount(formatInitialAmount(initialValues?.amount));
  }, [initialValues]);

  const canSend =
    !!String(normalized.pixKey ?? "").trim() &&
    !!String(fullName ?? "").trim() &&
    !!String(documentNumber ?? "").trim() &&
    !!amount.trim();

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
    setDocumentNumber(formatDocument(value));
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

    const documentDigits = onlyDigits(documentNumber);
    const documentType = resolveDocumentType(documentDigits);

    if (!documentDigits) {
      toast.error("Informe o documento.");
      return;
    }

    if (!documentType) {
      toast.error("Documento inválido. Informe CPF com 11 dígitos ou CNPJ com 14 dígitos.");
      return;
    }

    if (!amount.trim()) {
      toast.error("Informe o valor.");
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
            type: documentType as "CPF" | "CNPJ",
            number: documentDigits,
          },
        },
        bank: {
          pix: {
            type: mapPixTypeForGowd(normalized.pixKeyType),
            key: String(normalized.pixKey ?? "").trim(),
          },
        },
        description: description.trim() || autoDescription,
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
            {KEY_TYPES_WITH_AUTO.map((type) => (
              <option key={type} value={type}>
                {type === "AUTO" ? `AUTO (${detectedType})` : type}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end text-xs text-gray-500">
          Chave identificada:
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
          Documento
          <input
            value={documentNumber}
            onChange={(e) => handleDocumentChange(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            placeholder="CPF ou CNPJ"
            disabled={outPending}
          />
        </label>

        <div className="flex items-end text-xs text-gray-500">
          Documento identificado:
          <strong className="ml-1">{detectedDocumentType || "aguardando CPF/CNPJ"}</strong>
        </div>

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

        <label className="text-sm md:col-span-2">
          Descrição
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
            disabled={outPending}
          />
          <p className="mt-1 text-xs text-gray-500">
            A descrição é preenchida automaticamente. Se você alterar este campo por último, será
            enviada a descrição manual.
          </p>
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
