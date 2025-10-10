import { blockchainsOptions } from "src/utils/selectsOptions";
import { InputInstitucional } from "../../components/InputInstitucional";
import { SelectInstitucional } from "../../components/SelectInstitucional";

interface IStep1 {
  blockchain: string;
  setBlockchain: (v: string) => void;

  quantidadeFiat: string;
  onFiatChange: (v: string) => void;

  quantidadeAtivo: string;
  onAtivoChange: (v: string) => void;

  moeda: string;
  setMoeda: (v: string) => void;

  ativo: string;
  setAtivo: (v: string) => void;

  taxaPercentual: number;

  onMoedaOrAtivoChange: (novo: string, atual: string, setValor: (v: string) => void) => void;
}

export const Step1 = ({
  blockchain,
  setBlockchain,
  quantidadeFiat,
  onFiatChange,
  quantidadeAtivo,
  onAtivoChange,
  moeda,
  setMoeda,
  ativo,
  setAtivo,
  taxaPercentual,
  onMoedaOrAtivoChange,
}: IStep1) => {
  return (
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
            onChange={(e) => onMoedaOrAtivoChange(e.target.value, moeda, setMoeda)}
            required
          />
          <InputInstitucional
            title="Quantidade Fiat"
            value={quantidadeFiat}
            onChange={(e) => onFiatChange(e.target.value)}
            required
            hidden
          />
          <h6>Valor mínimo 50,00</h6>
        </div>

        <div className="flex flex-col gap-2">
          <SelectInstitucional
            title="Receber"
            options={["USDT", "USDC", "DAI", "FDUSD"]}
            value={ativo}
            onChange={(e) => onMoedaOrAtivoChange(e.target.value, ativo, setAtivo)}
            required
          />
          <InputInstitucional
            title="Quantidade Ativo"
            value={quantidadeAtivo}
            onChange={(e) => onAtivoChange(e.target.value)}
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
  );
};
