/* Fachada pública do núcleo do front-end. Carregue os módulos do core antes deste arquivo. */
var AppCore = window.AppCore || {};
AppCore.preferencias.aplicarPrefs();
var App = {
  getSession: AppCore.sessao.getSession,
  setSession: AppCore.sessao.setSession,
  clearSession: AppCore.sessao.clearSession,
  sair: AppCore.sessao.sair,
  iniciarPagina: AppCore.sessao.iniciarPagina,
  ehGestor: function (u) {
    return u.perfil === "Admin" || u.perfil === "Gestor";
  },
  STATUS: AppCore.STATUS,
  PRIORIDADE: AppCore.PRIORIDADE,
};
Object.keys(AppCore.ui).forEach(function (metodo) {
  App[metodo] = AppCore.ui[metodo];
});
