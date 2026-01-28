interface OrderMessagesProps {
  messages: any[];
}

export const OrderMessages = ({ messages }: OrderMessagesProps) => {
  if (!messages || messages.length === 0) return null;

  const cryptotechAliases = [
    "crypto tech dev",
    "crypto tech dv",
    "cryptotech desenvolvimento e trading ltda",
  ];

  return (
    <div className="mt-2 max-h-48 max-w-[400px] overflow-y-auto overflow-x-hidden rounded-md border bg-gray-50 p-2">
      <p className="mb-1 text-sm font-semibold">Mensagens:</p>
      <div className="flex flex-col gap-1">
        {messages.map((msg: any, i: number) => {
          const sender = (msg?.fromNickName || msg.nickName)?.toLowerCase();
          const isFromCryptotech = cryptotechAliases.includes(sender);

          return (
            <div
              key={i}
              className={`rounded p-2 text-sm shadow-inner ${
                isFromCryptotech ? "bg-gray-100" : "bg-red-100"
              }`}
            >
              {msg.contentType === "pic" ? (
                <img src={msg.message} alt={`Imagem ${i + 1}`} className="max-w-xs rounded-md" />
              ) : (
                <p>{msg.message}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
