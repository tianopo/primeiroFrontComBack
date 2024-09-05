import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { formatCNPJ, formatCPF } from "src/utils/formats";
import { useCompliance } from "../hooks/useCompliance";

export const Compliance = () => {
  const [cpf, setCpf] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const { mutate, isPending, context } = useCompliance();
  const {
    formState: { errors },
    setValue,
  } = context;

  const handleCpfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setValue("cpf", formattedCPF);
    setCpf(formattedCPF);
  };

  const handleCnpjChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setValue("cnpj", formattedCNPJ);
    setCnpj(formattedCNPJ);
  };

  const handleSubmit = (data: any) => {
    mutate(data, {
      onSuccess: (data) => {
        setResponseData(data);
      },
    });
  };

  return (
    <FormProvider {...context}>
      <div className="flex h-fit w-[calc(50%-1rem)] flex-col">
        <FormX
          onSubmit={handleSubmit}
          className="flex flex-col flex-wrap justify-between gap-2 md:flex-row"
        >
          <h2>COMPLIANCE</h2>
          <InputX
            title="CPF"
            placeholder="XXX.XXX.XXX-XX"
            value={cpf}
            onChange={handleCpfChange}
            required
          />
          <InputX
            title="CNPJ"
            placeholder="XX.XXX.XXX/0001-XX"
            value={cnpj}
            onChange={handleCnpjChange}
          />
          <Button disabled={isPending || Object.keys(errors).length > 0}>Checar</Button>
        </FormX>
        {responseData && (
          <div>
            <h3>Dados da Consulta:</h3>
            {responseData?.pep && (
              <ul className="px-3">
                <h4 className="font-bold">Pessoa Politicamente Exposta - PEP</h4>
                <li>
                  <strong>Nome:</strong> {responseData.pep.nome.trim()}
                </li>
                <li>
                  <strong>CPF:</strong> {responseData.pep.cpf}
                </li>
                <li>
                  <strong>Sigla da Função:</strong> {responseData.pep.sigla_funcao.trim()}
                </li>
                <li>
                  <strong>Descrição da Função:</strong> {responseData.pep.descricao_funcao.trim()}
                </li>
                <li>
                  <strong>Nível da Função:</strong> {responseData.pep.nivel_funcao}
                </li>
                <li>
                  <strong>Código do Órgão:</strong> {responseData.pep.cod_orgao}
                </li>
                <li>
                  <strong>Nome do Órgão:</strong> {responseData.pep.nome_orgao.trim()}
                </li>
                <li>
                  <strong>Data de Início do Exercício:</strong>{" "}
                  {responseData.pep.dt_inicio_exercicio}
                </li>
                <li>
                  <strong>Data de Fim do Exercício:</strong>{" "}
                  {responseData.pep.dt_fim_exercicio || "Em exercício"}
                </li>
                <li>
                  <strong>Data de Fim da Carência:</strong>{" "}
                  {responseData.pep.dt_fim_carencia || "Não aplicável"}
                </li>
              </ul>
            )}
            {responseData?.cnpj && (
              <ul className="px-3">
                <h4 className="font-bold">CNPJ {responseData.cnpj.cnpj}</h4>
                <li>
                  <strong>Nome:</strong> {responseData.cnpj.nome}
                </li>
                <li>
                  <strong>Nome Fantasia:</strong> {responseData.cnpj.fantasia}
                </li>
                <li>
                  <strong>Data de Abertura:</strong> {responseData.cnpj.abertura}
                </li>
                <li>
                  <strong>Situação:</strong> {responseData.cnpj.situacao}
                </li>
                <li>
                  <strong>Tipo:</strong> {responseData.cnpj.tipo}
                </li>
                <li>
                  <strong>Porte:</strong> {responseData.cnpj.porte}
                </li>
                <li>
                  <strong>Natureza Jurídica:</strong> {responseData.cnpj.natureza_juridica}
                </li>
                <li>
                  <strong>Atividade Principal:</strong>{" "}
                  {responseData.cnpj.atividade_principal
                    .map((item: any) => `${item.code} - ${item.text}`)
                    .join(", ")}
                </li>
                <li>
                  <strong>Atividades Secundárias:</strong>{" "}
                  {responseData.cnpj.atividades_secundarias
                    .map((item: any) => `${item.code} - ${item.text}`)
                    .join(" ")}
                </li>
                <li>
                  <strong>Participantes:</strong>{" "}
                  {responseData.cnpj.qsa
                    .map((item: any) => `${item.nome} - ${item.qual}`)
                    .join(" / ")}
                </li>
                <li>
                  <strong>Endereço:</strong>{" "}
                  {`${responseData.cnpj.logradouro}, ${responseData.cnpj.numero} - ${responseData.cnpj.bairro}, ${responseData.cnpj.municipio} - ${responseData.cnpj.uf}, CEP: ${responseData.cnpj.cep}`}
                </li>
                <li>
                  <strong>Email:</strong> {responseData.cnpj.email}
                </li>
                <li>
                  <strong>Telefone:</strong> {responseData.cnpj.telefone}
                </li>
                <li>
                  <strong>Capital Social:</strong> {responseData.cnpj.capital_social}
                </li>
                <li>
                  <strong>Status:</strong> {responseData.cnpj.status}
                </li>
              </ul>
            )}
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </div>
        )}
      </div>
    </FormProvider>
  );
};
