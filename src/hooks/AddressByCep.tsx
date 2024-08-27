import axios from "axios";
import { toast } from "react-toastify";

export const useAddressByCep = async (cep: string) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    return response.data;
  } catch (err) {
    toast.error("Endereço não existe");
    return cep;
  }
};
