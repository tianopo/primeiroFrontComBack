import React, { useEffect } from "react";
import { usePixConsultar } from "../../hooks/fiducia/usePixConsultar";
import { fmtDateTime, fmtTxValue } from "../../utils/transactions";

type Props = {
  endToEndId: string;
  onClear: () => void;
};

const labelRow = (label: string, value?: React.ReactNode) => (
  <li className="flex justify-between gap-4">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value ?? "-"}</span>
  </li>
);

export const PixEndToEndPanel: React.FC<Props> = ({ endToEndId, onClear }) => {
  const { data, isFetching, error } = usePixConsultar(endToEndId);

  // Suporta os dois formatos: {status, retorno} OU objeto direto
  const r: any = data && (data as any).retorno ? (data as any).retorno : data;
  const ok = !!r;

  useEffect(() => {
    if (data) console.log("[pix-consultar] endToEndId:", endToEndId, data);
  }, [data, endToEndId]);

  return (
    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-lg font-semibold">Consulta por EndToEnd</h4>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-blue-700">
            {endToEndId}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-blue-300 bg-white px-3 py-1 text-20 text-blue-700 hover:bg-blue-100"
            title="Voltar ao extrato"
          >
            Limpar / Voltar
          </button>
        </div>
      </div>

      {isFetching && <div className="text-20 text-gray-600">Consultando…</div>}

      {error && (
        <div className="text-20 text-red-600">
          Não foi possível consultar este EndToEnd no momento.
        </div>
      )}

      {!isFetching && !error && (
        <>
          {ok ? (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Identificação / Valor */}
              <div className="rounded-lg border border-white/60 bg-white p-3">
                <div className="mb-2 font-semibold">Identificação</div>
                <ul className="space-y-1 text-20">
                  {labelRow("EndToEnd ID", r?.endToEndId ?? r?.NumCtrlSTR)}
                  {labelRow("Valor lançamento", fmtTxValue(r?.valor_lancamento))}
                  {labelRow("Criado em", fmtDateTime(r?.created_at))}
                </ul>
              </div>

              {/* Débito */}
              <div className="rounded-lg border border-white/60 bg-white p-3">
                <div className="mb-2 font-semibold">Débito</div>
                <ul className="space-y-1 text-20">
                  {labelRow("Nome (Débito)", r?.nome_cliente_debito)}
                  {labelRow("CPF/CNPJ (Débito)", r?.cnpj_cpf_debito)}
                  {labelRow("Agência (Débito)", r?.agDebtd)}
                  {labelRow("Tipo Conta (Débito)", r?.tpCtDebitada)}
                  {labelRow("Conta (Débito)", r?.ctDebtd)}
                  {labelRow("Tipo Pessoa (Débito)", r?.TpPessoaDebtd ?? r?.tpPessoaDebtd)}
                </ul>
              </div>

              {/* Crédito */}
              <div className="rounded-lg border border-white/60 bg-white p-3">
                <div className="mb-2 font-semibold">Crédito</div>
                <ul className="space-y-1 text-20">
                  {labelRow("Nome (Crédito)", r?.nome_clienteCredtada)}
                  {labelRow("CPF/CNPJ (Crédito)", r?.cnpj_cpf_clienteCredtada)}
                  {labelRow("Agência (Crédito)", r?.agCredtda)}
                  {labelRow("Tipo Conta (Crédito)", r?.tpCtCredtda)}
                  {labelRow("Conta (Crédito)", r?.ctCredtda)}
                  {labelRow("Tipo Pessoa (Crédito)", r?.tpPessoaCredtda)}
                </ul>
              </div>

              {/* (Opcional) JSON bruto para depuração */}
              <div className="md:col-span-3">
                <details className="rounded-lg border border-white/60 bg-white p-3 text-20">
                  <summary className="cursor-pointer select-none font-semibold">
                    Ver JSON bruto
                  </summary>
                  <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                    {JSON.stringify(r, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="text-20 text-gray-700">
              {data ? "EndToEnd não encontrado." : "Informe um EndToEnd para consultar."}
            </div>
          )}
        </>
      )}
    </div>
  );
};
