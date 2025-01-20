import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCurrency, formatDateTime } from "src/utils/formats";
import { assetsOptions, exchangeOptions } from "src/utils/selectsOptions";
import { protection } from "../config/contractPdfs/comercialProtection";
import { useProtection } from "../hooks/useProtection";

export const Protection = () => {
  const [dataHora, setDataHora] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [ativoDigital, setAtivoDigital] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [enderecoComprador, setEnderecoComprador] = useState<string>("");
  const { context } = useProtection();
  const {
    formState: { errors },
    setValue,
    reset,
  } = context;

  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatDateTime(e.target.value);
    setDataHora(formattedDate);
  };

  const handleQuantidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const quantidade = e.target.value;
    setValue("quantidade", quantidade);
    setQuantidade(quantidade);
  };

  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCurrency(e.target.value);
    setValor(formattedCPF);
  };

  const handleExchangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const choosen = e.target.value;
    setValue("exchange", choosen);
    setExchange(choosen);
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
        <h3 className="text-28 font-bold">Defesa da Contestação</h3>
        <InputX
          title="Data Hora"
          placeholder="AAAA-MM-DD HH:MM:SS"
          value={dataHora}
          onChange={handleDateTimeChange}
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
          value={ativoDigital}
          onChange={(e) => setAtivoDigital(e.target.value)}
          required
        />
        <Select
          title="Exchange"
          placeholder="Bybit"
          options={exchangeOptions.map((a) => a.split(" ")[0])}
          value={exchange}
          onChange={handleExchangeChange}
          required
        />
        <InputX
          title="Endereço Comprador"
          placeholder="EQ1BIZ8qYmskDzJmkGodYRTf_b9hckj6dZl"
          value={enderecoComprador}
          onChange={(e) => setEnderecoComprador(e.target.value)}
          required
        />
        <Button
          disabled={Object.keys(errors).length > 0}
          onClick={() =>
            protection({
              dataHora,
              quantidade,
              valor,
              ativo: ativoDigital,
              exchange,
            })
          }
        >
          Criar Contrato
        </Button>
      </FormX>
    </FormProvider>
  );
};
