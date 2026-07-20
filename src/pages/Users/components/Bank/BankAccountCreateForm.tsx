import { get } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import {
  BankAccountDocumentType,
  BankAccountHolderType,
  IBankAccountCreateSchema,
  useBankAccountCreateForm,
} from "../../hooks/Gowd/Baas/useBankAccountCreateForm";
import { useGowdBaasCreateAccount } from "../../hooks/Gowd/Baas/useGowdBaasCreateAccount";
import { responseError } from "src/config/responseErrors";

interface IBankAccountCreateForm {
  userId: string;
  userName: string;
  userDocument: string;
  onCreated?: (result: unknown) => void;
}

const onlyDigits = (value: string) => String(value ?? "").replace(/\D/g, "");

const ErrorText = ({ message }: { message?: unknown }) => {
  if (typeof message !== "string" || !message) return null;

  return <span className="text-xs text-red-500">{message}</span>;
};

export const BankAccountCreateForm = ({
  userId,
  userName,
  userDocument,
  onCreated,
}: IBankAccountCreateForm) => {
  const createAccount = useGowdBaasCreateAccount();

  const { context } = useBankAccountCreateForm({
    userId,
    userName,
    userDocument,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = context;

  const holderType = watch("holderType");
  const documentType = watch("document.type");

  const getErrorMessage = (path: string) => {
    const error = get(errors, path);
    return typeof error?.message === "string" ? error.message : undefined;
  };

  const createNewAccount = async (values: IBankAccountCreateSchema) => {
    const documentNumber = onlyDigits(values.document.number);

    const isCnpj = documentNumber.length === 14;
    const isCpf = documentNumber.length === 11;

    if (!isCpf && !isCnpj) {
      responseError("Documento inválido. CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos.");
      return;
    }

    const holderType: BankAccountHolderType = isCnpj ? "ORGANIZATION" : "INDIVIDUAL";
    const documentType: BankAccountDocumentType = isCnpj ? "CNPJ" : "CPF";

    const representatives = Array.isArray(values.representatives)
      ? values.representatives
          .map((representative) => ({
            country: "BRA",
            fullName: String(representative.fullName ?? "").trim(),
            email: String(representative.email ?? "").trim(),
            phone: String(representative.phone ?? "").trim(),
            birthdate: String(representative.birthdate ?? "").trim(),
            documentNumber: onlyDigits(representative.documentNumber ?? ""),
          }))
          .filter((representative) => {
            return (
              representative.fullName ||
              representative.email ||
              representative.phone ||
              representative.birthdate ||
              representative.documentNumber
            );
          })
      : [];

    const onboardingDocuments = cleanOptionalObject(values.onboardingDocuments);

    const payload = {
      userId: values.userId,
      country: values.country.trim(),
      holderType,
      fullName: values.fullName.replace(/\s+/g, " ").trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      birthdate: values.birthdate.trim(),
      document: {
        type: documentType,
        number: documentNumber,
      },
      address: {
        street: values.address.street.trim(),
        neighborhood: values.address.neighborhood.trim(),
        city: values.address.city.trim(),
        state: values.address.state.trim().toUpperCase(),
        zipCode: onlyDigits(values.address.zipCode),
        complement: String(values.address.complement ?? "").trim(),
      },
      ...(representatives.length > 0 ? { representatives } : {}),
      ...(onboardingDocuments ? { onboardingDocuments } : {}),
    };

    const result = await createAccount.mutateAsync(payload);

    onCreated?.(result);
  };

  const cleanOptionalObject = (input?: Record<string, unknown>) => {
    if (!input) return undefined;

    const output: Record<string, string> = {};

    Object.entries(input).forEach(([key, value]) => {
      const normalizedValue = String(value ?? "").trim();

      if (normalizedValue) {
        output[key] = normalizedValue;
      }
    });

    return Object.keys(output).length > 0 ? output : undefined;
  };

  return (
    <section className="rounded-md border border-gray-200 p-4">
      <h4 className="mb-3 text-lg font-bold">Criar conta BAAS</h4>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(createNewAccount)}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">País</label>
            <input className="rounded-lg border px-3 py-2" {...register("country")} />
            <ErrorText message={errors.country?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tipo de titular</label>
            <select
              className="rounded-lg border px-3 py-2"
              value={holderType}
              onChange={(e) =>
                setValue("holderType", e.target.value as BankAccountHolderType, {
                  shouldValidate: true,
                })
              }
            >
              <option value="INDIVIDUAL">Pessoa física</option>
              <option value="ORGANIZATION">Pessoa jurídica</option>
            </select>
            <ErrorText message={errors.holderType?.message} />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Nome completo</label>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="LEONARDO DE JESUS SANTOS"
              {...register("fullName")}
            />
            <ErrorText message={errors.fullName?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">E-mail</label>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="cliente@exemplo.com"
              type="email"
              {...register("email")}
            />
            <ErrorText message={errors.email?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Telefone</label>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="+5511999999999"
              {...register("phone")}
            />
            <ErrorText message={errors.phone?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Data de nascimento</label>
            <input className="rounded-lg border px-3 py-2" type="date" {...register("birthdate")} />
            <ErrorText message={errors.birthdate?.message} />
          </div>

          <div className="grid gap-3 md:grid-cols-[130px_minmax(0,1fr)]">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Tipo</label>
              <select
                className="rounded-lg border px-3 py-2"
                value={documentType}
                onChange={(e) =>
                  setValue("document.type", e.target.value as BankAccountDocumentType, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
              <ErrorText message={getErrorMessage("document.type")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Documento</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="CPF/CNPJ"
                {...register("document.number")}
              />
              <ErrorText message={getErrorMessage("document.number")} />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <h5 className="mb-3 font-semibold">Endereço</h5>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Rua, número</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Rua Exemplo, 123"
                {...register("address.street")}
              />
              <ErrorText message={getErrorMessage("address.street")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Bairro</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Centro"
                {...register("address.neighborhood")}
              />
              <ErrorText message={getErrorMessage("address.neighborhood")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Cidade</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="São Paulo"
                {...register("address.city")}
              />
              <ErrorText message={getErrorMessage("address.city")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Estado</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="SP"
                maxLength={2}
                {...register("address.state")}
              />
              <ErrorText message={getErrorMessage("address.state")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">CEP</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="01001000"
                {...register("address.zipCode")}
              />
              <ErrorText message={getErrorMessage("address.zipCode")} />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Complemento</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Apto, sala, referência..."
                {...register("address.complement")}
              />
              <ErrorText message={getErrorMessage("address.complement")} />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <h5 className="mb-3 font-semibold">Representante</h5>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Nome do representante</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="João Silva"
                {...register("representatives.0.fullName")}
              />
              <ErrorText message={getErrorMessage("representatives.0.fullName")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">E-mail do representante</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="representante@email.com"
                {...register("representatives.0.email")}
              />
              <ErrorText message={getErrorMessage("representatives.0.email")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Telefone do representante</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="+5511999999999"
                {...register("representatives.0.phone")}
              />
              <ErrorText message={getErrorMessage("representatives.0.phone")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Nascimento do representante</label>
              <input
                className="rounded-lg border px-3 py-2"
                type="date"
                {...register("representatives.0.birthdate")}
              />
              <ErrorText message={getErrorMessage("representatives.0.birthdate")} />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">CPF do representante</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="12345678911"
                {...register("representatives.0.documentNumber")}
              />
              <ErrorText message={getErrorMessage("representatives.0.documentNumber")} />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <h5 className="mb-3 font-semibold">Onboarding PJ</h5>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Nome fantasia</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.tradingName")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Razão social</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.businessName")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Telefone de contato</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.contactNumber")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Site</label>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="https://empresa.com.br"
                {...register("onboardingDocuments.site")}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium">Contrato social URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.socialContract")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Cartão CNPJ URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.cnpjCard")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Comprovante endereço URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.proofAddress")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Comprovante banco URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.proofBankAddress")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Comprovante sócio URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.partnerProofAddress")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Documento representante URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.documentRepresentative")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Selfie representante URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.selfieRepresentative")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">IR URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.ir")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">KYC URL</label>
              <input
                className="rounded-lg border px-3 py-2"
                {...register("onboardingDocuments.kyc")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createAccount.isPending}>
            {createAccount.isPending ? "Criando..." : "Criar conta"}
          </Button>
        </div>
      </form>
    </section>
  );
};
