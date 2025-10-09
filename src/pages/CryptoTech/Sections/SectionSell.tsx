import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import axios from "axios";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { blockchainsOptions } from "src/utils/selectsOptions";
import { InputInstitucional } from "../components/InputInstitucional";
import { ModalInstitutional } from "../components/ModalInstitutional";
import { SelectInstitucional } from "../components/SelectInstitucional";
import { Step4PixPayment } from "../components/Step4PixPayment";
import "../cryptoTech.css";

export const SectionSell = () => {
  const [step, setStep] = useState<number>(1);
  // step 1
  const [blockchain, setBlockchain] = useState<string>("BSC (BEP20)");
  const [quantidadeFiat, setQuantidadeFiat] = useState<string>("");
  const [quantidadeAtivo, setQuantidadeAtivo] = useState<string>("");
  const [moeda, setMoeda] = useState<string>("BRL");
  const [ativo, setAtivo] = useState<string>("USDT");
  const [dolar, setDolar] = useState<number>(5);
  const [taxaPercentual, setTaxaPercentual] = useState<number>(3);
  // step 2
  const [nomeCompleto, setNomeCompleto] = useState<string>("");
  const [CPFouCNPJ, setCPFouCNPJ] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [enderecoDaCarteira, setEnderecoDaCarteira] = useState<string>("");
  // step 3
  const [confirmado, setConfirmado] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isUpdatingFiat = useRef(false);
  const isUpdatingAtivo = useRef(false);

  // step 1

  const handleMoedaOrAtivoChange = (
    novoValor: string,
    valorAtual: string,
    setValor: (v: string) => void,
  ) => {
    if (novoValor !== valorAtual) {
      setQuantidadeFiat("");
      setQuantidadeAtivo("");
      setTaxaPercentual(3);
    }
    setValor(novoValor);
  };

  useEffect(() => {
    const fetchCotacao = async () => {
      try {
        const { data } = await axios.get("https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL");

        let valorAtual = 6;
        if (ativo === "BTC") {
          valorAtual = parseFloat(data.BTCBRL?.bid || "1000000");
        } else {
          valorAtual = parseFloat(data.USDBRL?.bid || "6");
        }

        setDolar(valorAtual);
      } catch (error) {
        console.error("Erro ao buscar cotação:", error);
      }
    };

    fetchCotacao();
  }, [ativo]);

  const atualizarTaxa = (fiatValue: number) => {
    let taxa = 2.5;
    if (fiatValue < 200) taxa = 20;
    else if (fiatValue >= 200 && fiatValue < 500) taxa = 10;
    else if (fiatValue >= 500 && fiatValue < 50000) taxa = 3;
    setTaxaPercentual(taxa);
    return taxa;
  };

  const handleFiatChange = (value: string) => {
    setQuantidadeFiat(value);
    const fiat = parseFloat(value.replace(",", "."));
    if (!isNaN(fiat)) {
      const taxa = atualizarTaxa(fiat);
      const taxaMultiplicador = 1 - taxa / 100;
      const ativo = (fiat / dolar) * taxaMultiplicador;
      isUpdatingFiat.current = true;
      setQuantidadeAtivo(ativo.toFixed(8));
    }
  };

  const handleAtivoChange = (value: string) => {
    setQuantidadeAtivo(value);

    const ativo = parseFloat(value.replace(",", "."));
    if (!isNaN(ativo)) {
      const fiatEstimado = ativo * dolar;

      const novaTaxa = atualizarTaxa(fiatEstimado);
      const taxaMultiplicador = 1 - novaTaxa / 100;

      const fiatFinal = (ativo * dolar) / taxaMultiplicador;

      isUpdatingAtivo.current = true;
      isUpdatingFiat.current = true;
      setQuantidadeFiat(fiatFinal.toFixed(2));
    }
  };

  // step 2

  const handleCPFouCNPJChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPFouCNPJ = formatCPFOrCNPJ(e.target.value);
    setCPFouCNPJ(formattedCPFouCNPJ);
  };

  const handleNext = () => setStep((a) => a + 1);
  const handlePrevious = () => setStep((a) => a - 1);

  return (
    <section className="flex w-full justify-center" id="sell">
      <div className="label-buy container-opacity-light flex w-full flex-col justify-center gap-6 text-justify font-extrabold lg:w-[950px]">
        {step === 1 && (
          <>
            <h4>Compre Agora</h4>
            <SelectInstitucional
              title="Rede Blockchain"
              options={blockchainsOptions}
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
              required
            />
            <div className="flex h-fit flex-col justify-between md:flex-row">
              <div className="flex flex-col gap-2">
                <SelectInstitucional
                  title="Pagar Com"
                  options={["BRL"]}
                  value={moeda}
                  onChange={(e) => handleMoedaOrAtivoChange(e.target.value, moeda, setMoeda)}
                  required
                />
                <InputInstitucional
                  title="Quantidade Fiat"
                  value={quantidadeFiat}
                  onChange={(e) => handleFiatChange(e.target.value)}
                  required
                  hidden
                />
                <h6>Valor mínimo 50,00</h6>
              </div>
              <div className="flex flex-col gap-2">
                <SelectInstitucional
                  title="Receber"
                  options={["USDT", "USDC", "DAI", "FDUSD", "BTC"]}
                  value={ativo}
                  onChange={(e) => handleMoedaOrAtivoChange(e.target.value, ativo, setAtivo)}
                  required
                />
                <InputInstitucional
                  title="Quantidade Ativo"
                  value={quantidadeAtivo}
                  onChange={(e) => handleAtivoChange(e.target.value)}
                  required
                  hidden
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-6 border-edge-primary bg-white bg-opacity-15 p-5">
              <h5>Taxa de processamento: {taxaPercentual}%</h5>
              <h5>Valor aproximado do ativo: {quantidadeAtivo}</h5>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h4>Informações Pessoais</h4>
            <InputInstitucional
              title="Nome Completo"
              placeholder="Seu Nome Completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
            <InputInstitucional
              title="CPF ou CNPJ"
              placeholder="123.456.789-10 ou 12.345.678/0001-90"
              value={CPFouCNPJ}
              onChange={(e) => handleCPFouCNPJChange(e)}
            />
            <InputInstitucional
              title="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputInstitucional
              title="Endereço da Carteira"
              placeholder="0x..."
              value={enderecoDaCarteira}
              onChange={(e) => setEnderecoDaCarteira(e.target.value)}
            />
            <div className="container_warn">
              <WarningCircle
                weight="bold"
                color="gray"
                className="h-5 w-5 fill-variation-warning"
              />
              <h5 className="font-bold text-variation-warning">
                Atenção! Cole aqui o endereço da carteira que receberá o valor convertido.
              </h5>
              <p className="text-variation-warning">
                Informações preenchidas incorretamente não são de responsabilidade da Cryptotech
              </p>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h4>Confirme os detalhes da transação</h4>
            <div className="container_warn">
              <div className="flex w-full flex-col gap-4">
                <div className="flex w-full justify-between">
                  <h6 className="opacity-90">Carteira de Recebimento:</h6>
                  <h6 className="font-bold text-white text-opacity-100">
                    {enderecoDaCarteira.length > 10
                      ? `${enderecoDaCarteira.slice(0, 5)}...${enderecoDaCarteira.slice(-5)}`
                      : enderecoDaCarteira}
                  </h6>
                </div>
                <hr />
                <div className="flex w-full justify-between">
                  <h6 className="opacity-90">Documento:</h6>
                  <h6 className="font-bold text-white text-opacity-100">{CPFouCNPJ}</h6>
                </div>
                <hr />
                <div className="flex w-full justify-between">
                  <h6 className="opacity-90">Pagar com:</h6>
                  <h6 className="font-bold text-white text-opacity-100">{`${quantidadeFiat} ${moeda}`}</h6>
                </div>
                <hr />
                <div className="flex w-full justify-between">
                  <h6 className="opacity-90">Receber:</h6>
                  <h6 className="font-bold text-white text-opacity-100">{`${quantidadeAtivo} ${ativo}`}</h6>
                </div>
              </div>
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.target.checked)}
                className={`h-5 w-5 rounded transition-colors ${
                  confirmado ? "bg-primary" : "bg-white opacity-80"
                } border-gray-300`}
              />
              <p>
                Eu li e concordo com os{" "}
                <a
                  href="/policy/pld.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80"
                >
                  Termos de Uso e Política de Privacidade
                </a>
                . Entendo que a transação é irreversível e que o valor recebido pode variar de
                acordo com a cotação no momento da confirmação.
              </p>
            </label>
          </>
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
              disabled={
                (step === 1 && ![quantidadeAtivo, quantidadeFiat, ativo, moeda].every(Boolean)) ||
                (step === 2 &&
                  ![nomeCompleto, CPFouCNPJ, email, enderecoDaCarteira].every(Boolean)) ||
                (step === 3 &&
                  ![
                    quantidadeAtivo,
                    quantidadeFiat,
                    ativo,
                    moeda,
                    nomeCompleto,
                    CPFouCNPJ,
                    email,
                    enderecoDaCarteira,
                    confirmado,
                  ].every(Boolean))
              }
              onClick={step === 3 ? () => setShowModal(true) : handleNext}
            >
              {step === 3 ? (
                "Concluir Conversão"
              ) : (
                <>
                  Prosseguir <ArrowRight weight="bold" />
                </>
              )}
            </button>
          )}
        </div>
        {step === 1 && (
          <div className="container_warn">
            <WarningCircle weight="bold" color="gray" className="h-5 w-5 fill-variation-warning" />
            <p>
              O valor enviado para sua conta ou carteira será calculado com base na cotação vigente
              no momento em que a Cryptotech receber o PIX ou os criptoativos. Por isso, podem
              ocorrer variações — positivas ou negativas — em relação à cotação exibida na
              solicitação.
            </p>
          </div>
        )}
        {step === 4 && (
          <Step4PixPayment
            nomeCompleto={nomeCompleto}
            cpfOuCnpj={CPFouCNPJ}
            quantidadeFiat={quantidadeFiat}
            pixReceiverKey={"f2bf47ad-5786-4fcb-ab41-828d66fbb318"}
            solicitacaoPagador={`
              Intermdiação de ${quantidadeFiat} ${moeda} para ${quantidadeAtivo} ${ativo} - Cryptotech`}
            onBack={() => setStep(3)}
            onFinish={() => setShowModal(false)}
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
              Informe um e-mail válido para que possamos entrar em contato, caso necessário. Se
              preferir, você pode também incluir seu número de WhatsApp ou nos chame no formulário
              acima.
            </h6>
            <h6>
              Solicitamos essas informações exclusivamente para sua segurança. Seus dados pessoais e
              os detalhes da transação são mantidos em sigilo absoluto e não serão compartilhados.
            </h6>
            <div className="flex flex-col gap-4 rounded-12 border-1 bg-gray-400 p-4">
              <div className="flex w-full justify-between">
                <h6 className="opacity-90">Carteira de Recebimento:</h6>
                <h6 className="font-bold">
                  {enderecoDaCarteira.length > 10
                    ? `${enderecoDaCarteira.slice(0, 5)}...${enderecoDaCarteira.slice(-5)}`
                    : enderecoDaCarteira}
                </h6>
              </div>
              <hr />
              <div className="flex w-full justify-between">
                <h6 className="opacity-90">Documento:</h6>
                <h6 className="font-bold">{CPFouCNPJ}</h6>
              </div>
              <hr />
              <div className="flex w-full justify-between">
                <h6 className="opacity-90">Pagar com:</h6>
                <h6 className="font-bold">{`${quantidadeFiat} ${moeda}`}</h6>
              </div>
              <hr />
              <div className="flex w-full justify-between">
                <h6 className="opacity-90">Receber:</h6>
                <h6 className="font-bold">{`${quantidadeAtivo} ${ativo}`}</h6>
              </div>
            </div>
            <button
              className="button-colorido-buy"
              onClick={() => {
                setShowModal(false);
                handleNext();
              }}
            >
              {step === 3 ? (
                "Concluir Conversão"
              ) : (
                <>
                  Prosseguir <ArrowRight weight="bold" />
                </>
              )}
            </button>
          </div>
        </ModalInstitutional>
      )}
    </section>
  );
};
