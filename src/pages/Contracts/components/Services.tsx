import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { useAddressByCep } from "src/hooks/AddressByCep";
import { formatCep, formatCurrency, formatState } from "src/utils/formats";
import {
  assetsOptions,
  blockchainsOptions,
  estadoCivilOptions,
  limitDateOptions,
  paymentOptions,
  walletOptions,
} from "src/utils/selectsOptions";
import { services } from "../config/contractPdfs/services";
import { useListUsers } from "../hooks/useListBuyers";
import { IUsuario, useService } from "../hooks/useServices";

export const Services = () => {
  const [usuario, setUsuario] = useState<IUsuario>({ name: "", document: "" });
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [ativo, setativo] = useState<string>("");
  const [pagamento, setPagamento] = useState<string>("");
  const [tempoLimite, setTempoLimite] = useState<string>("");
  const [blockchain, setBlockchain] = useState<string>("");
  const [enderecoComprador, setEnderecoComprador] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [wallet, setWallet] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  // info pessoais
  const { data } = useListUsers();
  const { context } = useService();
  const {
    formState: { errors },
    setValue,
    reset,
    clearErrors,
  } = context;
  const [estadoCivil, setEstadoCivil] = useState("");
  // endereço
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  const handleQuantidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const quantidade = e.target.value;
    setValue("quantidade", quantidade);
    setQuantidade(quantidade);
  };

  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedValor = formatCurrency(e.target.value);
    setValor(formattedValor);
  };

  const handleCepChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const cepValue = e.target.value;

    const formattedCEP = formatCep(cepValue);
    setValue("cep", formattedCEP);
    setCep(formattedCEP);
    const cleanCep = cepValue.replace(/\D/g, "");

    if (cleanCep.length === 8) {
      const addressData = await useAddressByCep(cleanCep);
      if (addressData && addressData.erro !== "true") {
        clearErrors();
        const { logradouro, bairro, uf, localidade } = addressData;
        setRua(logradouro);
        setValue("rua", logradouro);
        setCidade(localidade);
        setValue("cidade", localidade);
        setBairro(bairro);
        setValue("bairro", bairro);
        setEstado(formatState(uf));
        setValue("estado", formatState(uf));
      }
    }
  };

  const handleStateFormat = (e: { target: { value: string } }) => {
    const formattedState = formatState(e.target.value);
    setValue("estado", formattedState);
    setEstado(formattedState);
  };

  const handleSubmit = () => {
    reset();
    toast.success("Contrato Criado");
  };

  return (
    <FormProvider {...context}>
      <FormX
        onSubmit={handleSubmit}
        className="flex max-w-4xl flex-col gap-2 rounded-lg border p-4 text-center"
      >
        <h3 className="text-28 font-bold">Serviços</h3>
        <InputX
          title="Usuário"
          placeholder="Registro do usuário na Exchange"
          value={usuario?.name || ""}
          onChange={(e) =>
            setUsuario((prev) => ({
              ...prev,
              name: e.target.value.split(" - ")[0],
              document: e.target.value.split(" - ")[1],
            }))
          }
          busca
          options={data
            ?.filter((user: any) => user && user?.name?.includes(usuario.name))
            .map((user: any) => `${user.name} - ${user.document}`)}
        />
        <Select
          title="Tipo"
          placeholder="UID"
          options={["UID", "endereco"]}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        />
        <InputX
          title="Quantidade"
          placeholder="45.55"
          value={quantidade}
          onChange={handleQuantidadeChange}
          required
        />
        <InputX
          title="Valor"
          placeholder="R$ 5.000,01"
          value={valor}
          onChange={handleValorChange}
          required
        />
        <Select
          title="Ativo"
          placeholder="USDT"
          options={assetsOptions}
          value={ativo}
          onChange={(e) => setativo(e.target.value)}
          required
        />
        <Select
          title="Pagamento"
          placeholder="Pix"
          options={paymentOptions}
          value={pagamento}
          onChange={(e) => setPagamento(e.target.value)}
          required
        />
        <Select
          title="Tempo Limite"
          placeholder="Tempo em horas"
          options={limitDateOptions}
          value={tempoLimite}
          onChange={(e) => setTempoLimite(e.target.value)}
          required
        />
        {tipo === "UID" ? (
          <InputX
            title="Uid"
            placeholder="524865433"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
        ) : (
          <>
            <Select
              title="Blockchain"
              placeholder="BSC (BEP20)"
              options={blockchainsOptions}
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
            />
            <InputX
              title="Endereço Comprador"
              placeholder="EQ1BIZ8qYmskDzJmkGodYRTf_b9hckj6dZl"
              value={enderecoComprador}
              onChange={(e) => setEnderecoComprador(e.target.value)}
            />
          </>
        )}
        <Select
          title="Wallet"
          placeholder="Metamask"
          options={walletOptions}
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          required
        />
        <Select
          title="Estado Civil"
          placeholder="Solteiro"
          options={estadoCivilOptions}
          value={estadoCivil}
          onChange={(e) => setEstadoCivil(e.target.value)}
          required
        />
        <InputX
          title="CEP"
          placeholder="XX.XXX-XXX"
          onChange={handleCepChange}
          value={cep}
          required
        />
        <InputX
          title="Rua"
          placeholder="Rua Salvador"
          value={rua}
          onChange={(e) => setRua(e.target.value)}
          readOnly={cep.length > 9}
          required
        />
        <InputX
          title="Cidade"
          placeholder="Jacareí"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          readOnly={cep.length > 9}
          required
        />
        <InputX
          title="Número"
          placeholder="100"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
        />
        <InputX
          title="Bairro"
          placeholder="Jardim Colinas"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          readOnly={cep.length > 9}
          required
        />
        <InputX
          title="Complemento"
          placeholder="BL 8 apto 805"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
        />
        <InputX
          title="Estado"
          placeholder="SP"
          value={estado}
          onChange={handleStateFormat}
          readOnly={cep.length > 9}
          required
        />
        <Button
          disabled={Object.keys(errors).length > 0}
          onClick={() =>
            services({
              usuario,
              tipo,
              quantidade,
              valor,
              ativo: ativo,
              pagamento,
              tempoLimite,
              blockchain,
              enderecoComprador,
              uid,
              wallet,
              cep,
              rua,
              cidade,
              numero,
              bairro,
              complemento,
              estado,
              estadoCivil,
            })
          }
        >
          Criar Contrato
        </Button>
      </FormX>
    </FormProvider>
  );
};
