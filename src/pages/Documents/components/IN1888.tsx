import { Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { Modal } from "src/components/Modal/Modal";
import { assetsOptions, exchangeOptions } from "src/utils/selectsOptions";
import { handleRetiradaIN1888, handleTransferenciaIN1888 } from "../config/handleDownload";

interface IN1888Props {
  onClose: () => void;
}

export const IN1888 = ({ onClose }: IN1888Props) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const [data, setData] = useState<string>("");
  const [taxa, setTaxa] = useState<string>("");
  const [ativo, setativo] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [wallet, setWallet] = useState<string>("");

  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [retiradas, setRetiradas] = useState<any[]>([]);

  const limparCampos = () => {
    setData("");
    setTaxa("");
    setQuantidade("");
    setWallet("");
  };

  const handleAdicionar = () => {
    const novaEntrada = {
      data,
      taxas: taxa,
      criptoativo: ativo,
      quantidade,
      exchange,
      origemWallet: wallet,
    };

    if (activeTab === 1) {
      setTransferencias([...transferencias, novaEntrada]);
    } else {
      setRetiradas([...retiradas, novaEntrada]);
    }

    limparCampos();
  };

  const handleEmitir = () => {
    if (activeTab === 1) {
      handleTransferenciaIN1888(transferencias);
    } else {
      handleRetiradaIN1888(retiradas);
    }
  };

  const listaAtual = activeTab === 1 ? transferencias : retiradas;

  return (
    <Modal onClose={onClose}>
      <h3 className="text-28 font-bold">IN1888</h3>

      {/* Tabs */}
      <div className="mb-4 flex flex-col justify-center gap-4 md:flex-row">
        <button
          className={`rounded px-4 py-2 ${activeTab === 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab(1)}
        >
          Transferência
        </button>
        <button
          className={`rounded px-4 py-2 ${activeTab === 2 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab(2)}
        >
          Retirada
        </button>
      </div>

      {/* Formulário */}
      <div className="flex flex-col gap-3">
        <InputX
          title="Data"
          placeholder="DDMMAAAA"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
        <InputX
          title="Taxa"
          placeholder="0"
          value={taxa}
          onChange={(e) => setTaxa(e.target.value)}
          required
        />
        <Select
          title="Ativo Digital"
          placeholder="USDT"
          options={assetsOptions}
          value={ativo}
          onChange={(e) => setativo(e.target.value)}
          required
        />
        <InputX
          title="Quantidade"
          placeholder="50008.84"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
        />
        <Select
          title="Exchange"
          placeholder="Bybit https://www.bybit.com/ SG"
          options={exchangeOptions}
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          required
        />
        {activeTab === 1 && (
          <InputX
            title="Wallet"
            placeholder="EQ1BIZ8qYmskDzJmkGodYRTf_b9hckj6dZl"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            required
          />
        )}

        <div className="flex gap-4">
          <Button onClick={handleAdicionar}>Adicionar</Button>
          <Button onClick={handleEmitir} disabled={listaAtual.length === 0}>
            Emitir
          </Button>
        </div>
      </div>
      {/* Lista de entradas */}
      {listaAtual.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <h4 className="text-xl font-semibold">Entradas adicionadas</h4>
          {listaAtual.map((item, index) => (
            <div
              key={index}
              className="flex flex-row items-start justify-between rounded border bg-white p-3 shadow"
            >
              <div className="flex flex-col gap-2">
                <p>
                  <strong>Data:</strong> {item.data}
                </p>
                <p>
                  <strong>Taxa:</strong> {item.taxas}
                </p>
                <p>
                  <strong>Criptoativo:</strong> {item.criptoativo}
                </p>
                <p>
                  <strong>Quantidade:</strong> {item.quantidade}
                </p>
                <p>
                  <strong>Exchange:</strong> {item.exchange}
                </p>
                {activeTab === 1 && (
                  <p>
                    <strong>Wallet:</strong> {item.origemWallet}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  if (activeTab === 1) {
                    setTransferencias((prev) => prev.filter((_, i) => i !== index));
                  } else {
                    setRetiradas((prev) => prev.filter((_, i) => i !== index));
                  }
                }}
                className="cursor-pointer text-red-500 hover:text-red-700"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
