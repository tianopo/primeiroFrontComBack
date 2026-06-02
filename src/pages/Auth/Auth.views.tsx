import { FormLogin } from "./components/FormLogin";

export const Auth = () => {
  return (
    <section className="flex h-screen items-center justify-center bg-gradient-to-r from-yellow-600 to-yellow-200 p-2">
      <div className="w-2/3 rounded-xl bg-white p-3 shadow-2xl md:w-96">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <h2 className="text-4xl font-semibold">LOGIN</h2>
          <FormLogin />
        </div>
      </div>
    </section>
  );
};
