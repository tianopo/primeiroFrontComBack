import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCurrency } from "src/utils/formats";
import { assetsOptions, blockchainsOptions } from "src/utils/selectsOptions";
import { generatePdfReport } from "../config/generatePdf";
import { useService } from "../hooks/useServices";

export const Services = () => {
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [ativoDigital, setAtivoDigital] = useState<string>("");
  const [blockchain, setBlockchain] = useState<string>("");
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

  const handleSubmit = (data: any) => {
    reset();
  };

  return (
    <FormProvider {...context}>
      <div className="flex h-fit w-full flex-col">
        <FormX
          onSubmit={handleSubmit}
          className="flex flex-col flex-wrap justify-between gap-2 md:flex-row"
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
            title="Blockchain"
            placeholder="BSC (BEP20)"
            options={blockchainsOptions}
            value={blockchain}
            onChange={(e) => setBlockchain(e.target.value)}
            required
          />
          <Button disabled={Object.keys(errors).length > 0} onClick={() => generatePdfReport()}>
            Criar Contrato
          </Button>
        </FormX>
      </div>
    </FormProvider>
  );
};
