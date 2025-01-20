import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCurrency } from "src/utils/formats";
import {
  assetsOptions,
  blockchainsOptions,
  limitDateOptions,
  paymentOptions,
  walletOptions,
} from "src/utils/selectsOptions";
import { services } from "../config/contractPdfs/services";
import { useService } from "../hooks/useServices";

export const Services = () => {
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [ativoDigital, setAtivoDigital] = useState<string>("");
  const [pagamento, setPagamento] = useState<string>("");
  const [tempoLimite, setTempoLimite] = useState<string>("");
  const [blockchain, setBlockchain] = useState<string>("");
  const [enderecoComprador, setEnderecoComprador] = useState<string>("");
  const [wallet, setWallet] = useState<string>("");
  const { context } = useService();
  const {
    formState: { errors },
    setValue,
    reset,
  } = context;

  const handleQuantidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const quantidade = e.target.value;
    setValue("quantidade", quantidade);
    setQuantidade(quantidade);
  };

  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCurrency(e.target.value);
    setValor(formattedCPF);
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
          value={ativoDigital}
          onChange={(e) => setAtivoDigital(e.target.value)}
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
        <Select
          title="Blockchain"
          placeholder="BSC (BEP20)"
          options={blockchainsOptions}
          value={blockchain}
          onChange={(e) => setBlockchain(e.target.value)}
          required
        />
        <InputX
          title="Endereço Comprador"
          placeholder="EQ1BIZ8qYmskDzJmkGodYRTf_b9hckj6dZl"
          value={enderecoComprador}
          onChange={(e) => setEnderecoComprador(e.target.value)}
          required
        />
        <Select
          title="Wallet"
          placeholder="Metamask"
          options={walletOptions}
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          required
        />
        <Button
          disabled={Object.keys(errors).length > 0}
          onClick={() =>
            services({
              quantidade,
              valor,
              ativo: ativoDigital,
              pagamento,
              tempoLimite,
              blockchain,
              enderecoComprador,
              wallet,
            })
          }
        >
          Criar Contrato
        </Button>
      </FormX>
    </FormProvider>
  );
};
