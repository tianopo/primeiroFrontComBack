import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import axios from "axios";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { formatCPFOrCNPJ, formatCurrencyNoReal } from "src/utils/formats";
import { ModalInstitutional } from "../components/ModalInstitutional";
import { Step1 } from "../components/SectionSellSteps/Step1";
import { Step2 } from "../components/SectionSellSteps/Step2";
import { Step3 } from "../components/SectionSellSteps/Step3";
import { Step4PixPayment } from "../components/SectionSellSteps/Step4PixPayment";
import "../cryptoTech.css";

export const SectionSell = () => {
  const [step, setStep] = useState(1);
  // step 1
  const [blockchain, setBlockchain] = useState("BSC (BEP20)");
  const [quantidadeFiat, setQuantidadeFiat] = useState("");
  const [quantidadeAtivo, setQuantidadeAtivo] = useState("");
  const [moeda, setMoeda] = useState("BRL");
  const [ativo, setAtivo] = useState("USDT");
  const [dolar, setDolar] = useState(6);
  const [taxaPercentual, setTaxaPercentual] = useState(3);
  // step 2
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [CPFouCNPJ, setCPFouCNPJ] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enderecoDaCarteira, setEnderecoDaCarteira] = useState("");
  // step 3
  const [confirmado, setConfirmado] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // ===== Helpers =====
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL");
        setDolar(
          parseFloat(ativo === "BTC" ? data.BTCBRL?.bid || "1000000" : data.USDBRL?.bid || "6"),
        );
      } catch (e) {
        console.error("cotação", e);
      }
    })();
  }, [ativo]);

  const atualizarTaxa = (fiat: number) => {
    const t = fiat < 200 ? 20 : fiat < 500 ? 10 : fiat < 50000 ? 3 : 2.5;
    setTaxaPercentual(t);
    return t;
  };

  const handleFiatChange = (v: string) => {
    const f = formatCurrencyNoReal(v);
    setQuantidadeFiat(f);
    const n = parseFloat(f.replace(",", "."));
    if (Number.isFinite(n)) {
      const taxa = 1 - atualizarTaxa(n) / 100;
      setQuantidadeAtivo(((n / dolar) * taxa).toFixed(8));
    }
  };

  const handleAtivoChange = (v: string) => {
    setQuantidadeAtivo(v);
    const n = parseFloat(v.replace(",", "."));
    if (Number.isFinite(n)) {
      const fiatEstimado = n * dolar;
      const taxa = 1 - atualizarTaxa(fiatEstimado) / 100;
      setQuantidadeFiat(((n * dolar) / taxa).toFixed(2).replace(".", ","));
    }
  };

  const handleMoedaOrAtivoChange = (novo: string, atual: string, setValor: (x: string) => void) => {
    if (novo !== atual) {
      setQuantidadeFiat("");
      setQuantidadeAtivo("");
      setTaxaPercentual(3);
    }
    setValor(novo);
  };

  const handleCPFouCNPJChange = (e: ChangeEvent<HTMLInputElement>) =>
    setCPFouCNPJ(formatCPFOrCNPJ(e.target.value));

  const handleNext = () => setStep((s) => s + 1);
  const handlePrevious = () => setStep((s) => s - 1);

  const handleNextGuarded = async () => {
    if (step === 1) {
      const fiatNumber = Number(String(quantidadeFiat).replace(",", "."));

      if (!Number.isFinite(fiatNumber) || fiatNumber < 50) {
        toast.error("O valor mínimo é R$ 50,00.");
        return;
      }
      handleNext();
      return;
    }

    if (step === 2) {
      const digits = CPFouCNPJ.replace(/\D/g, "");
      if (!(digits.length === 11 || digits.length === 14)) {
        toast.error("Informe um CPF/CNPJ válido.");
        return;
      }
      handleNext();
      return;
    }

    if (step === 3) {
      setShowModal(true);
      return;
    }

    handleNext();
  };

  const canStep1 = useMemo(
    () => [quantidadeAtivo, quantidadeFiat, ativo, moeda].every(Boolean),
    [quantidadeAtivo, quantidadeFiat, ativo, moeda],
  );
  const canStep2 = useMemo(
    () => [nomeCompleto, CPFouCNPJ, whatsapp, enderecoDaCarteira].every(Boolean),
    [nomeCompleto, CPFouCNPJ, whatsapp, enderecoDaCarteira],
  );
  const canStep3 = useMemo(
    () =>
      [
        quantidadeAtivo,
        quantidadeFiat,
        ativo,
        moeda,
        nomeCompleto,
        CPFouCNPJ,
        whatsapp,
        enderecoDaCarteira,
        confirmado,
      ].every(Boolean),
    [
      quantidadeAtivo,
      quantidadeFiat,
      ativo,
      moeda,
      nomeCompleto,
      CPFouCNPJ,
      whatsapp,
      enderecoDaCarteira,
      confirmado,
    ],
  );

  const buttonDisabled =
    (step === 1 && !canStep1) || (step === 2 && !canStep2) || (step === 3 && !canStep3);

  return (
    <section className="flex w-full justify-center" id="sell">
      <div className="label-buy container-opacity-light flex w-full flex-col justify-center gap-6 text-justify font-extrabold lg:w-[950px]">
        {step === 1 && (
          <Step1
            blockchain={blockchain}
            setBlockchain={setBlockchain}
            quantidadeFiat={quantidadeFiat}
            onFiatChange={handleFiatChange}
            quantidadeAtivo={quantidadeAtivo}
            onAtivoChange={handleAtivoChange}
            moeda={moeda}
            setMoeda={(v) => handleMoedaOrAtivoChange(v, moeda, setMoeda)}
            ativo={ativo}
            setAtivo={(v) => handleMoedaOrAtivoChange(v, ativo, setAtivo)}
            taxaPercentual={taxaPercentual}
            onMoedaOrAtivoChange={handleMoedaOrAtivoChange}
          />
        )}

        {step === 2 && (
          <Step2
            nomeCompleto={nomeCompleto}
            setNomeCompleto={setNomeCompleto}
            cpfOuCnpj={CPFouCNPJ}
            onCpfOuCnpjChange={handleCPFouCNPJChange}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            enderecoDaCarteira={enderecoDaCarteira}
            setEnderecoDaCarteira={setEnderecoDaCarteira}
          />
        )}

        {step === 3 && (
          <Step3
            enderecoDaCarteira={enderecoDaCarteira}
            cpfOuCnpj={CPFouCNPJ}
            quantidadeFiat={quantidadeFiat}
            moeda={moeda}
            quantidadeAtivo={quantidadeAtivo}
            ativo={ativo}
            confirmado={confirmado}
            setConfirmado={setConfirmado}
          />
        )}

        <div className="flex flex-col justify-between gap-2 md:flex-row">
          {step > 1 && step < 4 && (
            <button onClick={handlePrevious} className="button-colorido-buy">
              <ArrowLeft weight="bold" /> Anterior
            </button>
          )}
          {step >= 1 && step < 4 && (
            <button
              className="button-colorido-buy"
              disabled={buttonDisabled}
              onClick={handleNextGuarded}
            >
              {step === 3 ? "Concluir Conversão" : "Prosseguir"} <ArrowRight weight="bold" />
            </button>
          )}
        </div>

        {step === 1 && (
          <div className="container_warn">
            <WarningCircle weight="bold" color="gray" className="h-5 w-5 fill-variation-warning" />
            <p>
              O valor enviado para sua conta ou carteira será calculado com base na cotação vigente
              no momento em que a Cryptotech receber o PIX ou os criptoativos. Podem ocorrer
              variações na solicitação.
            </p>
          </div>
        )}

        {step === 4 && (
          <Step4PixPayment
            nomeCompleto={nomeCompleto}
            cpfOuCnpj={CPFouCNPJ}
            quantidadeFiat={quantidadeFiat}
            quantidadeAtivo={quantidadeAtivo}
            pixReceiverKey="f2bf47ad-5786-4fcb-ab41-828d66fbb318"
            solicitacaoPagador={`Intermediação de ${quantidadeFiat} ${moeda} para ${quantidadeAtivo} ${ativo} - Cryptotech`}
            whatsapp={whatsapp}
            ativo={ativo}
            onBack={() => setStep(3)}
          />
        )}
      </div>

      {showModal && (
        <ModalInstitutional onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-6 text-black">
            <h4 className="text-xl font-bold text-red-600">Importante!</h4>
            <h6>
              Certifique-se de que o endereço da sua carteira ou a chave PIX foram inseridos
              corretamente. Informações incorretas podem resultar no envio dos valores para
              terceiros. A Cryptotech não se responsabiliza por perdas decorrentes de dados
              fornecidos de forma errada.
            </h6>
            <h6>
              Informe um número de whatsapp válido para que possamos entrar em contato, caso
              necessário. Se precisar, nos chame no whatsapp no balão do canto inferior direito.
            </h6>
            <h6>
              Solicitamos essas informações exclusivamente para sua segurança. Seus dados pessoais e
              os detalhes da transação são mantidos em sigilo absoluto e não serão compartilhados.
            </h6>
            <p>
              Confira os dados antes de prosseguir. Informações incorretas podem resultar em perdas.
            </p>

            <div className="flex flex-col gap-4 rounded-12 border-1 bg-gray-400 p-4">
              <Row
                lbl="Carteira de Recebimento:"
                val={
                  enderecoDaCarteira.length > 10
                    ? `${enderecoDaCarteira.slice(0, 5)}...${enderecoDaCarteira.slice(-5)}`
                    : enderecoDaCarteira
                }
              />
              <Row lbl="Documento:" val={CPFouCNPJ} />
              <Row lbl="Pagar com:" val={`${quantidadeFiat} ${moeda}`} />
              <Row lbl="Receber:" val={`${quantidadeAtivo} ${ativo}`} />
            </div>

            <button
              className="button-colorido-buy"
              onClick={() => {
                setShowModal(false);
                setStep(4);
              }}
            >
              Prosseguir <ArrowRight weight="bold" />
            </button>
          </div>
        </ModalInstitutional>
      )}
    </section>
  );
};

const Row = ({ lbl, val }: { lbl: string; val: string }) => (
  <>
    <div className="flex w-full justify-between">
      <h6 className="opacity-90">{lbl}</h6>
      <h6 className="font-bold">{val}</h6>
    </div>
    <hr />
  </>
);
