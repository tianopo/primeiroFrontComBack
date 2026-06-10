import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { parseBRL } from "src/pages/Home/config/helpers";
import { useGowdPixDictCheck } from "src/pages/Users/hooks/Gowd/useGowdPixDictCheck";
import { useGowdPixOut } from "src/pages/Users/hooks/Gowd/useGowdPixOut";
import { PixKeyType } from "src/pages/Users/utils/Interface";
import { useAccessControl } from "src/routes/context/AccessControl";
import { PixOutResponse } from "./PixOutResponse";

const KEY_TYPES: PixKeyType[] = ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"];
const KEY_TYPES_WITH_AUTO = ["AUTO", ...KEY_TYPES] as const;

type PixKeyTypeSelectable = PixKeyType | "AUTO";

export type PixToolInitialValues = {
  pixKey?: string;
  amount?: string | number;
  orderId?: string | number;
  description?: string;
};

type PixToolModalProps = {
  onClose: () => void;
  initialValues?: PixToolInitialValues | null;
};

const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");
const normalizeRole = (value: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

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
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 13);

  if (digits.startsWith("55")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 9) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
    }
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const isLikelyPhone = (value: string) => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (!digits || raw.includes("@")) return false;
  if (raw.startsWith("+")) return true;
  if (/[()\-\s]/.test(raw)) return true;

  if (digits.length === 11 && digits[2] === "9") return true;
  if (digits.length === 13 && digits.startsWith("55") && digits[4] === "9") return true;
  if (digits.length === 10 && ["6", "7", "8", "9"].includes(digits[2])) return true;
  if (digits.length === 12 && digits.startsWith("55") && ["6", "7", "8", "9"].includes(digits[4])) {
    return true;
  }

  return false;
};

const detectPixKeyType = (value: string): PixKeyType => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (!raw) return "RANDOM";
  if (raw.includes("@")) return "EMAIL";
  if ((raw.match(/-/g) ?? []).length >= 3) return "RANDOM";
  if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(raw) || digits.length === 14) return "CNPJ";
  if (isLikelyPhone(raw)) return "PHONE";
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(raw) || digits.length === 11) return "CPF";
  return "RANDOM";
};

const formatPixInputValue = (value: string, type: PixKeyType) => {
  if (type === "CPF") return formatCpf(value);
  if (type === "CNPJ") return formatCnpj(value);
  if (type === "PHONE") return formatPhone(value);
  return String(value ?? "");
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

const formatInitialAmount = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.includes(",")) return raw;
  if (/^\d+(\.\d{1,2})?$/.test(raw)) return raw.replace(".", ",");
  return raw;
};

const maskDocumentMiddle = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits) return "";
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 3)}${"*".repeat(Math.max(0, digits.length - 5))}${digits.slice(-2)}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
};

const buildDescription = (params: {
  orderId?: string | number;
  name?: string;
  documentType?: string;
  documentNumber?: string;
  pixKeyType: string;
  pixKey: string;
}) => {
  const orderId = String(params.orderId ?? "").trim();
  const orderPart = orderId ? ` da ordem '${orderId}'` : "";
  const name = params.name?.trim() || "titular";
  const documentType = params.documentType || "documento";
  const documentNumber = maskDocumentMiddle(params.documentNumber ?? "") || "não informado";
  const pixKeyType = params.pixKeyType || "chave";
  const pixKey = params.pixKey || "não informada";

  return `Será feito o pagamento${orderPart} para '${name}' de '${documentType}': '${documentNumber}' para chave pix '${pixKeyType}': '${pixKey}'`;
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col gap-0.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    <span className="break-all text-sm text-gray-900">{value || "-"}</span>
  </div>
);

export const PixToolModal = ({ onClose, initialValues }: PixToolModalProps) => {
  const { acesso } = useAccessControl();
  const role = normalizeRole(acesso);
  const isMaster = role === "master";
  const canUseDict = isMaster || role === "bank";

  const { mutate: pixOut, isPending: outPending, data: outData } = useGowdPixOut();
  const {
    mutateAsync: checkPixKey,
    data: dictData,
    isPending: dictPending,
    reset: resetDict,
  } = useGowdPixDictCheck();

  const identifierRef = useRef(`pixout-${Date.now()}`);
  const initialPixKey = String(initialValues?.pixKey ?? "");
  const initialPixKeyType = detectPixKeyType(initialPixKey);

  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyTypeSelectable>("AUTO");
  const [key, setKey] = useState(() => formatPixInputValue(initialPixKey, initialPixKeyType));
  const [amount, setAmount] = useState(() => formatInitialAmount(initialValues?.amount));
  const [description, setDescription] = useState(() => String(initialValues?.description ?? ""));
  const [dictError, setDictError] = useState("");

  const detectedType = useMemo(() => detectPixKeyType(key), [key]);
  const effectiveKeyType = selectedKeyType === "AUTO" ? detectedType : selectedKeyType;
  const normalized = useMemo(
    () => normalizePixKeyForBackend(key, effectiveKeyType),
    [key, effectiveKeyType],
  );

  useEffect(() => {
    setKey(formatPixInputValue(initialPixKey, initialPixKeyType));
  }, [initialPixKey, initialPixKeyType]);

  useEffect(() => {
    if (!canUseDict || !normalized.pixKey) {
      resetDict();
      setDictError("");
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setDictError("");
        await checkPixKey({ key: normalized.pixKey });
      } catch {
        setDictError("Não foi possível consultar a chave Pix.");
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [canUseDict, normalized.pixKey, checkPixKey, resetDict]);

  useEffect(() => {
    setDescription(
      buildDescription({
        orderId: initialValues?.orderId,
        name: dictData?.name,
        documentType: dictData?.document?.type,
        documentNumber: dictData?.document?.number,
        pixKeyType: dictData?.keyType ?? effectiveKeyType,
        pixKey: dictData?.key ?? normalized.pixKey,
      }),
    );
  }, [
    dictData?.document?.number,
    dictData?.document?.type,
    dictData?.key,
    dictData?.keyType,
    dictData?.name,
    effectiveKeyType,
    initialValues?.orderId,
    normalized.pixKey,
  ]);

  const handleSubmit = () => {
    if (!canUseDict) {
      toast.warning("A consulta Dict Pix está disponível apenas para Master e Bank.");
      return;
    }

    if (!dictData?.name || !dictData?.document?.number || !dictData?.document?.type) {
      toast.error("Consulte uma chave Pix válida antes de enviar.");
      return;
    }

    const amountValue = parseBRL(amount);
    if (!amountValue || amountValue <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    const documentType = dictData.document.type === "CNPJ" ? "CNPJ" : "CPF";

    pixOut({
      idempotencyKey: identifierRef.current,
      body: {
        amount: {
          currency: "BRL",
          value: amountValue.toFixed(2),
        },
        paymentMethod: "PIX",
        customer: {
          fullName: dictData.name,
          document: {
            type: documentType,
            number: dictData.document.number,
          },
        },
        bank: {
          pix: {
            type: normalized.pixKeyType,
            key: normalized.pixKey,
          },
        },
        description,
        code: identifierRef.current,
      },
    });
  };

  const masterFields = [
    { label: "Created at", value: formatDateTime(dictData?.createdAt) },
    { label: "Possed at", value: formatDateTime(dictData?.possedAt) },
    { label: "Key type", value: dictData?.keyType ?? "-" },
    { label: "Key", value: dictData?.key ?? "-" },
    { label: "Account type", value: dictData?.accountType ?? "-" },
    { label: "Branch", value: dictData?.branchNumber ?? "-" },
    { label: "Account", value: dictData?.accountNumber ?? "-" },
    { label: "Document type", value: dictData?.document?.type ?? "-" },
    { label: "Document number", value: dictData?.document?.number ?? "-" },
    { label: "ISPB", value: dictData?.ispb ?? "-" },
  ];

  return (
    <Modal onClose={onClose} title="Pix out" fit>
      <div className="flex w-full min-w-0 flex-col gap-4">
        <p className="text-sm text-gray-600">Pagamento via chave Pix com consulta automática.</p>

        {!canUseDict && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Disponível apenas para usuários Master e Bank.
          </div>
        )}

        <div className="flex w-full min-w-0 flex-col gap-3">
          <label className="flex w-full min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Tipo da chave</span>
            <select
              value={selectedKeyType}
              onChange={(e) => setSelectedKeyType(e.target.value as PixKeyTypeSelectable)}
              className="w-full rounded-lg border px-3 py-2"
            >
              {KEY_TYPES_WITH_AUTO.map((item) => (
                <option key={item} value={item}>
                  {item === "AUTO" ? "AUTO" : item}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500">
              Detectado automaticamente: <strong>{detectedType}</strong>
            </span>
          </label>

          <label className="flex w-full min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Chave Pix</span>
            <input
              value={key}
              onChange={(e) => setKey(formatPixInputValue(e.target.value, effectiveKeyType))}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Digite a chave Pix"
            />
            <span className="text-xs text-gray-500">
              Telefones são detectados automaticamente quando o número seguir o padrão celular, como
              DDD + 9.
            </span>
          </label>

          <label className="flex w-full min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Valor</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="0,00"
            />
          </label>

          <label className="flex w-full min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Descrição</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[110px] w-full rounded-lg border px-3 py-2"
            />
          </label>
        </div>

        {canUseDict && (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900">Consulta Dict</h3>
              {dictPending && <span className="text-sm text-gray-500">Consultando...</span>}
            </div>

            {dictError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {dictError}
              </div>
            ) : !dictData ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                Digite uma chave Pix válida para consultar.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <InfoRow label="Nome" value={dictData.name} />
                <InfoRow label="Banco" value={dictData.bankName} />
                <InfoRow label="Documento" value={maskDocumentMiddle(dictData.document.number)} />

                {isMaster && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {masterFields.map((field) => (
                      <InfoRow key={field.label} label={field.label} value={field.value} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {outData ? (
          <PixOutResponse data={outData} />
        ) : (
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={outPending || dictPending || !canUseDict}>
              {outPending ? "Enviando..." : "Enviar Pix"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
