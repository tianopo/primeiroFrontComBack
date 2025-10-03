import { XCircle } from "@phosphor-icons/react";
import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "src/components/Modal/Modal";
import { usePixDictLookup } from "../hooks/fiducia/usePixDictLookup";
import { usePixTransferir } from "../hooks/fiducia/usePixTransferir";

type TipoChave = 1 | 2 | 3 | 4 | 5;

const TIPO_CHAVE_OPTIONS: { value: TipoChave; label: string }[] = [
  { value: 1 as TipoChave, label: "CPF" },
  { value: 2 as TipoChave, label: "CNPJ" },
  { value: 3 as TipoChave, label: "Telefone" },
  { value: 4 as TipoChave, label: "E-mail" },
  { value: 5 as TipoChave, label: "Chave Aleatória (EVP)" },
];

// helpers
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const inferTipoPessoa = (doc: string): "F" | "J" => (onlyDigits(doc).length === 11 ? "F" : "J");

export const PixTransferModal = ({ onClose }: { onClose: () => void }) => {
  const [tipoChave, setTipoChave] = useState<TipoChave>(1);
  const [chavePix, setChavePix] = useState("");
  const [valor, setValor] = useState("");
  const [senhaTransacional, setSenhaTransacional] = useState("");

  const historico = "Pagamento";

  const chaveSanitizada = chavePix.trim();
  const { refetch, data: dictData, isFetching } = usePixDictLookup(chaveSanitizada);
  const { mutate: transferir, isPending } = usePixTransferir();

  const numericLen = onlyDigits(chaveSanitizada).length;

  // Busca DICT quando tiver >= 11 dígitos (debounce)
  useEffect(() => {
    if (numericLen < 11) return;
    const t = setTimeout(() => {
      refetch();
    }, 400);
    return () => clearTimeout(t);
  }, [numericLen, refetch]);

  // Se o DICT já disser o tipo de chave, sincroniza o select
  useEffect(() => {
    const tp = (dictData as any)?.retorno?.tpChave;
    if (tp) setTipoChave(tp as TipoChave);
  }, [dictData]);

  const isSuccess = (dictData as any)?.status === "sucesso" && (dictData as any)?.retorno;
  const retorno = (dictData as any)?.retorno;

  const isValid = useMemo(() => {
    const v = Number(String(valor).replace(/\./g, "").replace(",", "."));
    return !!chavePix && !!senhaTransacional && !Number.isNaN(v) && v > 0 && !!isSuccess;
  }, [chavePix, senhaTransacional, valor, isSuccess]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuccess) return;

    const numericValor = Number(String(valor).replace(/\./g, "").replace(",", "."));

    // Mapear retorno -> payload do backend
    const bancoCodigo = retorno?.banco?.numero_codigo
      ? Number(retorno.banco.numero_codigo)
      : retorno?.ispb
        ? Number(retorno.ispb)
        : 0;

    const payload = {
      tipo_iniciacao: 0,
      banco_destino: bancoCodigo, // mapeado do retorno.banco.numero_codigo (fallback ispb)
      agencia_destino: 1, // não fornecido pelo DICT (via chave não precisa)
      conta_destino: "", // não fornecido pelo DICT (via chave não precisa)
      cpfcnpj_destino: retorno?.cpfCnpj || "",
      nome_razaosocial_destino: retorno?.nomeFantasia || retorno?.nome || "",
      tipo_pessoa_destino: inferTipoPessoa(retorno?.cpfCnpj || ""), // F/J a partir do doc
      tipo_conta_destino: "CC", // default (ajuste se seu backend requer algo específico)
      tipo_chave: tipoChave,
      chave_pix: chaveSanitizada,
      qrcode_payload: null,
      valor: numericValor,
      historico,
      transational_password: senhaTransacional,
    };

    transferir(payload, {
      onSuccess: () => {
        setChavePix("");
        setValor("");
        setSenhaTransacional("");
        onClose();
      },
    });
  };
  console.log(dictData);
  return (
    <Modal onClose={onClose} fit>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Nova transferência PIX</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XCircle size={22} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-3 grid gap-3 md:grid-cols-2">
        {/* Tipo de chave */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Tipo de chave</label>
          <select
            value={tipoChave}
            onChange={(e) => setTipoChave(Number(e.target.value) as TipoChave)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          >
            {TIPO_CHAVE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chave PIX */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Chave PIX</label>
          <input
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
            placeholder="Digite ou cole a chave PIX"
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
          <small className="mt-1 text-xs text-gray-500">
            {numericLen >= 11
              ? isFetching
                ? "Validando DICT..."
                : isSuccess
                  ? "DICT validado."
                  : "Chave não encontrada no DICT."
              : "Digite/cole ao menos 11 caracteres para validar via DICT."}
          </small>
        </div>

        {/* Valor */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Valor</label>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
          <small className="mt-1 text-xs text-gray-500">Use vírgula para centavos.</small>
        </div>

        {/* Senha transacional */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Senha transacional</label>
          <input
            value={senhaTransacional}
            onChange={(e) => setSenhaTransacional(e.target.value)}
            type="password"
            placeholder="••••••"
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>

        {/* Destinatário (dados legíveis a partir do DICT) */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:col-span-2">
          <div className="mb-2 text-sm font-semibold">Destinatário (DICT)</div>
          {numericLen < 11 ? (
            <p className="text-sm text-gray-500">Digite/cole ao menos 11 caracteres.</p>
          ) : isFetching ? (
            <p className="text-sm text-gray-500">Consultando…</p>
          ) : isSuccess ? (
            <ul className="text-sm leading-6">
              <li>
                <strong>Nome:</strong> {retorno?.nome || "-"}
              </li>
              <li>
                <strong>Nome fantasia:</strong> {retorno?.nomeFantasia || "-"}
              </li>
              <li>
                <strong>CPF/CNPJ:</strong> {retorno?.cpfCnpj || "-"}{" "}
                <span className="text-xs text-gray-500">
                  (
                  {inferTipoPessoa(retorno?.cpfCnpj || "") === "F"
                    ? "Pessoa Física"
                    : "Pessoa Jurídica"}
                  )
                </span>
              </li>
              <li>
                <strong>Banco:</strong>{" "}
                {retorno?.banco?.nome_reduzido
                  ? `${retorno.banco.nome_reduzido} (${retorno.banco.numero_codigo || "-"})`
                  : "-"}
              </li>
              <li>
                <strong>ISPB:</strong> {retorno?.banco?.ispb || retorno?.ispb || "-"}
              </li>
              <li>
                <strong>EndToEnd ID:</strong> {retorno?.endToEndId || "-"}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-red-600">Não foi possível validar a chave no DICT.</p>
          )}
        </div>

        {/* Ações */}
        <div className="mt-1 flex items-center justify-end gap-2 md:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isValid || isPending}
          >
            {isPending ? "Enviando…" : "Enviar PIX"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
