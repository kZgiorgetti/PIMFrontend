/* Núcleo do front: sessão, preferências de acessibilidade, navegação por perfil, modais e utilitários. */
var App = (function () {
  var CHAVE = "pim.session";
  var NAV = [
    { id: "dashboard", rotulo: "Painel", href: "/pages/dashboard.html", papeis: ["Admin", "Gestor"] },
    { id: "tarefas", rotulo: "Tarefas", href: "/pages/tarefas.html", papeis: ["Admin", "Gestor", "Colaborador"] },
    { id: "colaboradores", rotulo: "Colaboradores", href: "/pages/colaboradores.html", papeis: ["Admin", "Gestor"] },
    { id: "equipes", rotulo: "Equipes", href: "/pages/equipes.html", papeis: ["Admin", "Gestor"] },
    { id: "usuarios", rotulo: "Usuários", href: "/pages/usuarios.html", papeis: ["Admin"] },
  ];
  var STATUS = {
    Pendente: { icone: "clock", rotulo: "Pendente" },
    EmAndamento: { icone: "arrow-up-to-line", rotulo: "Em andamento" },
    Concluida: { icone: "check", rotulo: "Concluída" },
  };
  var PRIORIDADE = { Baixa: "Baixa", Media: "Média", Alta: "Alta", Urgente: "Urgente" };
  var focoAnterior = null;

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE)); } catch (e) { return null; }
  }
  function setSession(s) { sessionStorage.setItem(CHAVE, JSON.stringify(s)); }
  function clearSession() { sessionStorage.removeItem(CHAVE); }

  function sair(expirou) {
    clearSession();
    window.location.href = "/pages/login.html" + (expirou ? "?expirou=1" : "");
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtData(iso) {
    if (!iso) return "—";
    var p = String(iso).slice(0, 10).split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function fmtDataHora(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR");
  }
  function statusBadge(status) {
    var s = STATUS[status] || { icone: "circle-exclamation-point", rotulo: status };
    return '<span class="badge ' + esc(status) + '"><span class="icon icon-' + s.icone + '" aria-hidden="true"></span> ' + esc(s.rotulo) + "</span>";
  }

  // ---------- preferências de acessibilidade (por usuário) ----------
  function chavePrefs() {
    var s = getSession();
    return "pim.prefs." + (s && s.usuario ? s.usuario.id : "anon");
  }
  function lerPrefs() {
    try { return JSON.parse(localStorage.getItem(chavePrefs())) || {}; } catch (e) { return {}; }
  }
  function aplicarPrefs() {
    var p = lerPrefs(), r = document.documentElement;
    if (p.contraste) r.setAttribute("data-contraste", "alto"); else r.removeAttribute("data-contraste");
    r.setAttribute("data-fonte", String(p.fonte || 0));
  }
  function salvarPrefs(p) {
    try { localStorage.setItem(chavePrefs(), JSON.stringify(p)); } catch (e) { /* ignora */ }
    aplicarPrefs();
  }

  // ---------- feedback e anúncios ----------
  function anunciar(msg) {
    var r = document.getElementById("avisos");
    if (!r) return;
    r.textContent = "";
    setTimeout(function () { r.textContent = msg; }, 50);
  }
  function feedback(el, msg, tipo) {
    el.textContent = msg || "";
    el.className = "feedback" + (msg && tipo ? " " + tipo : "");
    el.setAttribute("role", tipo === "erro" ? "alert" : "status");
  }

  // ---------- modais com foco gerenciado ----------
  function focaveis(raiz) {
    return Array.prototype.slice.call(raiz.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled])'));
  }
  function abrirModal(overlay, focoInicial) {
    focoAnterior = document.activeElement;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    var alvo = focoInicial || focaveis(overlay.querySelector(".modal"))[1] || focaveis(overlay)[0];
    if (alvo) alvo.focus();
    overlay._trap = function (e) {
      if (e.key === "Escape") { fecharModal(overlay); return; }
      if (e.key !== "Tab") return;
      var f = focaveis(overlay);
      if (!f.length) return;
      var primeiro = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    overlay.addEventListener("keydown", overlay._trap);
  }
  function fecharModal(overlay) {
    if (overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    if (overlay._trap) overlay.removeEventListener("keydown", overlay._trap);
    if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus();
  }
  function ligarModal(overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-fechar]")) fecharModal(overlay);
    });
  }
  function ajustarMenusAcoes(host) {
    if (!host || typeof HTMLElement.prototype.showPopover !== "function") return;
    if (!host._dismissActionsMenu) {
      host._dismissActionsMenu = true;
      host.addEventListener("click", function (e) {
        var menu = e.target.closest(".actions-dropdown[popover]");
        if (menu && menu.matches(":popover-open") && typeof menu.hidePopover === "function") menu.hidePopover();
      });
      document.addEventListener("pointerdown", function (e) {
        Array.prototype.forEach.call(host.querySelectorAll(".actions-dropdown:popover-open"), function (menu) {
          var trigger = host.querySelector('[data-actions-trigger="' + menu.id + '"]');
          if (!menu.contains(e.target) && trigger !== e.target && !(trigger && trigger.contains(e.target))) menu.hidePopover();
        });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") Array.prototype.forEach.call(host.querySelectorAll(".actions-dropdown:popover-open"), function (menu) { menu.hidePopover(); });
      });
    }
    Array.prototype.forEach.call(host.querySelectorAll(".actions-dropdown[popover]"), function (menu) {
      var trigger = host.querySelector('[data-actions-trigger="' + menu.id + '"]');
      if (!trigger) return;
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (menu.matches(":popover-open")) { menu.hidePopover(); return; }
        menu.style.visibility = "hidden";
        menu.showPopover();
        var r = trigger.getBoundingClientRect();
        var w = menu.offsetWidth, h = menu.offsetHeight;
        var left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w));
        var top = r.bottom + h + 8 <= window.innerHeight ? r.bottom + 4 : Math.max(8, r.top - h - 4);
        menu.style.left = left + "px";
        menu.style.top = top + "px";
        menu.style.visibility = "visible";
      });
    });
  }
  function confirmar(mensagem, rotuloConfirmar) {
    return new Promise(function (resolve) {
      var o = document.createElement("div");
      o.className = "modal-overlay hidden";
      o.innerHTML = '<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="cfTitulo" aria-describedby="cfMsg">' +
        '<h3 class="modal-title" id="cfTitulo">Confirmar ação</h3><p id="cfMsg">' + esc(mensagem) + "</p>" +
        '<div class="form-actions"><button type="button" class="btn" data-nao>Cancelar</button>' +
        '<button type="button" class="btn btn-danger" data-sim>' + esc(rotuloConfirmar || "Confirmar") + "</button></div></div>";
      document.body.appendChild(o);
      function fim(v) { fecharModal(o); o.remove(); resolve(v); }
      o.querySelector("[data-sim]").addEventListener("click", function () { fim(true); });
      o.querySelector("[data-nao]").addEventListener("click", function () { fim(false); });
      o.addEventListener("click", function (e) { if (e.target === o) fim(false); });
      o.addEventListener("keydown", function (e) { if (e.key === "Escape") fim(false); });
      abrirModal(o, o.querySelector("[data-nao]"));
    });
  }

  // ---------- cabeçalho e proteção de rota ----------
  function montarCabecalho(usuario, paginaAtual) {
    var host = document.getElementById("app-header");
    var links = NAV.filter(function (n) { return n.papeis.indexOf(usuario.perfil) >= 0; }).map(function (n) {
      var rot = n.id === "tarefas" && usuario.perfil === "Colaborador" ? "Minhas tarefas" : n.rotulo;
      return '<a class="page-tab" href="' + n.href + '"' + (n.id === paginaAtual ? ' aria-current="page"' : "") + ">" + rot + "</a>";
    }).join("");
    var p = lerPrefs();
    host.innerHTML = '<header class="app-header"><div class="app-header-inner"><h1>Almoxarifado</h1>' +
      '<nav class="page-tabs" aria-label="Navegação principal">' + links + "</nav>" +
      '<div class="header-tools" role="group" aria-label="Preferências e conta">' +
      '<span class="usuario">Olá, ' + esc(usuario.nome) + " (" + esc(usuario.perfil) + ")</span>" +
      '<button type="button" class="btn-tool" id="btnContraste" aria-pressed="' + (p.contraste ? "true" : "false") + '">Alto contraste</button>' +
      '<button type="button" class="btn-tool" id="btnFonteMenos" aria-label="Diminuir tamanho da letra">A−</button>' +
      '<button type="button" class="btn-tool" id="btnFonteMais" aria-label="Aumentar tamanho da letra">A+</button>' +
      '<button type="button" class="btn-tool" id="btnSair"><span class="icon icon-logout" aria-hidden="true"></span>Sair</button></div></div></header>';
    document.getElementById("btnContraste").addEventListener("click", function (e) {
      var q = lerPrefs(); q.contraste = !q.contraste; salvarPrefs(q);
      e.currentTarget.setAttribute("aria-pressed", q.contraste ? "true" : "false");
      anunciar(q.contraste ? "Alto contraste ativado." : "Alto contraste desativado.");
    });
    function fonte(delta) {
      var q = lerPrefs(); q.fonte = Math.max(0, Math.min(3, (q.fonte || 0) + delta)); salvarPrefs(q);
      anunciar("Tamanho da letra: nível " + q.fonte + " de 3.");
    }
    document.getElementById("btnFonteMenos").addEventListener("click", function () { fonte(-1); });
    document.getElementById("btnFonteMais").addEventListener("click", function () { fonte(1); });
    document.getElementById("btnSair").addEventListener("click", async function () {
      var s = getSession();
      try { if (s && s.refreshToken) await AppServices.apiService.post("/auth/logout", { refreshToken: s.refreshToken }); } catch (e) { /* segue */ }
      sair(false);
    });
  }

  function iniciarPagina(opcoes) {
    var s = getSession();
    if (!s || !s.accessToken) { sair(false); return null; }
    var u = s.usuario;
    if (opcoes.papeis && opcoes.papeis.indexOf(u.perfil) < 0) { window.location.href = "/pages/tarefas.html"; return null; }
    aplicarPrefs();
    document.body.insertAdjacentHTML("afterbegin",
      '<a class="skip-link" href="#conteudo">Ir para o conteúdo</a><div id="avisos" class="sr-only" aria-live="polite" role="status"></div>');
    montarCabecalho(u, opcoes.atual);
    var main = document.getElementById("conteudo");
    if (main) main.focus();
    return u;
  }

  function ehGestor(u) { return u.perfil === "Admin" || u.perfil === "Gestor"; }
  function opcoes(lista, valor, rotulo, vazio, selecionado) {
    var h = vazio != null ? '<option value="">' + esc(vazio) + "</option>" : "";
    return h + lista.map(function (i) {
      return '<option value="' + esc(i[valor]) + '"' + (String(i[valor]) === String(selecionado) ? " selected" : "") + ">" + esc(i[rotulo]) + "</option>";
    }).join("");
  }

  aplicarPrefs();
  return {
    getSession: getSession, setSession: setSession, clearSession: clearSession, sair: sair,
    esc: esc, fmtData: fmtData, fmtDataHora: fmtDataHora, statusBadge: statusBadge, STATUS: STATUS, PRIORIDADE: PRIORIDADE,
    anunciar: anunciar, feedback: feedback, abrirModal: abrirModal, fecharModal: fecharModal, ligarModal: ligarModal,
    confirmar: confirmar, iniciarPagina: iniciarPagina, ehGestor: ehGestor, opcoes: opcoes,
    ajustarMenusAcoes: ajustarMenusAcoes,
  };
})();
