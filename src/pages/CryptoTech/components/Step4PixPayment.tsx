import { ArrowLeft, CheckCircle, Copy, Timer, XCircle } from "@phosphor-icons/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { usePixBuscarQrCode } from "../hook/usePixBuscarQrCode";
import { GerarQrCodeBody, usePixGerarQrCodeDinamico } from "../hook/usePixGerarQrCodeDinamico";
import {
  sanitizeDoc,
  sanitizeExpiracao,
  sanitizeFormato,
  sanitizeKey,
  sanitizeTextOrNull,
  sanitizeTxId,
  sanitizeValor,
} from "../utils/sanitizadores";

type Step4PixPaymentProps = {
  // Step 2 (pagador)
  nomeCompleto: string;
  cpfOuCnpj: string;

  // Step 1/3 - valor pode vir "123,45" ou "123.45"
  quantidadeFiat: string;

  // Campos do JSON (todos):
  pixReceiverKey: string; // chave
  solicitacaoPagador?: string | null; // solicitacao_pagador
  modalidadeAlteracao?: number; // modalidade_alteracao
  expiracaoSegundos?: number; // expiracao_QR
  identificador?: string; // identificador
  dadosAdicionaisNome?: string; // dados_adicionais_nome
  dadosAdicionaisValor?: string; // dados_adicionais_valor
  reutilizavel?: boolean; // reutilizavel
  formato?: number; // formato (1 ou 2)

  // callbacks
  onBack: () => void;
  onFinish?: () => void;
};

const dataUrlFromBase64 = (b64?: string | null) => {
  if (!b64) return "";
  if (b64.startsWith("data:image")) return b64;
  return `data:image/png;base64,${b64}`;
};

export const Step4PixPayment: React.FC<Step4PixPaymentProps> = ({
  nomeCompleto,
  cpfOuCnpj,
  quantidadeFiat,
  pixReceiverKey,
  solicitacaoPagador = null,
  modalidadeAlteracao = 0,
  expiracaoSegundos = 3600,
  identificador,
  dadosAdicionaisNome,
  dadosAdicionaisValor,
  reutilizavel = false,
  formato = 1,
  onBack,
  onFinish,
}) => {
  const [err, setErr] = useState<string | null>(null);

  const [idDocumento, setIdDocumento] = useState<string>("");
  const [payload, setPayload] = useState<string>("");
  const [imgDataUrl, setImgDataUrl] = useState<string>("");

  const [status, setStatus] = useState<string>("—");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");

  // Guardamos o TXID realmente usado (sanitizado) para mostrar no resumo
  const [txidUsado, setTxidUsado] = useState<string>("");

  const { mutateAsync: gerar, isPending: isGenerating } = usePixGerarQrCodeDinamico();
  const { mutateAsync: buscar, isPending: isChecking } = usePixBuscarQrCode();

  // Valor já sanitizado para API
  const valorAPI = useMemo(() => sanitizeValor(quantidadeFiat), [quantidadeFiat]);

  // 1) BODY sanitizado
  const buildSanitizedBody = (): GerarQrCodeBody => {
    const txid = sanitizeTxId(identificador);
    setTxidUsado(txid);

    return {
      chave: sanitizeKey(pixReceiverKey),
      solicitacao_pagador: sanitizeTextOrNull(solicitacaoPagador),
      cpf_cnpj_pagador: sanitizeDoc(cpfOuCnpj),
      nome_pagador: String(nomeCompleto ?? "").trim(),
      valor: valorAPI, // “1234.56”
      modalidade_alteracao: Number.isFinite(Number(modalidadeAlteracao))
        ? Number(modalidadeAlteracao)
        : 0,
      expiracao_QR: sanitizeExpiracao(expiracaoSegundos),
      identificador: txid,
      dados_adicionais_nome: sanitizeTextOrNull(dadosAdicionaisNome) ?? undefined,
      dados_adicionais_valor: sanitizeTextOrNull(dadosAdicionaisValor) ?? undefined,
      reutilizavel: !!reutilizavel,
      formato: sanitizeFormato(formato),
    };
  };

  // Flag para rodar o “one-shot status check” apenas uma vez
  const oneShotStatusRef = useRef(false);

  const gerarQrCode = async () => {
    setErr(null);
    setIdDocumento("");
    setPayload("");
    setImgDataUrl("");
    setStatus("—");
    oneShotStatusRef.current = false; // reset do one-shot

    const body = buildSanitizedBody();

    try {
      const data = await gerar(body);
      const ret = (data as any)?.retorno ?? data;

      const id =
        ret?.id_documento ?? ret?.idDocumento ?? ret?.documentoId ?? ret?.id ?? ret?.qrcodeId ?? "";

      // payload pode vir de várias formas
      let pay = ret?.qrcode_payload ?? ret?.copia_e_cola ?? ret?.payload ?? "";

      if (!pay && ret?.payloadBase64) {
        try {
          pay = atob(ret.payloadBase64);
        } catch {
          /* ignore */
        }
      }

      const img =
        ret?.imagem ?? ret?.imagem_base64 ?? ret?.qrCodeBase64 ?? ret?.qrCodeImageBase64 ?? "";

      if (!pay) {
        // Mesmo sem payload retornado, seguimos — o one-shot abaixo fará uma busca.
        setIdDocumento(id);
        setPayload("");
        setImgDataUrl("");
        setStatus("EM_ABERTO");
        setUltimaAtualizacao(new Date().toLocaleString("pt-BR"));
        return;
      }

      setIdDocumento(id);
      setPayload(pay);
      setImgDataUrl(
        img ? (img.startsWith("data:image") ? img : `data:image/png;base64,${img}`) : "",
      );
      setStatus("EM_ABERTO");
      setUltimaAtualizacao(new Date().toLocaleString("pt-BR"));
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? "Erro ao gerar QR Code");
    }
  };

  const buscarStatus = async () => {
    if (!idDocumento) return;
    try {
      const data = await buscar({ id_documento: idDocumento });
      const ret = (data as any)?.retorno ?? data;
      const sit = ret?.situacao ?? ret?.status ?? "—";
      setStatus(String(sit));
      setUltimaAtualizacao(new Date().toLocaleString("pt-BR"));

      // Alguns backends passam payload/qr somente depois:
      const payFromSearch = ret?.qrcode_payload ?? ret?.copia_e_cola ?? ret?.payload ?? "";
      if (!payload && payFromSearch) setPayload(payFromSearch);

      const img =
        ret?.imagem ?? ret?.imagem_base64 ?? ret?.qrCodeBase64 ?? ret?.qrCodeImageBase64 ?? "";
      if (!imgDataUrl && img) {
        setImgDataUrl(img.startsWith("data:image") ? img : `data:image/png;base64,${img}`);
      }
    } catch {
      // silencioso (só não derruba tela)
    }
  };

  // Gera ao montar
  useEffect(() => {
    gerarQrCode();
  }, []);

  // 2) ONE-SHOT: se não veio nem payload nem imagem, faz UMA consulta de status
  useEffect(() => {
    if (!idDocumento) return;
    if (payload || imgDataUrl) return; // já temos algo para exibir
    if (oneShotStatusRef.current) return; // já fizemos a tentativa única
    oneShotStatusRef.current = true;

    // pequena folga pro provedor “preparar” o registro
    const t = setTimeout(() => {
      buscarStatus();
    }, 800);

    return () => clearTimeout(t);
  }, [idDocumento, payload, imgDataUrl]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("Copiado !");
    } catch {
      /* ignore */
    }
  };

  const loading = isGenerating;
  const paid = status?.toUpperCase().includes("LIQ") || status?.toUpperCase().includes("CONFIR");

  return (
    <div className="label-buy container-opacity-light flex w-full max-w-[950px] flex-col gap-6 text-justify font-extrabold">
      <div className="flex items-center justify-between">
        <h4>Pagamento via PIX</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="button-colorido-buy !bg-gray-700 hover:opacity-80"
            type="button"
          >
            <ArrowLeft weight="bold" /> Voltar
          </button>
          {onFinish && (
            <button onClick={onFinish} className="button-colorido-buy" type="button">
              Concluir
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-6 border-edge-primary bg-white/20 p-6 text-center">
          Gerando QR Code…
        </div>
      ) : err ? (
        <div className="rounded-6 border border-red-300 bg-red-50 p-4 text-red-700">
          <div className="mb-2 flex items-center gap-2">
            <XCircle size={18} />
            <span>Erro ao gerar QR Code</span>
          </div>
          <pre className="whitespace-pre-wrap text-xs">{String(err)}</pre>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center rounded-6 border-edge-primary bg-white/15 p-5">
              <div className="mb-3 font-semibold">Escaneie com o app do seu banco</div>
              {imgDataUrl ? (
                <img
                  src={imgDataUrl}
                  alt="PIX QR Code"
                  className="h-auto w-[240px] rounded bg-white p-2 shadow"
                />
              ) : (
                <div className="w-full rounded bg-white/60 p-4 text-center text-sm text-gray-700">
                  Use o “PIX Copia e Cola” ao lado.
                </div>
              )}
            </div>

            {/* PIX Copia e Cola */}
            <div className="rounded-6 border-edge-primary bg-white/15 p-5">
              <div className="mb-2 font-semibold">PIX Copia e Cola</div>
              <textarea
                readOnly
                className="h-40 w-full rounded border border-gray-300 bg-black p-2 text-xs"
                value={payload}
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-6 border px-3 py-2 text-sm hover:bg-gray-100"
                  title="Copiar para a área de transferência"
                >
                  <Copy size={16} className="mr-1 inline-block" /> Copiar
                </button>

                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Timer size={14} /> Atualização: {ultimaAtualizacao || "—"}
                </div>
              </div>

              {/* Status + controles */}
              <div className="mt-4 flex items-center justify-between rounded bg-white/50 p-3">
                <div className="flex items-center gap-2">
                  {paid ? (
                    <CheckCircle size={18} className="text-green-600" />
                  ) : (
                    <Timer size={18} className="text-gray-700" />
                  )}
                  <div className="text-sm">
                    <div className="font-semibold">Status: {status.replace("_", " ")}</div>
                    {paid && <div className="text-xs text-green-700">Pagamento confirmado.</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={buscarStatus}
                    disabled={!idDocumento || isChecking}
                    className="rounded-6 border px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Atualizar status agora"
                  >
                    Atualizar
                  </button>
                  {/* Removido o Auto-atualizar porque não há mais polling */}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo com TODOS os campos enviados (já sanitizados) */}
          <div className="rounded-6 border-edge-primary bg-white/15 p-5 text-sm">
            <div className="mb-2 font-semibold">Resumo</div>
            <ul className="leading-7">
              <li>
                <strong>Pagador:</strong> {String(nomeCompleto ?? "").trim()} —{" "}
                {sanitizeDoc(cpfOuCnpj)}
              </li>
              <li>
                <strong>Valor:</strong> R{"$ "}
                {Number(valorAPI).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </li>
              <li>
                <strong>Chave recebedora:</strong> {sanitizeKey(pixReceiverKey)}
              </li>
              <li>
                <strong>Solicitação do pagador:</strong>{" "}
                {sanitizeTextOrNull(solicitacaoPagador) ?? "—"}
              </li>
              <li>
                <strong>Expiração (s):</strong> {sanitizeExpiracao(expiracaoSegundos)}
              </li>
              <li>
                <strong>Identificador (TXID):</strong> {txidUsado || "(gerado automaticamente)"}
              </li>
              {idDocumento && (
                <li>
                  <strong>ID do documento:</strong> {idDocumento}
                </li>
              )}
            </ul>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="button-colorido-buy !bg-gray-700 hover:opacity-80"
          type="button"
        >
          <ArrowLeft weight="bold" /> Voltar
        </button>
        {onFinish && (
          <button onClick={onFinish} className="button-colorido-buy" type="button">
            Concluir
          </button>
        )}
      </div>
    </div>
  );
};
