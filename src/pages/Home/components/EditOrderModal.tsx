import React, { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";

interface IEditOrderModal {
  order: any;
  onClose: () => void;
  onSubmit: (data: {
    ativo: string;
    quantidade: string;
    valor: string;
    valorToken: string;
    taxa: string;
    tipo: "compras" | "vendas";
  }) => void;
}

export const EditOrderModal = ({ order, onClose, onSubmit }: IEditOrderModal) => {
  const [ativo, setAtivo] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [valorToken, setValorToken] = useState("");
  const [taxa, setTaxa] = useState("");
  const [tipo, setTipo] = useState<"compras" | "vendas">("compras");

  useEffect(() => {
    if (order) {
      setAtivo(order.ativo ?? "");
      setQuantidade(String(order.quantidade ?? ""));
      setValor(String(order.valor ?? ""));
      setValorToken(String(order.valorToken ?? ""));
      setTaxa(String(order.taxa ?? ""));
      setTipo(order.tipo === "vendas" ? "vendas" : "compras");
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ativo,
      quantidade,
      valor,
      valorToken,
      taxa,
      tipo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-[90vh] w-11/12 flex-col gap-3 overflow-y-auto rounded-lg bg-white p-4 shadow-lg md:w-1/2">
        <h4 className="mb-2 text-center text-lg font-semibold">
          Editar Ordem {order?.numeroOrdem}
        </h4>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <InputX title="Ativo" value={ativo} onChange={(e) => setAtivo(e.target.value)} required />

          <InputX
            title="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
          />

          <InputX
            title="Valor (BRL)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />

          <InputX
            title="Valor do Token"
            value={valorToken}
            onChange={(e) => setValorToken(e.target.value)}
            required
          />

          <InputX title="Taxa" value={taxa} onChange={(e) => setTaxa(e.target.value)} required />

          <div className="flex flex-col gap-1">
            <span className="text-12 font-medium">Tipo</span>
            <select
              className="h-9 rounded-6 border border-edge-primary px-2 text-14"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "compras" | "vendas")}
            >
              <option value="compras">Compras</option>
              <option value="vendas">Vendas</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-6 bg-variation-error px-4 py-2 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-6 bg-variation-confirmation px-4 py-2 text-white"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
