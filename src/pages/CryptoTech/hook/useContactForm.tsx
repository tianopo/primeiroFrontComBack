import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { Regex } from "src/utils/Regex";
import * as Yup from "yup";

export interface IContactForm {
  name: string;
  phone: string;
  email: string;
}

const schema = Yup.object({
  name: Yup.string().required().label("Name"),
  phone: Yup.string().required().matches(Regex.phone_mask, "Invalid Phone Format").label("Phone"),
  email: Yup.string().required().matches(Regex.email, "Invalid Email Format").label("Email"),
});

export const useContactForm = () => {
  const context = useForm<IContactForm>({
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  return { context };
};
