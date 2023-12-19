// BotaoTrocarTema.tsx
import { Cloud, Moon, Star, Sun } from "@phosphor-icons/react";
import { useTema } from "src/hooks/configuracao/useTema";
import { useLoading } from "src/hooks/useLoading";
import { ITema } from "src/interfaces/ITema";
import { SkeletonX } from "../Outros/SkeletonX";

export const BotaoTrocarTema = () => {
  const { tema: temaSelecionado, setTema } = useTema();
  const { loading } = useLoading();
  const opcoes: { tema: keyof ITema; icone: JSX.Element }[] = [
    { tema: "claro", icone: <Sun size="20px" weight="fill" className="text-icone-claro" /> },
    { tema: "escuro", icone: <Moon size="20px" weight="fill" className="text-icone-escuro" /> },
    { tema: "estrela", icone: <Star size="20px" weight="fill" className="text-icone-estrela" /> },
    { tema: "nuvem", icone: <Cloud size="20px" weight="fill" className="text-icone-nuvem" /> },
  ];

  const alternarTema = (novoTema: keyof ITema) => {
    localStorage.setItem("tema", novoTema);
    setTema(novoTema);
  };

  return (
    <>
      {loading ? (
        <SkeletonX className="skeleton_botao_trocar_tema" />
      ) : (
        <button
          type="button"
          className={`
        botao_trocar_tema-button
        botao_trocar_tema-${temaSelecionado}
      `}
          onClick={() => {
            const proximoTemaIndex =
              (opcoes.findIndex((opcao) => opcao.tema === temaSelecionado) + 1) % opcoes.length;
            alternarTema(opcoes[proximoTemaIndex].tema);
          }}
        >
          {opcoes.find((opcao) => opcao.tema === temaSelecionado)?.icone}
        </button>
      )}
    </>
  );
};
