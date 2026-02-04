import { ChangeEvent, useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCurrency, formatDateTime } from "src/utils/formats";
import { assetsOptions, exchangeOptions, walletOptions } from "src/utils/selectsOptions";
import { protection } from "../config/contractPdfs/comercialProtection";
import { useListUsers } from "../hooks/useListBuyers";
import { useListOrders } from "../hooks/useListOrders";
import { useProtection } from "../hooks/useProtection";

export const Protection = () => {
  const [tipoTransferencia, setTipoTransferencia] = useState<string>("usuario");
  const [order, setOrder] = useState<string>("");
  const [comprador, setComprador] = useState<string>("");
  const [dataHora, setDataHora] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [ativo, setativo] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [endereco, setEndereco] = useState<string>("");
  const [wallet, setWallet] = useState<string>("");
  const [usuario, setUsuario] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data } = useListUsers();
  const { context } = useProtection();
  const {
    formState: { errors },
    setValue,
    reset,
  } = context;
  const { data: dataOrders, error: errorOrders, isLoading: isLoadingOrders } = useListOrders();

  useEffect(() => {
    if (order && dataOrders) {
      const selectedOrder = dataOrders.find((o: any) => o.numeroOrdem === order);
      if (selectedOrder) {
        const {
          dataHora,
          quantidade: amount,
          valor: value,
          ativo: asset,
          exchange: corretora,
          buyerId,
        } = selectedOrder;
        setDataHora(dataHora);
        setValue("dataHora", dataHora);
        setQuantidade(amount);
        setValue("quantidade", amount);
        setValor(value);
        setValue("valor", value);
        setativo(asset);
        setValue("ativo", asset);
        setExchange(corretora.split(" ")[0]);
        setValue("exchange", corretora);
        // Buscar o nome do comprador pelo buyerId
        const buyer = data?.find((b: any) => b.id === buyerId);
        if (buyer) {
          setComprador(buyer.name);
          setValue("comprador", buyer.name);
          setUsuario(buyer.counterparty);
          setValue("usuario", buyer.counterparty);
        } else {
          setComprador("");
          setUsuario("");
        }
      }
    }
  }, [order, dataOrders, data]);

  const handleOrderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOrder(e.target.value);
  };

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
    const formattedValor = formatCurrency(e.target.value);
    setValor(formattedValor);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const incoming = Array.from(e.target.files);

    const allowed = incoming.filter((f) => {
      const name = (f.name || "").toLowerCase();
      const isPdf = f.type === "application/pdf" || name.endsWith(".pdf");
      const isImg = f.type.startsWith("image/");
      return isPdf || isImg;
    });

    setUploadedFiles((prev) => [...prev, ...allowed]);
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
          options={["exchange", "wallet", "usuario"]}
          value={tipoTransferencia}
          onChange={(e) => setTipoTransferencia(e.target.value)}
          required
        />
        {isLoadingOrders && <p>Carregando Ordens...</p>}
        {errorOrders && <p>Erro ao carregar dados das ordens</p>}
        {tipoTransferencia === "usuario" && (
          <InputX
            title="Ordem"
            placeholder="1889336254869762048"
            value={order}
            onChange={handleOrderChange}
            busca
            options={dataOrders?.map((o: any) => o.numeroOrdem)}
          />
        )}
        <InputX
          title="Comprador"
          placeholder="Nome do Comprador"
          value={comprador || ""}
          onChange={(e) => setComprador(e.target.value)}
          busca
          readOnly={order.length > 0 && tipoTransferencia === "usuario"}
          options={data
            ?.filter((item: any) =>
              (item.name || "")?.toLowerCase()?.includes((comprador || "").toLowerCase()),
            )
            .map((item: any) => item.name)}
        />
        <InputX
          title="Data Hora"
          placeholder="AAAA-MM-DD HH:MM:SS"
          value={dataHora}
          onChange={handleDateTimeChange}
          readOnly={order.length > 0 && tipoTransferencia === "usuario"}
          required
        />
        <InputX
          title="Quantidade"
          placeholder="45.55"
          value={quantidade}
          onChange={handleQuantidadeChange}
          readOnly={order.length > 0 && tipoTransferencia === "usuario"}
          required
        />
        <InputX
          title="Valor"
          placeholder="R$ 5.000,01"
          value={valor}
          onChange={handleValorChange}
          readOnly={order.length > 0 && tipoTransferencia === "usuario"}
          required
        />
        <Select
          title="Ativo"
          placeholder="USDT"
          options={assetsOptions}
          value={ativo}
          onChange={(e) => setativo(e.target.value)}
          disabled={order.length > 0 && tipoTransferencia === "usuario"}
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
        {tipoTransferencia === "usuario" && (
          <>
            <Select
              title="Exchange"
              placeholder="Bybit"
              options={exchangeOptions.map((a) => a.split(" ")[0])}
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              disabled={order.length > 0 && tipoTransferencia === "usuario"}
              required
            />
            <InputX
              title="Usuário"
              placeholder="Registro do usuário na Exchange"
              value={usuario || ""}
              onChange={(e) => setUsuario(e.target.value)}
              busca
              readOnly={order.length > 0 && tipoTransferencia === "usuario"}
              options={data
                ?.filter((user: any) => user?.counterparty && user?.counterparty?.includes(usuario))
                .map((user: any) => user?.counterparty)}
            />
          </>
        )}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium">Adicionar Arquivo (PDF/Imagem)</label>
          <input
            type="file"
            accept="application/pdf,image/*"
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
                dataHora,
                quantidade,
                valor,
                ativo: ativo,
                exchange: ["exchange", "usuario"].includes(tipoTransferencia)
                  ? exchange
                  : undefined,
                uid: tipoTransferencia === "exchange" ? uid : undefined,
                wallet: tipoTransferencia === "wallet" ? wallet : undefined,
                endereco: tipoTransferencia === "wallet" ? endereco : undefined,
                usuario: tipoTransferencia === "usuario" ? usuario : undefined,
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
