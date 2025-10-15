import { ArrowLeft, CheckCircle, Copy, Timer, XCircle } from "@phosphor-icons/react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { formatCurrency, formatDateTime } from "src/utils/formats";
import { useCreateOrder } from "../../hook/useCreateOrder";
import { usePixBuscarQrCode } from "../../hook/usePixBuscarQrCode";
import { GerarQrCodeBody, usePixGerarQrCodeDinamico } from "../../hook/usePixGerarQrCodeDinamico";
import { useWhatsappClient } from "../../hook/useWhatsappClient";
import {
  pickQrFields,
  sanitizeDoc,
  sanitizeFormato,
  sanitizeKey,
  sanitizeTextOrNull,
  sanitizeTxId,
} from "../../utils/sanitizadores";

interface IStep4PixPayment {
  nomeCompleto: string;
  cpfOuCnpj: string;
  quantidadeFiat: string;
  quantidadeAtivo: string;
  pixReceiverKey: string;
  solicitacaoPagador?: string | null;
  modalidadeAlteracao?: number;
  expiracaoSegundos?: number;
  identificador?: string;
  dadosAdicionaisNome?: string;
  dadosAdicionaisValor?: string;
  reutilizavel?: boolean;
  formato?: number;
  whatsapp: string;
  ativo: string;
  onBack: () => void;
}

export const Step4PixPayment = ({
  nomeCompleto,
  cpfOuCnpj,
  quantidadeFiat,
  quantidadeAtivo,
  pixReceiverKey,
  solicitacaoPagador = null,
  modalidadeAlteracao = 0,
  expiracaoSegundos = 3600,
  identificador,
  dadosAdicionaisNome,
  dadosAdicionaisValor,
  reutilizavel = false,
  formato = 2,
  whatsapp,
  ativo,
  onBack,
}: IStep4PixPayment) => {
  const [err, setErr] = useState<string | null>(null);
  const [idDocumento, setIdDocumento] = useState("");
  const [payload, setPayload] = useState("");
  const [imgDataUrl, setImgDataUrl] = useState("");
  const [status, setStatus] = useState("—");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");
  const [txidUsado, setTxidUsado] = useState("");
  const { mutateAsync: gerar, isPending: isGenerating } = usePixGerarQrCodeDinamico();
  const { mutateAsync: buscar, isPending: isChecking } = usePixBuscarQrCode();
  const oneShotRef = useRef(false);
  const valorAPI = useMemo(() => quantidadeFiat.replace(",", "."), [quantidadeFiat]);
  const { openWhatsappWithText, shareTextAndImage } = useWhatsappClient();
  const { createOrder, creatingOrder } = useCreateOrder();
  const orderCreatedRef = useRef(false);

  const body = (): GerarQrCodeBody => {
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
      expiracao_QR: expiracaoSegundos,
      identificador: txid,
      dados_adicionais_nome: sanitizeTextOrNull(dadosAdicionaisNome) ?? undefined,
      dados_adicionais_valor: sanitizeTextOrNull(dadosAdicionaisValor) ?? undefined,
      reutilizavel: !!reutilizavel,
      formato: sanitizeFormato(formato) === 2 ? 2 : 2,
    };
  };

  const gerarQrCode = async () => {
    setErr(null);
    setIdDocumento("");
    setPayload("");
    setImgDataUrl("");
    setStatus("—");
    oneShotRef.current = false;

    try {
      const data = await gerar(body());
      const ret = (data as any)?.retorno ?? data;

      const id =
        ret?.id_documento ?? ret?.idDocumento ?? ret?.documentoId ?? ret?.id ?? ret?.qrcodeId ?? "";

      const { payload: pay, imgDataUrl: img } = pickQrFields(ret);

      setIdDocumento(id);
      if (pay) setPayload(pay);
      if (img) setImgDataUrl(img);
      setStatus("EM_ABERTO");
      setUltimaAtualizacao(new Date().toLocaleString("pt-BR"));

      // ⬇️⬇️⬇️ INSIRA AQUI o bloco de criação da ordem ⬇️⬇️⬇️
      try {
        if (!orderCreatedRef.current && id) {
          const qtdAtivo = Number(quantidadeAtivo);
          const valorBRL = Number(quantidadeFiat.replace(",", "."));
          const valorToken = qtdAtivo > 0 ? valorBRL / qtdAtivo : 0;

          const payloadOrder = {
            nome: nomeCompleto,
            apelido: cpfOuCnpj,
            numeroOrdem: id,
            dataHora: formatDateTime(new Date().toISOString()),
            exchange: "CRYPTOTECH https://www.cryptotechdev.com/ BR",
            ativo,
            quantidade: quantidadeAtivo,
            valor: formatCurrency(quantidadeFiat),
            valorToken: valorToken.toFixed(4).toString(),
            taxa: "0",
            tipo: "vendas" as const,
            status: "Pending" as const,
            document: cpfOuCnpj,
          };

          await createOrder(payloadOrder);
          orderCreatedRef.current = true;
        }
      } catch {}
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? "Erro ao gerar QR Code");
    }
  };

  const buscarStatus = async () => {
    if (!idDocumento) return;
    try {
      const data = await buscar({ id_documento: idDocumento });
      const ret = (data as any)?.retorno ?? data;
      setStatus(String(ret?.situacao ?? ret?.status ?? "—"));
      setUltimaAtualizacao(new Date().toLocaleString("pt-BR"));
      const { payload: pay, imgDataUrl: img } = pickQrFields(ret);
      if (!payload && pay) setPayload(pay);
      if (!imgDataUrl && img) setImgDataUrl(img);
    } catch {}
  };

  useEffect(() => {
    gerarQrCode();
  }, []);
  useEffect(() => {
    if (!idDocumento || payload || imgDataUrl || oneShotRef.current) return;
    oneShotRef.current = true;
    const t = setTimeout(() => buscarStatus(), 800);
    return () => clearTimeout(t);
  }, [idDocumento, payload, imgDataUrl]);
  useEffect(() => {
    (async () => {
      if (!payload || imgDataUrl) return;
      try {
        const url = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 1,
          scale: 6,
        });
        setImgDataUrl(url);
      } catch {}
    })();
  }, [payload, imgDataUrl]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("Copiado !");
    } catch {}
  };
  const loading = isGenerating;
  const paid = status.toUpperCase().includes("LIQ") || status.toUpperCase().includes("CONFIR");

  const composeWhatsappMessage = () => {
    const valorBRL = Number(valorAPI).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const linhas = [
      "💬 *Cryptotech* — Detalhes do pagamento via PIX",
      `• *Pagador*: ${String(nomeCompleto ?? "").trim()} — ${cpfOuCnpj}`,
      `• *Valor*: R$ ${valorBRL}`,
      `• *Chave recebedora*: ${pixReceiverKey}`,
      solicitacaoPagador ? `• *Solicitação*: ${solicitacaoPagador}` : null,
      idDocumento ? `• *ID do documento*: ${idDocumento}` : null,
      "",
      "🔗 *PIX (Copia e Cola)*:",
      payload || "(ainda não disponível)",
    ].filter(Boolean);
    return linhas.join("\n");
  };

  const onFinish = () => {
    return console.log("finalizado");
  };

  return (
    <>
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
                  Use o “PIX Copia e Cola”.
                </div>
              )}
            </div>

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
                  title="Copiar"
                >
                  <Copy size={16} className="mr-1 inline-block" /> Copiar
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Timer size={14} /> Atualização: {ultimaAtualizacao || "—"}
                </div>
              </div>

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
                <button
                  onClick={buscarStatus}
                  disabled={!idDocumento || isChecking}
                  className="rounded-6 border px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Atualizar status"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>

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
              {/* <li><strong>Chave recebedora:</strong> {sanitizeKey(pixReceiverKey)}</li> */}
              <li>
                <strong>Solicitação do pagador:</strong>{" "}
                {sanitizeTextOrNull(solicitacaoPagador) ?? "—"}
              </li>
              <li>
                <strong>Expiração:</strong> {expiracaoSegundos / (60 * 60)} hora
              </li>
              {/* <li><strong>Identificador (TXID):</strong> {txidUsado || "(gerado automaticamente)"}</li>
              {idDocumento && <li><strong>ID do documento:</strong> {idDocumento}</li>} */}
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
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-6 border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-60"
          disabled={!payload}
          onClick={() => openWhatsappWithText({ to: whatsapp, text: composeWhatsappMessage() })}
          title="Abrir WhatsApp com mensagem preenchida"
        >
          Enviar pelo WhatsApp (texto)
        </button>

        <button
          type="button"
          className="rounded-6 border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-60 md:hidden"
          disabled={!payload}
          onClick={() =>
            shareTextAndImage({
              to: whatsapp,
              text: composeWhatsappMessage(),
              imgDataUrl: imgDataUrl || undefined,
              filename: `pix-${idDocumento || Date.now()}.png`,
            })
          }
          title="Compartilhar (mobile) texto + imagem"
        >
          Compartilhar texto + QR (mobile)
        </button>

        {imgDataUrl && (
          <a
            download={`pix-${idDocumento || Date.now()}.png`}
            href={imgDataUrl}
            className="rounded-6 border px-3 py-2 text-sm hover:bg-gray-100"
            title="Baixar imagem do QR para anexar no WhatsApp"
          >
            Baixar QR
          </a>
        )}
      </div>
    </>
  );
};
