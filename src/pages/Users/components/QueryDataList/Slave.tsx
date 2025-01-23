interface IResponseData {
  responseData: string;
}

export const Slave = ({ responseData }: IResponseData) => {
  if (!responseData) return null;

  return (
    <div className="mb-4 border-t pt-2">
      <h4 className="font-bold">Lista Mão de Obra Escrava</h4>
      <h6>{responseData}</h6>
    </div>
  );
};
