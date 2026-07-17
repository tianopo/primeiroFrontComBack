type BankAccountDetailsFormProps = {
  account: any;
};

const getValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

export const BankAccountDetailsForm = ({ account }: BankAccountDetailsFormProps) => {
  const address = account?.address ?? {};
  const document = account?.document ?? {};
  const bankAccountData = account?.bankAccountData ?? {};

  return (
    <section className="rounded-md border border-gray-200 p-4">
      <h4 className="mb-3 text-lg font-bold">Conta BAAS</h4>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">AccountId</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.id)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Status</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.status)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">País</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.country)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tipo de titular</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.holderType)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">Nome completo</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.fullName)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">E-mail</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.email)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Telefone</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.phone)}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nascimento / Fundação</label>
          <input
            className="rounded-lg border bg-gray-50 px-3 py-2"
            value={getValue(account?.birthdate)}
            readOnly
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[130px_minmax(0,1fr)]">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tipo</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(document?.type)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Documento</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(document?.number)}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h5 className="mb-3 font-semibold">Dados bancários</h5>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">ISPB</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(bankAccountData?.ispb)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Agência</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(bankAccountData?.branchNumber)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Conta</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(bankAccountData?.accountNumber)}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h5 className="mb-3 font-semibold">Endereço</h5>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Rua, número</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(address?.street)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Bairro</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(address?.neighborhood)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Cidade</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(address?.city)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Estado</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(address?.state)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">CEP</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(address?.zipCode)}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Complemento</label>
            <input
              className="rounded-lg border bg-gray-50 px-3 py-2"
              value={getValue(address?.complement)}
              readOnly
            />
          </div>
        </div>
      </div>
    </section>
  );
};
