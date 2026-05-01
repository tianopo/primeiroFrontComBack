import { FormProvider } from "react-hook-form";
import { useGowdRefund } from "../../hooks/Gowd/useGowdRefund";

interface IGowdRefundQuickFormProps {
  defaultOrderId?: string;
}

export const GowdRefundQuickForm = ({ defaultOrderId }: IGowdRefundQuickFormProps) => {
  const { form, sendRefund, isPending, data } = useGowdRefund();
  const { register, handleSubmit, setValue } = form;

  const onSubmit = handleSubmit((values) => {
    sendRefund(values);
  });

  const fillExample = () => {
    setValue("orderId", defaultOrderId || "4c1e755d-876d-43c3-a7e7-1b18e257c9d2");
    setValue("externalId", `refund-4c1e755d-876d-43c3-a7e7-1b18e257c9d2-${new Date().getTime()}`);
    setValue("amount.currency", "BRL");
    setValue("amount.value", "500.00");
    setValue("refundCode", "RECEIVER_REQUEST");
    setValue("refundReason", "Solicitação do cliente");
    setValue("description", "Reembolso integral do Pix recebido");
  };

  return (
    <FormProvider {...form}>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">Reembolso GOWD</h3>

          <button
            type="button"
            onClick={fillExample}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            Preencher exemplo
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">OrderId</label>
            <input
              {...register("orderId")}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="UUID da ordem da GOWD"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ExternalId</label>
            <input
              {...register("externalId")}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Identificador externo do reembolso"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Moeda</label>
              <input
                {...register("amount.currency")}
                className="w-full rounded-md border border-gray-300 p-2"
                readOnly
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Valor</label>
              <input
                {...register("amount.value")}
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="25000.00"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">RefundCode</label>
            <input
              {...register("refundCode")}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="RECEIVER_REQUEST"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">RefundReason</label>
            <input
              {...register("refundReason")}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Solicitação do cliente"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descrição</label>
            <textarea
              {...register("description")}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={3}
              placeholder="Descrição do reembolso"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Enviando..." : "Enviar reembolso"}
          </button>
        </form>

        {data && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm">
            <div>
              <strong>ID:</strong> {data.id}
            </div>
            <div>
              <strong>Status:</strong> {data.status}
            </div>
            <div>
              <strong>EndToEnd:</strong> {data.endToEndId || "-"}
            </div>
            <div>
              <strong>Valor:</strong> {data?.amount?.currency} {data?.amount?.value}
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
};
