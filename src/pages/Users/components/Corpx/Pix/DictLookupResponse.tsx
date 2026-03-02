import { DictLookupResponse } from "../../../utils/Interface";

export const DictLookupResponseView = ({ data }: { data?: DictLookupResponse }) => {
  if (!data) return <div className="text-sm text-gray-500">Sem dados ainda.</div>;

  return (
    <div className="mt-2 grid gap-2 rounded-8 border border-gray-200 p-3 text-sm md:grid-cols-2">
      <div>
        <b>Nome:</b> {data.ownerName}
      </div>
      <div>
        <b>Tipo:</b> {data.personType}
      </div>

      <div>
        <b>Chave:</b> {data.key}
      </div>
      <div>
        <b>Tipo chave:</b> {data.keyType}
      </div>

      <div className="md:col-span-2">
        <b>Banco:</b> {data.bankName}
      </div>

      <div>
        <b>Agência:</b> {data.branch}
      </div>
      <div>
        <b>Conta:</b> {data.accountNumber}
      </div>

      <div>
        <b>Status:</b> {data.status}
      </div>
      <div>
        <b>Cached:</b> {String(data.cached)}
      </div>
    </div>
  );
};
