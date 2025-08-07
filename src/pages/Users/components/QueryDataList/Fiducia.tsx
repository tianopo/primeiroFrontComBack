interface IResponseData {
  responseData: boolean;
}

export const Fiducia = ({ responseData }: IResponseData) => {
  return (
    <div className="mb-2 border-b pb-2">
      <h5 className={`font-bold ${responseData ? "text-red-500" : "text-green-500"}`}>
        {responseData ? "Esta Na " : "Não Esta Na "}Lista Negra Da Fiducia
      </h5>
    </div>
  );
};
