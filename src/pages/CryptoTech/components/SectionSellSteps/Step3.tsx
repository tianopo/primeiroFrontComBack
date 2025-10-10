interface IStep3 {
  enderecoDaCarteira: string;
  cpfOuCnpj: string;
  quantidadeFiat: string;
  moeda: string;
  quantidadeAtivo: string;
  ativo: string;
  confirmado: boolean;
  setConfirmado: (v: boolean) => void;
}

export const Step3 = ({
  enderecoDaCarteira,
  cpfOuCnpj,
  quantidadeFiat,
  moeda,
  quantidadeAtivo,
  ativo,
  confirmado,
  setConfirmado,
}: IStep3) => {
  return (
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
            <h6 className="font-bold text-white text-opacity-100">{cpfOuCnpj}</h6>
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
            Termos de Uso
          </a>{" "}
          e{" "}
          <a
            href="/policy/pld.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80"
          >
            Política de Privacidade
          </a>
          . Entendo que a transação é irreversível e que o valor recebido pode variar de acordo com
          a cotação no momento da confirmação.
        </p>
      </label>
    </>
  );
};
