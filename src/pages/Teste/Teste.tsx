import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FlexRow } from "src/components/Flex/FlexRow";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { IMultaDto, useSendMulta } from "src/hooks/API/useSendMulta";

export const Test = () => {
  const { mutate, isPending, context } = useSendMulta();

  const {
    formState: { errors },
    reset,
  } = context;

  const onSubmit = (data: IMultaDto) => {
    mutate(data);
  };

  return (
    <FlexCol className="w-full p-4">
      <FlexRow>
        <i>Notificação de desconto de multa</i>
      </FlexRow>
      <FormProvider {...context}>
        <FormX onSubmit={onSubmit}>
          <div className="flex w-full flex-col gap-2">
            <InputX title="Nome" placeholder="Nome" required />
            <InputX title="CPF" placeholder="CPF" required />
            <InputX title="E-mail" placeholder="kauane@hotmail.com" required />
            <InputX title="CNH" placeholder="CNH" required />
            <InputX title="Categoria" placeholder="Categoria" required />
            <InputX title="Validade" placeholder="Validade" required />
            <InputX title="Tipo Desconto" placeholder="Tipo de Desconto" required />
            <InputX title="Numero Auto Infração" placeholder="Auto de Infração" required />
            <InputX title="Data Infração" placeholder="Data da Infração" required />
            <InputX title="Hora Infração" placeholder="Hora da Infração" required />
            <InputX title="Local Infração" placeholder="Local da Infração" required />
            <InputX title="Placa Veículo" placeholder="Placa do Veículo" required />
            <InputX title="Marca Modelo Ano" placeholder="Marca/Modelo/Ano" required />
            <InputX title="Tipo Veículo" placeholder="Tipo de Veículo" required />
            <InputX title="Valor Multa" placeholder="Valor da Multa" required />
            <InputX title="Prazo Recurso" placeholder="Prazo para Recurso" required />
            <Button disabled={isPending || Object.keys(errors).length > 0}>
              {!isPending ? "salvar" : "loading..."}
            </Button>
          </div>
        </FormX>
      </FormProvider>
    </FlexCol>
  );
};
