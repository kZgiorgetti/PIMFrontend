/* Cabeçalho autenticado e controles de preferência/conta. */
var AppCore = window.AppCore || {};
AppCore.cabecalho = {
  montarCabecalho: function (usuario, paginaAtual) {
    var host = document.getElementById("app-header");
    var links = AppCore.NAV.filter(function (n) {
      return n.papeis.indexOf(usuario.perfil) >= 0;
    })
      .map(function (n) {
        var rot =
          n.id === "tarefas" && usuario.perfil === "Colaborador"
            ? "Minhas tarefas"
            : n.rotulo;
        return (
          '<a class="page-tab" href="' +
          n.href +
          '"' +
          (n.id === paginaAtual ? ' aria-current="page"' : "") +
          ">" +
          rot +
          "</a>"
        );
      })
      .join("");

    var p = AppCore.preferencias.lerPrefs();
    host.innerHTML =
      '<header class="app-header"><div class="app-header-inner"><h1>Almoxarifado</h1>' +
      '<nav class="page-tabs" aria-label="Navegação principal">' +
      links +
      "</nav>" +
      '<div class="header-tools" role="group" aria-label="Preferências e conta">' +
      '<span class="usuario">Olá, ' +
      AppCore.ui.esc(usuario.nome) +
      " (" +
      AppCore.ui.esc(usuario.perfil) +
      ")</span>" +
      '<button type="button" class="btn-tool" id="btnContraste" aria-pressed="' +
      (p.contraste ? "true" : "false") +
      '">Alto contraste</button>' +
      '<button type="button" class="btn-tool" id="btnFonteMenos" aria-label="Diminuir tamanho da letra">A−</button>' +
      '<button type="button" class="btn-tool" id="btnFonteMais" aria-label="Aumentar tamanho da letra">A+</button>' +
      '<button type="button" class="btn-tool" id="btnSair"><span class="icon icon-logout" aria-hidden="true"></span>Sair</button></div></div></header>';

    document
      .getElementById("btnContraste")
      .addEventListener("click", function (e) {
        var q = AppCore.preferencias.lerPrefs();
        q.contraste = !q.contraste;
        AppCore.preferencias.salvarPrefs(q);
        e.currentTarget.setAttribute(
          "aria-pressed",
          q.contraste ? "true" : "false",
        );
        AppCore.ui.anunciar(
          q.contraste
            ? "Alto contraste ativado."
            : "Alto contraste desativado.",
        );
      });

    function fonte(delta) {
      var q = AppCore.preferencias.lerPrefs();
      q.fonte = Math.max(0, Math.min(3, (q.fonte || 0) + delta));
      AppCore.preferencias.salvarPrefs(q);
      AppCore.ui.anunciar("Tamanho da letra: nível " + q.fonte + " de 3.");
    }

    document
      .getElementById("btnFonteMenos")
      .addEventListener("click", function () {
        fonte(-1);
      });
    document
      .getElementById("btnFonteMais")
      .addEventListener("click", function () {
        fonte(1);
      });
    document
      .getElementById("btnSair")
      .addEventListener("click", async function () {
        var s = AppCore.sessao.getSession();
        try {
          if (s && s.refreshToken)
            await AppServices.apiService.post("/auth/logout", {
              refreshToken: s.refreshToken,
            });
        } catch (e) {
          /* segue */
        }
        AppCore.sessao.sair(false);
      });
  },
};
