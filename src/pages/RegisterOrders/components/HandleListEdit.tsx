interface IHandleListEdit {
  formData: any[];
  handleEdit: (numeroOrdem: string) => void;
  notFoundNicknames?: Set<string>;
  existingOrders?: Set<string>;
  onOpenRegisterUser?: (order: any) => void;
}

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const display = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const parseBRL = (value: unknown) => {
  const raw = String(value ?? "0")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatBRL = (value: number) => {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const makeOrderKey = (numeroOrdem: unknown, exchange: unknown) => {
  return `${String(numeroOrdem ?? "").trim()}|||${String(exchange ?? "").trim()}`;
};

const setContainsCandidate = (set: Set<string> | undefined, candidates: unknown[]) => {
  if (!set || set.size === 0) return false;

  const normalizedSet = Array.from(set).map(normalize);

  return candidates.some((candidate) => {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) return false;

    return normalizedSet.some((item) => {
      return (
        item === normalizedCandidate ||
        item.includes(normalizedCandidate) ||
        normalizedCandidate.includes(item)
      );
    });
  });
};

const getExchangeCandidates = (order: any) => {
  const exchange = String(order?.exchange ?? "").trim();
  const exchangeBase = exchange.split(" ")[0]?.trim();

  return Array.from(new Set([exchange, exchangeBase].filter(Boolean)));
};

const hasExistingOrderError = (order: any, existingOrders?: Set<string>) => {
  const numeroOrdem = String(order?.numeroOrdem ?? "").trim();
  if (!numeroOrdem) return false;

  const candidates = getExchangeCandidates(order).map((exchange) => {
    return makeOrderKey(numeroOrdem, exchange);
  });

  return setContainsCandidate(existingOrders, candidates);
};

const getNicknameCandidates = (order: any) => {
  return Array.from(
    new Set(
      [
        order?.apelido,
        order?.nome,
        order?.counterparty,
        order?.User?.counterparty,
        order?.User?.name,
      ]
        .map((item) => String(item ?? "").trim())
        .filter(Boolean),
    ),
  );
};

const hasMissingUserError = (order: any, notFoundNicknames?: Set<string>) => {
  return setContainsCandidate(notFoundNicknames, getNicknameCandidates(order));
};

const getCardClass = ({ isNotFound, isExisting }: { isNotFound: boolean; isExisting: boolean }) => {
  if (isNotFound && isExisting) {
    return "border-orange-500 bg-orange-50";
  }

  if (isNotFound) {
    return "border-red-500 bg-red-50";
  }

  if (isExisting) {
    return "border-yellow-500 bg-yellow-50";
  }

  return "border-gray-200 bg-gray-100";
};

export const HandleListEdit = ({
  formData,
  handleEdit,
  notFoundNicknames = new Set(),
  existingOrders = new Set(),
  onOpenRegisterUser,
}: IHandleListEdit) => {
  const compras = formData.filter((item) => item.tipo === "compras");
  const vendas = formData.filter((item) => item.tipo === "vendas");

  const calculateTotals = (filteredData: any[]) => {
    const totalVendas = filteredData
      .filter((transaction) => transaction.tipo === "vendas")
      .reduce((acc, transaction) => acc + parseBRL(transaction.valor), 0);

    const totalCompras = filteredData
      .filter((transaction) => transaction.tipo === "compras")
      .reduce((acc, transaction) => acc + parseBRL(transaction.valor), 0);

    return { totalVendas, totalCompras };
  };

  const { totalVendas, totalCompras } = calculateTotals(formData);

  const renderList = (title: string, items: any[]) =>
    items.length > 0 && (
      <div className="mt-4">
        <h3 className="text-18 font-semibold">{title}</h3>

        <ul className="flex flex-row flex-wrap gap-2">
          {items.map((item, index) => {
            const isNotFound = hasMissingUserError(item, notFoundNicknames);
            const isExisting = hasExistingOrderError(item, existingOrders);

            const cardClass = [
              "relative min-w-[280px] cursor-pointer rounded-lg border px-3 py-5 pt-12 shadow-sm transition hover:opacity-90",
              getCardClass({ isNotFound, isExisting }),
            ].join(" ");

            return (
              <li
                key={`${String(item?.numeroOrdem ?? "ordem")}-${String(
                  item?.exchange ?? "exchange",
                )}-${index}`}
                className={cardClass}
                onClick={() => handleEdit(item.numeroOrdem)}
                title="Clique para editar a ordem manualmente"
              >
                {isNotFound && (
                  <button
                    type="button"
                    className="absolute right-2 top-2 z-20 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-red-500"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenRegisterUser?.(item);
                    }}
                  >
                    Cadastrar usuário
                  </button>
                )}

                <div className="absolute left-2 top-2 flex max-w-[170px] flex-wrap gap-1">
                  {isNotFound && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Usuário não encontrado
                    </span>
                  )}

                  {isExisting && (
                    <span className="rounded-full bg-yellow-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Ordem já existe
                    </span>
                  )}
                </div>

                <p>
                  <strong>Número Ordem:</strong> {display(item.numeroOrdem)}
                </p>

                <p>
                  <strong>Data e Hora:</strong> {display(item.dataHora)}
                </p>

                <p>
                  <strong>Exchange:</strong> {display(item.exchange)}
                </p>

                <p>
                  <strong>Ativo:</strong> {display(item.ativo)}
                </p>

                {item.nome && (
                  <p className="max-w-[260px] truncate">
                    <strong>Nome:</strong> {display(item.nome)}
                  </p>
                )}

                {item.apelido && (
                  <p className="max-w-[260px] truncate">
                    <strong>Apelido:</strong> {display(item.apelido)}
                  </p>
                )}

                <p>
                  <strong>Tipo:</strong> {display(item.tipo)}
                </p>

                <p>
                  <strong>Quantidade:</strong> {display(item.quantidade)}
                </p>

                <p>
                  <strong>Valor:</strong> {display(item.valor)}
                </p>

                <p>
                  <strong>Valor do Token:</strong> {display(item.valorToken)}
                </p>

                <p>
                  <strong>Taxa:</strong> {display(item.taxa)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    );

  return (
    <div className="card mt-4">
      <h2 className="text-20 font-bold">Dados Armazenados:</h2>

      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
        {notFoundNicknames.size > 0 && (
          <span className="rounded bg-red-100 px-2 py-1 text-red-700">
            Usuários não encontrados: {notFoundNicknames.size}
          </span>
        )}

        {existingOrders.size > 0 && (
          <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-700">
            Ordens já existentes: {existingOrders.size}
          </span>
        )}
      </div>

      <div className="mt-3">
        <h6>Total Vendas: {formatBRL(totalVendas)}</h6>
        <h6>Total Compras: {formatBRL(totalCompras)}</h6>
        <h6>Quantidade de Compras: {compras.length}</h6>
        <h6>Quantidade de Vendas: {vendas.length}</h6>
        <h6>Quantidade Total: {formData.length}</h6>
      </div>

      {renderList("Compras", compras)}
      {renderList("Vendas", vendas)}
    </div>
  );
};
