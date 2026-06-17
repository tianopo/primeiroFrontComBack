import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { useGowdPixDictCheck } from "src/pages/Users/hooks/Gowd/useGowdPixDictCheck";
import { useGowdPixOut } from "src/pages/Users/hooks/Gowd/useGowdPixOut";
import { PixKeyType } from "src/pages/Users/utils/Interface";
import { useAccessControl } from "src/routes/context/AccessControl";
import { BRLAmountInput, brlInputToNumber, formatBRLInputValue } from "./BRLAmountInput";
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

const VALID_BRAZIL_DDDS = new Set([
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "21",
  "22",
  "24",
  "27",
  "28",
  "31",
  "32",
  "33",
  "34",
  "35",
  "37",
  "38",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "51",
  "53",
  "54",
  "55",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "71",
  "73",
  "74",
  "75",
  "77",
  "79",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
]);

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

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(
    8,
    12,
  )}-${digits.slice(12, 14)}`;
};

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 13);

  if (digits.startsWith("55")) {
    if (digits.length <= 2) return `+${digits}`;
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 9) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
    }

    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(
      9,
      13,
    )}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const isValidCpf = (value: unknown) => {
  const digits = onlyDigits(value);

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (base: string, factor: number) => {
    let total = 0;

    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }

    const rest = (total * 10) % 11;

    return rest === 10 ? 0 : rest;
  };

  const firstDigit = calcDigit(digits.slice(0, 9), 10);
  const secondDigit = calcDigit(digits.slice(0, 10), 11);

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
};

const isValidCnpj = (value: unknown) => {
  const digits = onlyDigits(value);

  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (base: string, factors: number[]) => {
    const total = base
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * factors[index], 0);

    const rest = total % 11;

    return rest < 2 ? 0 : 11 - rest;
  };

  const firstDigit = calcDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calcDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13]);
};

const stripBrazilCountryCode = (value: unknown) => {
  let digits = onlyDigits(value);

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return digits.slice(2);
  }

  return digits;
};

const hasStrongPhoneSignal = (value: string) => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (raw.startsWith("+")) return true;
  if (/^\+?55/.test(raw)) return true;
  if (/\(\d{2}\)/.test(raw)) return true;
  if (/^\d{2}\s?9\d{4}-?\d{4}$/.test(raw)) return true;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return true;

  return false;
};

const isValidBrazilPhone = (value: unknown) => {
  const national = stripBrazilCountryCode(value);

  if (national.length !== 11) return false;

  const ddd = national.slice(0, 2);
  const ninthDigit = national[2];

  if (!VALID_BRAZIL_DDDS.has(ddd)) return false;

  return ninthDigit === "9";
};

const detectPixKeyType = (value: string): PixKeyType => {
  const raw = String(value ?? "").trim();
  const digits = onlyDigits(raw);

  if (!raw) return "RANDOM";
  if (raw.includes("@")) return "EMAIL";

  const dashCount = (raw.match(/-/g) ?? []).length;
  if (dashCount >= 3) return "RANDOM";

  if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(raw)) return "CNPJ";
  if (digits.length === 14) return "CNPJ";

  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(raw) && isValidCpf(raw)) {
    return "CPF";
  }

  if (hasStrongPhoneSignal(raw) && isValidBrazilPhone(raw)) {
    return "PHONE";
  }

  if (digits.length === 11 && isValidCpf(digits)) {
    return "CPF";
  }

  if (digits.length === 11 && isValidBrazilPhone(raw)) {
    return "PHONE";
  }

  if (digits.length === 11) return "CPF";
  if (digits.length === 14 && isValidCnpj(digits)) return "CNPJ";

  return "RANDOM";
};

const formatPixInputValue = (value: string, type: PixKeyType) => {
  if (type === "CPF") return formatCpf(value);
  if (type === "CNPJ") return formatCnpj(value);
  if (type === "PHONE") return formatPhone(value);

  return String(value ?? "");
};

const normalizePhoneForBackend = (value: string) => {
  const national = stripBrazilCountryCode(value);

  if (!national) return "";

  if (national.length === 11) {
    return `+55${national}`;
  }

  const digits = onlyDigits(value);

  if (digits.startsWith("55")) {
    return `+${digits}`;
  }

  return `+55${digits}`;
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

const mapGowdKeyTypeToPixKeyType = (type: unknown): PixKeyType => {
  const value = String(type ?? "").toUpperCase();

  if (value === "EVP") return "RANDOM";
  if (value === "RANDOM") return "RANDOM";
  if (value === "CPF") return "CPF";
  if (value === "CNPJ") return "CNPJ";
  if (value === "EMAIL") return "EMAIL";
  if (value === "PHONE") return "PHONE";

  return "RANDOM";
};

const normalizeCurrencyDigits = (value: unknown) => {
  const digits = onlyDigits(value);

  if (!digits) return "";

  // Remove zeros artificiais do começo, mas mantém dígitos suficientes para centavos.
  // Ex: "0022" => "022" => 0,22
  // Ex: "0002" => "002" => 0,02
  return digits.replace(/^0+(?=\d{3,})/, "");
};

const formatAmountInputFromDigits = (value: unknown) => {
  const digits = normalizeCurrencyDigits(value);

  if (!digits) return "";

  const padded = digits.padStart(3, "0");
  const cents = padded.slice(-2);
  const integer = padded.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";

  return `${integer},${cents}`;
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

  const {
    mutate: pixOut,
    isPending: outPending,
    data: outData,
    reset: resetPixOut,
  } = useGowdPixOut();

  const {
    mutateAsync: checkPixKey,
    data: dictData,
    isPending: dictPending,
    reset: resetDict,
  } = useGowdPixDictCheck();

  const identifierRef = useRef(`pixout-${Date.now()}`);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const amountCaretRef = useRef<number | null>(null);

  const initialPixKey = String(initialValues?.pixKey ?? "");
  const initialPixKeyType = detectPixKeyType(initialPixKey);

  const [selectedKeyType, setSelectedKeyType] = useState<PixKeyTypeSelectable>("AUTO");
  const [key, setKey] = useState(() => formatPixInputValue(initialPixKey, initialPixKeyType));
  const [amount, setAmount] = useState(() => formatBRLInputValue(initialValues?.amount));
  const [description, setDescription] = useState(() => String(initialValues?.description ?? ""));
  const [dictError, setDictError] = useState("");
  const [lastCheckedPixKey, setLastCheckedPixKey] = useState("");

  const detectedType = useMemo(() => detectPixKeyType(key), [key]);

  const effectiveKeyType: PixKeyType = selectedKeyType === "AUTO" ? detectedType : selectedKeyType;

  const normalized = useMemo(
    () => normalizePixKeyForBackend(key, effectiveKeyType),
    [key, effectiveKeyType],
  );

  const normalizedPixKey = String(normalized.pixKey ?? "").trim();

  const dictReady =
    Boolean(dictData) &&
    Boolean(lastCheckedPixKey) &&
    Boolean(normalizedPixKey) &&
    lastCheckedPixKey === normalizedPixKey &&
    !dictPending;

  const canSearchDict = canUseDict && Boolean(normalizedPixKey) && !dictPending && !outPending;

  const canSendPix =
    canUseDict &&
    dictReady &&
    Boolean(amount.trim()) &&
    Boolean(dictData?.name) &&
    Boolean(dictData?.document?.number) &&
    Boolean(dictData?.document?.type) &&
    !dictPending &&
    !outPending;

  const autoDescription = useMemo(() => {
    return buildDescription({
      orderId: initialValues?.orderId,
      name: dictData?.name,
      documentType: dictData?.document?.type,
      documentNumber: dictData?.document?.number,
      pixKeyType: dictData?.keyType ?? effectiveKeyType,
      pixKey: dictData?.key ?? normalizedPixKey,
    });
  }, [
    dictData?.document?.number,
    dictData?.document?.type,
    dictData?.key,
    dictData?.keyType,
    dictData?.name,
    effectiveKeyType,
    initialValues?.orderId,
    normalizedPixKey,
  ]);

  useEffect(() => {
    const pixKey = String(initialValues?.pixKey ?? "");
    const pixKeyType = detectPixKeyType(pixKey);

    setSelectedKeyType("AUTO");
    setKey(formatPixInputValue(pixKey, pixKeyType));
    setAmount(formatBRLInputValue(initialValues?.amount));
    setDescription(String(initialValues?.description ?? ""));
    setDictError("");
    setLastCheckedPixKey("");
    resetDict();
  }, [initialValues, resetDict]);

  useEffect(() => {
    setDescription(autoDescription);
  }, [autoDescription]);

  useEffect(() => {
    if (!lastCheckedPixKey) return;

    if (lastCheckedPixKey !== normalizedPixKey) {
      resetDict();
      setDictError("");
      setLastCheckedPixKey("");
    }
  }, [lastCheckedPixKey, normalizedPixKey, resetDict]);

  const handleTypeChange = (value: PixKeyTypeSelectable) => {
    setSelectedKeyType(value);

    const typeForFormatting = value === "AUTO" ? detectPixKeyType(key) : value;

    setKey((current) => formatPixInputValue(current, typeForFormatting));
  };

  const handlePixKeyChange = (value: string) => {
    const typeForFormatting =
      selectedKeyType === "AUTO" ? detectPixKeyType(value) : selectedKeyType;

    setKey(formatPixInputValue(value, typeForFormatting));
  };

  const handleDictCheck = async () => {
    if (!canUseDict) {
      toast.warning("A consulta Pix está disponível apenas para Master e Bank.");
      return;
    }

    if (!normalizedPixKey) {
      toast.error("Informe uma chave Pix para consultar.");
      return;
    }

    try {
      // limpa consulta Dict antiga antes de buscar uma nova
      resetDict();
      setDictError("");
      setLastCheckedPixKey("");

      // limpa resposta de transferência antiga ao buscar novo Dict
      resetPixOut();

      const dict = await checkPixKey({
        key: normalizedPixKey,
      });

      const dictKeyType = mapGowdKeyTypeToPixKeyType(dict.keyType);
      const dictKey = String(dict.key || normalizedPixKey).trim();
      const normalizedDictKey = normalizePixKeyForBackend(dictKey, dictKeyType);

      setSelectedKeyType(dictKeyType);
      setKey(formatPixInputValue(dictKey, dictKeyType));
      setLastCheckedPixKey(String(normalizedDictKey.pixKey ?? "").trim());

      setDescription(
        buildDescription({
          orderId: initialValues?.orderId,
          name: dict.name,
          documentType: dict.document?.type,
          documentNumber: dict.document?.number,
          pixKeyType: dict.keyType,
          pixKey: dict.key,
        }),
      );

      // garante que, no sucesso da consulta Dict, a resposta PIX antiga desapareça
      resetPixOut();

      toast.success("Consulta bem sucedida.");
    } catch {
      resetDict();
      resetPixOut();
      setLastCheckedPixKey("");
      setDictError("Não foi possível consultar a chave Pix.");
      toast.error("Não foi possível consultar a chave Pix.");
    }
  };

  const handleSubmit = () => {
    if (!canUseDict) {
      toast.warning("A consulta do Pix está disponível apenas para Master e Bank.");
      return;
    }

    if (!dictReady || !dictData) {
      toast.error("Consulte antes de fazer o PIX.");
      return;
    }

    if (!dictData.name || !dictData.document?.number || !dictData.document?.type) {
      toast.error("A consulta retornou dados incompletos do titular.");
      return;
    }

    const amountValue = brlInputToNumber(amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    const dictPixKeyType = mapGowdKeyTypeToPixKeyType(dictData.keyType);
    const dictPixKey = normalizePixKeyForBackend(String(dictData.key ?? ""), dictPixKeyType);

    if (!String(dictPixKey.pixKey ?? "").trim()) {
      toast.error("O Dict retornou uma chave Pix inválida.");
      return;
    }

    const documentType = String(dictData.document.type).toUpperCase() === "CNPJ" ? "CNPJ" : "CPF";

    pixOut(
      {
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
              number: onlyDigits(dictData.document.number),
            },
          },
          bank: {
            pix: {
              type: dictPixKey.pixKeyType,
              key: String(dictPixKey.pixKey ?? "").trim(),
            },
          },
          description: description.trim() || autoDescription,
          code: identifierRef.current,
        },
      },
      {
        onSuccess: () => {
          // depois que a transferência for feita, limpa os dados da consulta Dict
          resetDict();
          setLastCheckedPixKey("");
          setDictError("");
        },
      },
    );
  };

  const publicDictFields = [
    { label: "Nome", value: dictData?.name ?? "-" },
    { label: "Banco", value: dictData?.bankName ?? "-" },
    { label: "Chave consultada", value: dictData?.key ?? "-" },
    { label: "Tipo da chave", value: dictData?.keyType ?? "-" },
  ];

  const masterFields = [
    { label: "Created at", value: formatDateTime(dictData?.createdAt) },
    { label: "Possed at", value: formatDateTime(dictData?.possedAt) },
    { label: "Document type", value: dictData?.document?.type ?? "-" },
    { label: "Document number", value: dictData?.document?.number ?? "-" },
    { label: "Account type", value: dictData?.accountType ?? "-" },
    { label: "Branch", value: dictData?.branchNumber ?? "-" },
    { label: "Account", value: dictData?.accountNumber ?? "-" },
    { label: "Account created at", value: formatDateTime(dictData?.accountCreatedAt) },
    { label: "ISPB", value: dictData?.ispb ?? "-" },
    { label: "Code", value: dictData?.code ?? "-" },
  ];

  return (
    <Modal onClose={onClose} title="Pix out" fit>
      <div className="flex w-full min-w-0 flex-col gap-4">
        <p className="text-sm text-gray-600">Pagamento via chave Pix com consulta</p>

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
              onChange={(e) => handleTypeChange(e.target.value as PixKeyTypeSelectable)}
              className="w-full rounded-lg border px-3 py-2"
              disabled={dictPending || outPending}
            >
              {KEY_TYPES_WITH_AUTO.map((item) => (
                <option key={item} value={item}>
                  {item === "AUTO" ? `AUTO (${detectedType})` : item}
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
              onChange={(e) => handlePixKeyChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="CPF / CNPJ / EMAIL / telefone / RANDOM"
              disabled={dictPending || outPending}
            />

            <span className="text-xs text-gray-500">
              Telefone{" "}
              <strong>
                {effectiveKeyType === "PHONE" ? normalizedPixKey || "+55..." : "+55..."}
              </strong>
              .
            </span>
          </label>

          <label className="flex w-full min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Valor</span>

            <BRLAmountInput
              value={amount}
              onChange={setAmount}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="0,00"
              disabled={outPending}
            />
          </label>

          <label className="flex w-full min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Descrição</span>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[110px] w-full rounded-lg border px-3 py-2"
              disabled={outPending}
            />
          </label>
        </div>

        {canUseDict && (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900">Consulta</h3>

              {dictPending && <span className="text-sm text-gray-500">Consultando...</span>}

              {dictReady && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Chave pix consultada
                </span>
              )}
            </div>

            {dictError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {dictError}
              </div>
            ) : !dictData ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
                Digite uma chave Pix válida e clique em Buscar.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {publicDictFields.map((field) => (
                    <InfoRow key={field.label} label={field.label} value={field.value} />
                  ))}
                </div>

                {isMaster && (
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
            <Button onClick={onClose} disabled={dictPending || outPending}>
              Cancelar
            </Button>

            {canUseDict && (
              <Button onClick={handleDictCheck} disabled={!canSearchDict}>
                {dictPending ? "Consultando ..." : "Buscar"}
              </Button>
            )}

            {dictReady && (
              <Button onClick={handleSubmit} disabled={!canSendPix}>
                {outPending ? "Enviando..." : "Fazer PIX"}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
