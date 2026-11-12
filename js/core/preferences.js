/* Preferências de acessibilidade armazenadas por usuário. */
var AppCore = window.AppCore || {};
AppCore.preferencias = {
  chavePrefs: function () {
    var s = AppCore.sessao.getSession();
    return "pim.prefs." + (s && s.usuario ? s.usuario.id : "anon");
  },
  lerPrefs: function () {
    try {
      return JSON.parse(localStorage.getItem(AppCore.preferencias.chavePrefs())) || {};
    } catch (e) {
      return {};
    }
  },
  aplicarPrefs: function () {
    var p = AppCore.preferencias.lerPrefs(),
      r = document.documentElement;
    if (p.contraste) r.setAttribute("data-contraste", "alto");
    else r.removeAttribute("data-contraste");
    r.setAttribute("data-fonte", String(p.fonte || 0));
  },
  salvarPrefs: function (p) {
    try {
      localStorage.setItem(AppCore.preferencias.chavePrefs(), JSON.stringify(p));
    } catch (e) {
      /* ignora */
    }
    AppCore.preferencias.aplicarPrefs();
  },
};
