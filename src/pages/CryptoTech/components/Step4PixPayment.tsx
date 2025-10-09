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
  nomeCompleto: string;
  cpfOuCnpj: string;
  quantidadeFiat: string;

  pixReceiverKey: string;
  solicitacaoPagador?: string | null;
  modalidadeAlteracao?: number;
  expiracaoSegundos?: number;
  identificador?: string;
  dadosAdicionaisNome?: string;
  dadosAdicionaisValor?: string;
  reutilizavel?: boolean;
  /** ⚠️ Deixe em 2 para vir imagem do backend */
  formato?: number;

  onBack: () => void;
  onFinish?: () => void;
};

// ---------------- helpers ----------------

/** Gera data URL para PNG base64 */
const dataUrlFromBase64 = (b64?: string | null) => {
  if (!b64) return "";
  if (b64.startsWith("data:image")) return b64;
  return `data:image/png;base64,${b64}`;
};

/** Gera data URL para SVG (string) */
const dataUrlFromSvg = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/** Tenta extrair payload e imagem do objeto retorno, cobrindo várias chaves comuns */
function pickQrFields(ret: any): { payload: string; imgDataUrl: string } {
  // payload
  const payload =
    ret?.qrcode_payload ??
    ret?.copia_e_cola ??
    ret?.payload ??
    (ret?.payloadBase64 ? safeAtob(ret.payloadBase64) : "") ??
    "";

  // imagem (vários formatos)
  const rawImg =
    ret?.imagem ??
    ret?.imagem_base64 ??
    ret?.qrCodeBase64 ??
    ret?.qrCodeImageBase64 ??
    ret?.qrcode_png_base64 ??
    ret?.imagemPNGBase64 ??
    ret?.imagemBase64 ??
    ret?.qr_image ??
    ret?.qrImage ??
    ret?.image ??
    "";

  // se for SVG em string
  if (typeof rawImg === "string" && rawImg.trim().startsWith("<svg")) {
    return { payload, imgDataUrl: dataUrlFromSvg(rawImg) };
  }

  // se veio em base64 (sem prefixo)
  if (typeof rawImg === "string" && rawImg && !rawImg.startsWith("http")) {
    return { payload, imgDataUrl: dataUrlFromBase64(rawImg) };
  }

  // se a API já retornou data-url
  if (typeof rawImg === "string" && rawImg.startsWith("data:image")) {
    return { payload, imgDataUrl: rawImg };
  }

  // se veio como URL pública (raro neste fluxo), usamos direto
  if (typeof rawImg === "string" && /^https?:\/\//.test(rawImg)) {
    return { payload, imgDataUrl: rawImg };
  }

  return { payload, imgDataUrl: "" };
}

function safeAtob(s: string): string {
  try {
    return atob(s);
  } catch {
    return "";
  }
}

// -----------------------------------------

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
  /** 🔴 MUDA O DEFAULT PARA 2 (queremos imagem do backend) */
  formato = 2,
  onBack,
  onFinish,
}) => {
  const [err, setErr] = useState<string | null>(null);

  const [idDocumento, setIdDocumento] = useState<string>("");
  const [payload, setPayload] = useState<string>("");
  const [imgDataUrl, setImgDataUrl] = useState<string>("");

  const [status, setStatus] = useState<string>("—");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");

  const [txidUsado, setTxidUsado] = useState<string>("");

  const { mutateAsync: gerar, isPending: isGenerating } = usePixGerarQrCodeDinamico();
  const { mutateAsync: buscar, isPending: isChecking } = usePixBuscarQrCode();

  // valor sanitizado (ex: "1234.56")
  const valorAPI = useMemo(() => sanitizeValor(quantidadeFiat), [quantidadeFiat]);

  const buildSanitizedBody = (): GerarQrCodeBody => {
    const txid = sanitizeTxId(identificador);
    setTxidUsado(txid);

    return {
      chave: sanitizeKey(pixReceiverKey),
      solicitacao_pagador: sanitizeTextOrNull(solicitacaoPagador),
      cpf_cnpj_pagador: sanitizeDoc(cpfOuCnpj),
      nome_pagador: String(nomeCompleto ?? "").trim(),
      valor: valorAPI,
      modalidade_alteracao: Number.isFinite(Number(modalidadeAlteracao))
        ? Number(modalidadeAlteracao)
        : 0,
      expiracao_QR: sanitizeExpiracao(expiracaoSegundos),
      identificador: txid,
      dados_adicionais_nome: sanitizeTextOrNull(dadosAdicionaisNome) ?? undefined,
      dados_adicionais_valor: sanitizeTextOrNull(dadosAdicionaisValor) ?? undefined,
      reutilizavel: !!reutilizavel,
      /** 🔴 força 2 se não vier válido */
      formato: sanitizeFormato(formato) === 2 ? 2 : 2,
    };
  };

  const oneShotStatusRef = useRef(false);

  const gerarQrCode = async () => {
    setErr(null);
    setIdDocumento("");
    setPayload("");
    setImgDataUrl("");
    setStatus("—");
    oneShotStatusRef.current = false;

    const body = buildSanitizedBody();

    try {
      const data = await gerar(body);
      const ret = (data as any)?.retorno ?? data;

      const id =
        ret?.id_documento ?? ret?.idDocumento ?? ret?.documentoId ?? ret?.id ?? ret?.qrcodeId ?? "";
      const picked = pickQrFields(ret);

      setIdDocumento(id);
      if (picked.payload) setPayload(picked.payload);
      if (picked.imgDataUrl) setImgDataUrl(picked.imgDataUrl);

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

      const picked = pickQrFields(ret);
      if (!payload && picked.payload) setPayload(picked.payload);
      if (!imgDataUrl && picked.imgDataUrl) setImgDataUrl(picked.imgDataUrl);
    } catch {
      /* silencioso */
    }
  };

  // gera ao montar
  useEffect(() => {
    gerarQrCode();
  }, []);

  // one-shot: se não veio payload/imagem, tenta buscar uma vez
  useEffect(() => {
    if (!idDocumento) return;
    if (payload || imgDataUrl) return;
    if (oneShotStatusRef.current) return;
    oneShotStatusRef.current = true;
    const t = setTimeout(() => buscarStatus(), 800);
    return () => clearTimeout(t);
  }, [idDocumento, payload, imgDataUrl]);

  // 🔁 Fallback local: se tiver payload e NENHUMA imagem, gera PNG no cliente (lazy import)
  useEffect(() => {
    const makeLocalQr = async () => {
      if (!payload || imgDataUrl) return;
      try {
        const QR = await import("qrcode"); // npm i qrcode
        const url = await QR.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 6,
          // sem cor custom pra manter padrão do projeto
        });
        setImgDataUrl(url);
      } catch {
        // se não tiver a lib, segue só com copia/cola
      }
    };
    makeLocalQr();
  }, [payload, imgDataUrl]);

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
      <h4>Pagamento via PIX</h4>
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
                className="h-40 w-full rounded border border-gray-300 bg-black p-2 text-xs text-white"
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
                </div>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="rounded-6 border-edge-primary bg-white/15 p-5 text-sm">
            <div className="mb-2 font-semibold">Resumo</div>
            <ul className="leading-7">
              <li>
                <strong>Pagador:</strong> {String(nomeCompleto ?? "").trim()} —{" "}
                {sanitizeDoc(cpfOuCnpj)}
              </li>
              <li>
                <strong>Valor:</strong>{" "}
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
