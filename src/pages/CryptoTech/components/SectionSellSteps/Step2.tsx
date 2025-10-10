import { ChangeEvent } from "react";
import { InputInstitucional } from "../../components/InputInstitucional";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface IStep2 {
  nomeCompleto: string;
  setNomeCompleto: (v: string) => void;
  cpfOuCnpj: string;
  onCpfOuCnpjChange: (e: ChangeEvent<HTMLInputElement>) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  enderecoDaCarteira: string;
  setEnderecoDaCarteira: (v: string) => void;
}

export const Step2 = ({
  nomeCompleto,
  setNomeCompleto,
  cpfOuCnpj,
  onCpfOuCnpjChange,
  whatsapp,
  setWhatsapp,
  enderecoDaCarteira,
  setEnderecoDaCarteira,
}: IStep2) => {
  return (
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
        value={cpfOuCnpj}
        onChange={onCpfOuCnpjChange}
      />
      <InputInstitucional
        title="Whatsapp"
        placeholder="apenas numeros: 5512982435633"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />
      <InputInstitucional
        title="Endereço da Carteira"
        placeholder="0x..."
        value={enderecoDaCarteira}
        onChange={(e) => setEnderecoDaCarteira(e.target.value)}
      />

      <div className="container_warn">
        <WarningCircle weight="bold" color="gray" className="h-5 w-5 fill-variation-warning" />
        <h5 className="font-bold text-variation-warning">
          Atenção! Cole aqui o endereço da carteira que receberá o valor convertido.
        </h5>
        <p className="text-variation-warning">
          Informações preenchidas incorretamente não são de responsabilidade da Cryptotech
        </p>
      </div>
    </>
  );
};
