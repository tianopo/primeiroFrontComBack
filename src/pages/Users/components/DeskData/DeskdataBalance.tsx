export const DeskdataBalance = ({ balance }: { balance?: any }) => {
  if (!balance) return null;

  const safe = (v: any) => (v === null || v === undefined || v === "" ? "-" : String(v));

  const statusMsg = safe(balance?.status?.message); // "Success"
  const saldo = safe(balance?.data?.balance); // 488

  const Badge = ({ label, value }: { label: string; value: any }) => (
    <span className="rounded-md bg-white px-2 py-1 text-xs shadow-sm">
      <strong>{label}:</strong> {safe(value)}
    </span>
  );

  return (
    <div className="mb-4 rounded-md border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 text-sm font-bold">Saldo / Consumo (Deskdata)</div>

      <div className="flex flex-wrap gap-2">
        <Badge label="Status" value={statusMsg} />
        <Badge label="Saldo" value={saldo} />
      </div>
    </div>
  );
};
