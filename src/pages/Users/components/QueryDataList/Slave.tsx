interface IResponseData {
  responseData: boolean;
}

export const Slave = ({ responseData }: IResponseData) => {
  return (
    <div className="mb-4 border-b pb-2">
      <h4 className={`font-bold ${responseData ? "text-red-500" : "text-green-500"}`}>
        {responseData ? "Esta Na " : "Não Esta Na "}Lista Mão de Obra Escrava
      </h4>
    </div>
  );
};
