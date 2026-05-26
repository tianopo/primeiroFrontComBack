import { ChangeEvent } from "react";
import { FormProvider, type FieldPath, type FieldPathValue } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { useAddressByCep } from "src/hooks/AddressByCep";
import { formatCep, formatState } from "src/utils/formats";
import { blockchainsOptions, estadoCivilOptions, walletOptions } from "src/utils/selectsOptions";
import { services } from "../config/contractPdfs/services";
import { useListUsers } from "../hooks/useListBuyers";
import { inferDocumentType, type IService, useService } from "../hooks/useServices";

export const Services = () => {
  const { data } = useListUsers();
  const { context } = useService();

  const {
    formState: { isValid, isSubmitting },
    setValue,
    reset,
    clearErrors,
    handleSubmit,
    watch,
  } = context;

  const form = watch();
  const isCnpj = form.tipoDocumento === "CNPJ";

  const setValidatedValue = <TField extends FieldPath<IService>>(
    field: TField,
    value: FieldPathValue<IService, TField>,
  ) => {
    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleUsuarioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const separator = rawValue.lastIndexOf(" - ");

    if (separator < 0) {
      setValidatedValue("usuario.name", rawValue);
      setValidatedValue("usuario.document", "");
      return;
    }

    const name = rawValue.slice(0, separator).trim();
    const document = rawValue.slice(separator + 3).trim();
    const inferredType = inferDocumentType(document);

    setValidatedValue("usuario.name", name);
    setValidatedValue("usuario.document", document);

    if (inferredType) {
      setValidatedValue("tipoDocumento", inferredType);
    }
  };

  const handleCepChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value);
    setValidatedValue("cep", formattedCep);

    const cleanCep = formattedCep.replace(/\D/g, "");

    if (cleanCep.length !== 8) return;

    const addressData = await useAddressByCep(cleanCep);

    if (!addressData || addressData.erro === "true") return;

    clearErrors(["cep", "rua", "cidade", "bairro", "estado"]);

    const { logradouro, bairro, uf, localidade } = addressData;

    setValidatedValue("rua", logradouro);
    setValidatedValue("cidade", localidade);
    setValidatedValue("bairro", bairro);
    setValidatedValue("estado", formatState(uf));
  };

  const handleStateFormat = (e: ChangeEvent<HTMLInputElement>) => {
    setValidatedValue("estado", formatState(e.target.value));
  };

  const handleCreateContract = (values: IService) => {
    services(values);
    toast.success("Contrato de prestação de serviços criado.");
    reset();
  };

  return (
    <FormProvider {...context}>
      <FormX
        onSubmit={handleSubmit(handleCreateContract)}
        className="flex max-w-4xl flex-col gap-2 rounded-lg border p-4 text-center"
      >
        <h3 className="text-28 font-bold">
          Contrato de prestação de serviços: compra e venda de ativos
        </h3>

        <InputX
          title="Contratante"
          placeholder="Selecione a pessoa cadastrada"
          value={form.usuario.name}
          onChange={handleUsuarioChange}
          busca
          options={data
            ?.filter((user: IUsuarioFromApi) =>
              user?.name?.toLowerCase().includes(form.usuario.name.toLowerCase()),
            )
            .map((user: IUsuarioFromApi) => `${user.name} - ${user.document}`)}
          required
        />

        <InputX
          title="Documento vinculado ao contrato"
          placeholder="CPF ou CNPJ"
          value={form.usuario.document}
          onChange={() => undefined}
          readOnly
          required
        />

        <Select
          title="Tipo de documento da CONTRATANTE"
          placeholder="CPF ou CNPJ"
          options={["CPF", "CNPJ"]}
          value={form.tipoDocumento}
          onChange={(e) =>
            setValidatedValue("tipoDocumento", e.target.value as IService["tipoDocumento"])
          }
          required
        />

        {isCnpj ? (
          <>
            <InputX
              title="Nome do responsável pela contratação"
              placeholder="Nome completo do representante"
              value={form.responsavelNome ?? ""}
              onChange={(e) => setValidatedValue("responsavelNome", e.target.value)}
              required
            />

            <InputX
              title="CPF do responsável pela contratação"
              placeholder="000.000.000-00"
              value={form.responsavelCpf ?? ""}
              onChange={(e) => setValidatedValue("responsavelCpf", e.target.value)}
              required
            />

            <Select
              title="Estado civil do responsável"
              placeholder="Selecione"
              options={estadoCivilOptions}
              value={form.responsavelEstadoCivil ?? ""}
              onChange={(e) => setValidatedValue("responsavelEstadoCivil", e.target.value)}
              required
            />

            <InputX
              title="Cargo/qualidade do responsável"
              placeholder="Ex.: Sócio-administrador"
              value={form.responsavelCargo ?? ""}
              onChange={(e) => setValidatedValue("responsavelCargo", e.target.value)}
            />
          </>
        ) : (
          <Select
            title="Estado civil da CONTRATANTE"
            placeholder="Selecione"
            options={estadoCivilOptions}
            value={form.estadoCivil ?? ""}
            onChange={(e) => setValidatedValue("estadoCivil", e.target.value)}
            required
          />
        )}

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-left">
          <h4 className="font-bold text-blue-800">
            Destino fixo vinculado ao CPF/CNPJ para compras da CONTRATANTE
          </h4>
          <p className="mt-1 text-sm text-blue-700">
            Quando a CONTRATANTE comprar ativos, a CRYPTOTECH somente enviará para o endereço
            cadastrado abaixo e na mesma rede selecionada. Alterações exigem novo vínculo ou
            aditamento contratual.
          </p>
        </div>

        <Select
          title="Rede blockchain vinculada"
          placeholder="BSC (BEP20)"
          options={blockchainsOptions}
          value={form.blockchain}
          onChange={(e) => setValidatedValue("blockchain", e.target.value)}
          required
        />

        <Select
          title="Carteira ou corretora da CONTRATANTE"
          placeholder="Selecione a plataforma de destino"
          options={walletOptions}
          value={form.wallet}
          onChange={(e) => setValidatedValue("wallet", e.target.value)}
          required
        />

        <InputX
          title="Endereço cadastrado para recebimento"
          placeholder="Endereço da carteira na rede selecionada"
          value={form.enderecoCadastrado}
          onChange={(e) => setValidatedValue("enderecoCadastrado", e.target.value.trim())}
          required
        />

        <h4 className="mt-4 text-left font-bold">Endereço cadastral da CONTRATANTE</h4>

        <InputX
          title="CEP"
          placeholder="XX.XXX-XXX"
          onChange={handleCepChange}
          value={form.cep}
          required
        />

        <InputX
          title={isCnpj ? "Logradouro da sede" : "Rua"}
          placeholder="Rua Salvador"
          value={form.rua}
          onChange={(e) => setValidatedValue("rua", e.target.value)}
          readOnly={form.cep.replace(/\D/g, "").length === 8}
          required
        />

        <InputX
          title="Cidade"
          placeholder="Jacareí"
          value={form.cidade}
          onChange={(e) => setValidatedValue("cidade", e.target.value)}
          readOnly={form.cep.replace(/\D/g, "").length === 8}
          required
        />

        <InputX
          title="Número"
          placeholder="100"
          value={form.numero}
          onChange={(e) => setValidatedValue("numero", e.target.value)}
          required
        />

        <InputX
          title="Bairro"
          placeholder="Jardim Colinas"
          value={form.bairro}
          onChange={(e) => setValidatedValue("bairro", e.target.value)}
          readOnly={form.cep.replace(/\D/g, "").length === 8}
          required
        />

        <InputX
          title="Complemento"
          placeholder="BL 8 apto 805"
          value={form.complemento ?? ""}
          onChange={(e) => setValidatedValue("complemento", e.target.value)}
        />

        <InputX
          title="Estado"
          placeholder="SP"
          value={form.estado}
          onChange={handleStateFormat}
          readOnly={form.cep.replace(/\D/g, "").length === 8}
          required
        />

        <Button type="submit" disabled={!isValid || isSubmitting}>
          Criar Contrato
        </Button>
      </FormX>
    </FormProvider>
  );
};

interface IUsuarioFromApi {
  name: string;
  document: string;
}
