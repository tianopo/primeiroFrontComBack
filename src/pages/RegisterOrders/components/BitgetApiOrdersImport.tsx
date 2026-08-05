// components/BitgetApiOrdersImport.tsx

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { useImportBitgetOrders } from "../hooks/Bitget/useImportBitgetOrders";
import { mapBitgetApiOrders } from "../Utils/mapBitgetApiOrders";

interface BitgetApiOrdersImportProps {
  formData: any[];
  setFormData: Dispatch<SetStateAction<any[]>>;
}

export const BitgetApiOrdersImport = ({ formData, setFormData }: BitgetApiOrdersImportProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyType, setKeyType] = useState<"pessoal" | "empresa">("pessoal");

  const { importBitgetOrders, isPending } = useImportBitgetOrders();

  const handleImport = async () => {
    if (!startDate || !endDate) {
      toast.error("Informe a data inicial e a data final.");
      return;
    }

    try {
      const apiOrders = await importBitgetOrders({
        startDate,
        endDate,
        keyType,
      });

      const mappedOrders = mapBitgetApiOrders(apiOrders);

      if (mappedOrders.length === 0) {
        toast.info("Nenhuma ordem concluída foi encontrada no período.");
        return;
      }

      const currentKeys = new Set(
        formData.map((item) => `${String(item.numeroOrdem)}|${String(item.exchange)}`),
      );

      const newOrders = mappedOrders.filter(
        (item) => !currentKeys.has(`${item.numeroOrdem}|${item.exchange}`),
      );

      if (newOrders.length === 0) {
        toast.info("Todas as ordens encontradas já estão na lista.");
        return;
      }

      setFormData((current) => [...current, ...newOrders]);

      toast.success(`${newOrders.length} ordem(ns) concluída(s) da Bitget adicionada(s).`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao importar ordens da Bitget.";

      toast.error(message);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-6 border border-gray-200 p-4">
      <h3 className="text-18 font-bold">Importar ordens pela API da Bitget</h3>

      <p className="text-14 text-gray-600">
        Serão importadas apenas ordens concluídas, em páginas de 10 registros.
      </p>

      <div className="flex w-full flex-col gap-3 md:flex-row">
        <InputX
          title="Data inicial"
          typ="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />

        <InputX
          title="Data final"
          typ="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />

        <Select
          title="Conta Bitget"
          value={keyType}
          options={["pessoal", "empresa"]}
          onChange={(event) => setKeyType(event.target.value as "pessoal" | "empresa")}
        />
      </div>

      <Button onClick={handleImport} disabled={isPending || !startDate || !endDate}>
        {isPending ? "Buscando ordens..." : "Buscar ordens concluídas"}
      </Button>
    </div>
  );
};
