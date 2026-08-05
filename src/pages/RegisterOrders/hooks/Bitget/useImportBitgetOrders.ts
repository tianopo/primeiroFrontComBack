import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { BitgetApiResponse, BitgetOrdersPage, BitgetP2POrder } from "./bitgetOrders.types";

export type ImportBitgetOrdersParams = {
  startDate: string;
  endDate: string;
  keyType?: "pessoal" | "empresa";
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const startOfDayMs = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Data inicial inválida.");
  }

  return String(parsed.getTime());
};

const endOfDayMs = (date: string): string => {
  const parsed = new Date(`${date}T23:59:59.999`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Data final inválida.");
  }

  return String(parsed.getTime());
};

const differenceInDays = (startDate: string, endDate: string): number => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59.999`);

  return (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
};

const fetchAllCompletedOrders = async ({
  startDate,
  endDate,
  keyType = "pessoal",
}: ImportBitgetOrdersParams): Promise<BitgetP2POrder[]> => {
  if (!startDate || !endDate) {
    throw new Error("Informe a data inicial e a data final.");
  }

  const days = differenceInDays(startDate, endDate);

  if (days < 0) {
    throw new Error("A data final não pode ser anterior à data inicial.");
  }

  /*
   * A documentação informa que uma consulta individual
   * não pode ultrapassar 30 dias.
   */
  if (days > 31) {
    throw new Error("O intervalo máximo por consulta é de 31 dias.");
  }

  const orders: BitgetP2POrder[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    const response = await api().get<BitgetApiResponse<BitgetOrdersPage>>(
      apiRoute.bitgetAllOrders,
      {
        params: {
          startTime: startOfDayMs(startDate),
          endTime: endOfDayMs(endDate),
          status: "completed",
          limit: "10",
          cursor,
          keyType,
        },
      },
    );

    const pageItems = Array.isArray(response.data?.data?.items) ? response.data.data.items : [];

    orders.push(...pageItems.filter((item) => String(item.status).toLowerCase() === "completed"));

    const nextId = String(response.data?.data?.nextId ?? "").trim();

    cursor = nextId || undefined;
    page += 1;

    if (cursor) {
      /*
       * A API permite 10 chamadas por segundo.
       * O intervalo de 250 ms mantém a importação leve.
       */
      await sleep(250);
    }

    /*
     * Proteção contra paginação infinita.
     */
    if (page >= 500) {
      throw new Error("A importação foi interrompida por excesso de páginas.");
    }
  } while (cursor);

  return Array.from(new Map(orders.map((order) => [String(order.orderId), order])).values());
};

export const useImportBitgetOrders = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: fetchAllCompletedOrders,
    onError: (error: AxiosError) => {
      responseError(error);
    },
  });

  return {
    importBitgetOrders: mutateAsync,
    isPending,
  };
};
