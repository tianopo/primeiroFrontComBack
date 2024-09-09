import { Cashier } from "./components/Cashier";
import { Compliance } from "./components/Compliance";
import { Register } from "./components/Register";

export const Operation = () => {
  return (
    <div className="flex flex-row flex-wrap gap-4 px-4">
      <Register />
      <Compliance />
      <Cashier />
    </div>
  );
};
