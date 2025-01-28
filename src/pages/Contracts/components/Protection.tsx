import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCurrency, formatDateTime } from "src/utils/formats";
import { assetsOptions, exchangeOptions, walletOptions } from "src/utils/selectsOptions";
import { protection } from "../config/contractPdfs/comercialProtection";
import { useListBuyers } from "../hooks/useListBuyers";
import { useProtection } from "../hooks/useProtection";

export const Protection = () => {
  const [tipoTransferencia, setTipoTransferencia] = useState<string>("exchange");
  const [comprador, setComprador] = useState<string>("");
  const [instituicao, setInstituicao] = useState<string>("");
  const [dataHora, setDataHora] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [ativoDigital, setAtivoDigital] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");
  const [wallet, setWallet] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data } = useListBuyers();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = () => {
    reset();
    setUploadedFiles([]);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    toast.success("Carta Criada");
  };

  return (
    <FormProvider {...context}>
      <FormX
        onSubmit={handleSubmit}
        className="flex max-w-4xl flex-col gap-2 rounded-lg border p-4 text-center"
      >
        <h3 className="text-28 font-bold">Defesa da Contestação</h3>
        <Select
          title="Tipo Transferência"
          placeholder="Selecione"
          options={["exchange", "wallet"]}
          value={tipoTransferencia}
          onChange={(e) => setTipoTransferencia(e.target.value)}
          required
        />
        <InputX
          title="comprador"
          placeholder="Nome do Comprador"
          value={comprador || ""}
          onChange={(e) => setComprador(e.target.value)}
          busca
          options={data
            ?.filter((item: any) =>
              (item.name || "").toLowerCase().includes((comprador || "").toLowerCase()),
            )
            .map((item: any) => item.name)}
        />
        <InputX
          title="Instituição"
          placeholder="PagSeguro"
          value={instituicao}
          onChange={(e) => setInstituicao(e.target.value)}
          required
        />
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
        {tipoTransferencia === "exchange" && (
          <>
            <Select
              title="Exchange"
              placeholder="Bybit"
              options={exchangeOptions.map((a) => a.split(" ")[0])}
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              required
            />
            <InputX
              title="UID"
              placeholder="UID do comprador"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
            />
          </>
        )}
        {tipoTransferencia === "wallet" && (
          <>
            <Select
              title="Wallet"
              placeholder="Metamask"
              options={walletOptions}
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              required
            />
            <InputX
              title="Endereco"
              placeholder="EQ1BIZ8qYmskDzJmkGodYRTf_b9hckj6dZl"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
            />
          </>
        )}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium">Adicionar Arquivo (PDF/Imagem)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            multiple
            className="mt-2"
          />
        </div>
        <Button
          disabled={Object.keys(errors).length > 0}
          onClick={() =>
            protection(
              {
                tipoTransferencia,
                comprador,
                instituicao,
                dataHora,
                quantidade,
                valor,
                ativo: ativoDigital,
                exchange: tipoTransferencia === "exchange" ? exchange : undefined,
                uid: tipoTransferencia === "exchange" ? uid : undefined,
                wallet: tipoTransferencia === "wallet" ? wallet : undefined,
                endereco: tipoTransferencia === "wallet" ? endereco : undefined,
              },
              uploadedFiles,
            )
          }
        >
          Criar Carta
        </Button>
      </FormX>
    </FormProvider>
  );
};
