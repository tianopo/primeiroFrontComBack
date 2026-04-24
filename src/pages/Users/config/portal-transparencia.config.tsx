import { PortalSectionConfig, PortalItem } from "../utils/portal-transparencia.types";

const joinDescriptions = (value: unknown) => {
  if (!Array.isArray(value)) return "Não informado";

  return value
    .map((item) =>
      typeof item === "object" && item !== null && "descricao" in item
        ? String((item as { descricao?: unknown }).descricao ?? "")
        : "",
    )
    .filter(Boolean)
    .join(" | ");
};

export const portalSectionsConfig: PortalSectionConfig[] = [
  {
    key: "viagens",
    title: "Viagens",
    fields: [
      { label: "Motivo", path: "viagem.motivo" },
      { label: "PCDP", path: "viagem.pcdp" },
      { label: "Ano", path: "viagem.ano" },
      { label: "Número PCDP", path: "viagem.numPcdp" },
      { label: "Situação", path: "situacao" },
      { label: "Beneficiário", path: "beneficiario.nome" },
      { label: "CPF", path: "beneficiario.cpfFormatado" },
      { label: "Órgão", path: "orgao.nome" },
      { label: "Data início", path: "dataInicioAfastamento" },
      { label: "Data fim", path: "dataFimAfastamento" },
      { label: "Valor total", path: "valorTotalViagem" },
    ],
  },
  {
    key: "pep",
    title: "Pessoa Politicamente Exposta - PEP",
    fields: [
      { label: "Nome", path: "nome" },
      { label: "CPF", path: "cpf" },
      { label: "Sigla função", path: "sigla_funcao" },
      { label: "Descrição função", path: "descricao_funcao" },
      { label: "Nível", path: "nivel_funcao" },
      { label: "Órgão", path: "nome_orgao" },
      { label: "Início exercício", path: "dt_inicio_exercicio" },
      { label: "Fim exercício", path: "dt_fim_exercicio" },
      { label: "Fim carência", path: "dt_fim_carencia" },
    ],
  },
  {
    key: "sdc",
    title: "Seguro Defeso - SDC",
    fields: [
      { label: "Nome", path: "pessoaSeguroDefeso.nome" },
      { label: "CPF", path: "pessoaSeguroDefeso.cpfFormatado" },
      { label: "NIS", path: "pessoaSeguroDefeso.nis" },
      { label: "Município", path: "municipio.nomeIBGE" },
      { label: "UF", path: "municipio.uf.sigla" },
      { label: "Portaria", path: "portaria" },
      { label: "Data referência", path: "dataMesReferencia" },
      { label: "Situação", path: "situacao" },
      { label: "RGP", path: "rgp" },
      { label: "Parcela", path: "parcela" },
      { label: "Valor", path: "valor" },
    ],
  },
  {
    key: "safra",
    title: "Garantia Safra",
    fields: [
      { label: "Nome", path: "beneficiarioSafra.nome" },
      { label: "CPF", path: "beneficiarioSafra.cpfFormatado" },
      { label: "NIS", path: "beneficiarioSafra.nis" },
      { label: "Município", path: "municipio.nomeIBGE" },
      { label: "UF", path: "municipio.uf.sigla" },
      { label: "Data referência", path: "dataMesReferencia" },
      { label: "Valor", path: "valor" },
    ],
  },
  {
    key: "peti",
    title: "PETI",
    fields: [
      { label: "Nome", path: "beneficiarioPeti.nome" },
      { label: "CPF", path: "beneficiarioPeti.cpfFormatado" },
      { label: "NIS", path: "beneficiarioPeti.nis" },
      { label: "Município", path: "municipio.nomeIBGE" },
      { label: "UF", path: "municipio.uf.sigla" },
      { label: "Situação", path: "situacao" },
      { label: "Valor", path: "valor" },
    ],
  },
  {
    key: "bpc",
    title: "BPC",
    fields: [
      { label: "Nome", path: "beneficiario.nome" },
      { label: "CPF", path: "beneficiario.cpfFormatado" },
      { label: "NIS", path: "beneficiario.nis" },
      { label: "Representante legal", path: "beneficiario.nomeRepresentanteLegal" },
      { label: "Município", path: "municipio.nomeIBGE" },
      { label: "UF", path: "municipio.uf.sigla" },
      { label: "Valor", path: "valor" },
      { label: "Concedido judicialmente", path: "concedidoJudicialmente" },
    ],
  },
  {
    key: "ae",
    title: "Auxílio Emergencial",
    fields: [
      { label: "Beneficiário", path: "beneficiario.nome" },
      { label: "CPF beneficiário", path: "beneficiario.cpfFormatado" },
      { label: "Responsável familiar", path: "responsavelAuxilioEmergencial.nome" },
      { label: "CPF responsável", path: "responsavelAuxilioEmergencial.cpfFormatado" },
      { label: "Município", path: "municipio.nomeIBGE" },
      { label: "UF", path: "municipio.uf.sigla" },
      { label: "Situação", path: "situacaoAuxilioEmergencial" },
      { label: "Enquadramento", path: "enquadramentoAuxilioEmergencial" },
      { label: "Valor", path: "valor" },
      { label: "Parcela", path: "numeroParcela" },
    ],
  },
  {
    key: "cnep",
    title: "CNEP",
    fields: [
      { label: "Data referência", path: "dataReferencia" },
      { label: "Início sanção", path: "dataInicioSancao" },
      { label: "Fim sanção", path: "dataFimSancao" },
      { label: "Tipo sanção", path: "tipoSancao.descricaoResumida" },
      { label: "Órgão sancionador", path: "orgaoSancionador.nome" },
      { label: "Pessoa", path: "pessoa.nome" },
      { label: "CPF/CNPJ", path: "sancionado.codigoFormatado" },
      { label: "Valor multa", path: "valorMulta" },
      { label: "Número processo", path: "numeroProcesso" },
      {
        label: "Fundamentação",
        render: (item: PortalItem) => joinDescriptions(item.fundamentacao),
      },
    ],
  },
  {
    key: "ceis",
    title: "CEIS",
    fields: [
      { label: "Nome", path: "sancionado.nome" },
      { label: "CPF/CNPJ", path: "sancionado.codigoFormatado" },
      { label: "Razão social", path: "pessoa.razaoSocialReceita" },
      { label: "Nome fantasia", path: "pessoa.nomeFantasiaReceita" },
      { label: "Tipo", path: "pessoa.tipo" },
      { label: "Data referência", path: "dataReferencia" },
      { label: "Início sanção", path: "dataInicioSancao" },
      { label: "Fim sanção", path: "dataFimSancao" },
      { label: "Tipo sanção", path: "tipoSancao.descricaoResumida" },
      { label: "Órgão sancionador", path: "orgaoSancionador.nome" },
      { label: "Número processo", path: "numeroProcesso" },
      {
        label: "Fundamentação",
        render: (item: PortalItem) => joinDescriptions(item.fundamentacao),
      },
    ],
  },
  {
    key: "ceaf",
    title: "CEAF",
    fields: [
      { label: "Nome", path: "pessoa.nome" },
      { label: "CPF", path: "pessoa.cpfFormatado" },
      { label: "Tipo", path: "pessoa.tipo" },
      { label: "Data publicação", path: "dataPublicacao" },
      { label: "Data referência", path: "dataReferencia" },
      { label: "Tipo punição", path: "tipoPunicao.descricao" },
      { label: "Portaria", path: "punicao.portaria" },
      { label: "Processo", path: "punicao.processo" },
      { label: "Órgão lotação", path: "orgaoLotacao.nome" },
      { label: "UF", path: "ufLotacaoPessoa.uf.sigla" },
      {
        label: "Fundamentação",
        render: (item: PortalItem) => joinDescriptions(item.fundamentacao),
      },
    ],
  },
  {
    key: "cepim",
    title: "CEPIM",
    fields: [
      { label: "Data referência", path: "dataReferencia" },
      { label: "Motivo", path: "motivo" },
      { label: "Órgão superior", path: "orgaoSuperior.nome" },
      { label: "CNPJ órgão", path: "orgaoSuperior.cnpj" },
      { label: "Entidade", path: "pessoaJuridica.nome" },
      { label: "CNPJ entidade", path: "pessoaJuridica.cnpjFormatado" },
      { label: "Razão social", path: "pessoaJuridica.razaoSocialReceita" },
      { label: "Nome fantasia", path: "pessoaJuridica.nomeFantasiaReceita" },
      { label: "Convênio código", path: "convenio.codigo" },
      { label: "Convênio número", path: "convenio.numero" },
      { label: "Objeto convênio", path: "convenio.objeto" },
    ],
  },
];
