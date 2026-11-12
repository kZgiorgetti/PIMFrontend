/* Estado e sessao compartilhados pelo nucleo do front. */
var AppCore = window.AppCore || {};
AppCore.CHAVE_SESSAO = "pim.session";
AppCore.NAV = [
  { id: "dashboard", rotulo: "Painel", href: "/pages/dashboard.html", papeis: ["Admin", "Gestor"] },
  {
    id: "tarefas",
    rotulo: "Tarefas",
    href: "/pages/tarefas.html",
    papeis: ["Admin", "Gestor", "Colaborador"],
  },
  {
    id: "colaboradores",
    rotulo: "Colaboradores",
    href: "/pages/colaboradores.html",
    papeis: ["Admin", "Gestor"],
  },
  { id: "equipes", rotulo: "Equipes", href: "/pages/equipes.html", papeis: ["Admin", "Gestor"] },
  { id: "usuarios", rotulo: "Usuários", href: "/pages/usuarios.html", papeis: ["Admin"] },
];
AppCore.STATUS = {
  Pendente: { icone: "clock", rotulo: "Pendente" },
  EmAndamento: { icone: "arrow-up-to-line", rotulo: "Em andamento" },
  Concluida: { icone: "check", rotulo: "Concluída" },
};
AppCore.PRIORIDADE = { Baixa: "Baixa", Media: "Média", Alta: "Alta", Urgente: "Urgente" };
AppCore.focoAnterior = null;
