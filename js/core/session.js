/* Sessão, navegação e proteção das páginas. */
var AppCore = window.AppCore || {};
AppCore.sessao = {
  getSession: function () {
    try {
      return JSON.parse(sessionStorage.getItem(AppCore.CHAVE_SESSAO));
    } catch (e) {
      return null;
    }
  },
  setSession: function (s) {
    sessionStorage.setItem(AppCore.CHAVE_SESSAO, JSON.stringify(s));
  },
  clearSession: function () {
    sessionStorage.removeItem(AppCore.CHAVE_SESSAO);
  },
  sair: function (expirou) {
    AppCore.sessao.clearSession();
    window.location.href = "/pages/login.html" + (expirou ? "?expirou=1" : "");
  },
  iniciarPagina: function (opcoes) {
    var s = AppCore.sessao.getSession();
    if (!s || !s.accessToken) {
      AppCore.sessao.sair(false);
      return null;
    }
    var u = s.usuario;
    if (opcoes.papeis && opcoes.papeis.indexOf(u.perfil) < 0) {
      window.location.href = "/pages/tarefas.html";
      return null;
    }
    AppCore.preferencias.aplicarPrefs();
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<a class="skip-link" href="#conteudo">Ir para o conteúdo</a><div id="avisos" class="sr-only" aria-live="polite" role="status"></div>',
    );
    AppCore.cabecalho.montarCabecalho(u, opcoes.atual);
    var main = document.getElementById("conteudo");
    if (main) main.focus();
    return u;
  },
};
