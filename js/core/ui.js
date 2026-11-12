/* Utilitários visuais, feedback, modais e menus. */
var AppCore = window.AppCore || {};
AppCore.ui = (function () {
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
    return iso ? new Date(iso).toLocaleString("pt-BR") : "—";
  }
  function statusBadge(status) {
    var s = AppCore.STATUS[status] || { icone: "circle-exclamation-point", rotulo: status };
    return (
      '<span class="badge ' +
      esc(status) +
      '"><span class="icon icon-' +
      s.icone +
      '" aria-hidden="true"></span> ' +
      esc(s.rotulo) +
      "</span>"
    );
  }
  function anunciar(msg) {
    var r = document.getElementById("avisos");
    if (!r) return;
    r.textContent = "";
    setTimeout(function () {
      r.textContent = msg;
    }, 50);
  }
  function feedback(el, msg, tipo) {
    el.textContent = msg || "";
    el.className = "feedback" + (msg && tipo ? " " + tipo : "");
    el.setAttribute("role", tipo === "erro" ? "alert" : "status");
  }
  function focaveis(raiz) {
    return Array.prototype.slice.call(
      raiz.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled])',
      ),
    );
  }
  function abrirModal(overlay, focoInicial) {
    AppCore.focoAnterior = document.activeElement;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    var alvo = focoInicial || focaveis(overlay.querySelector(".modal"))[1] || focaveis(overlay)[0];
    if (alvo) alvo.focus();
    overlay._trap = function (e) {
      if (e.key === "Escape") {
        fecharModal(overlay);
        return;
      }
      if (e.key !== "Tab") return;
      var f = focaveis(overlay);
      if (!f.length) return;
      var primeiro = f[0],
        ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    overlay.addEventListener("keydown", overlay._trap);
  }
  function fecharModal(overlay) {
    if (overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    if (overlay._trap) overlay.removeEventListener("keydown", overlay._trap);
    if (AppCore.focoAnterior && document.contains(AppCore.focoAnterior))
      AppCore.focoAnterior.focus();
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
        if (menu && menu.matches(":popover-open") && typeof menu.hidePopover === "function")
          menu.hidePopover();
      });
      document.addEventListener("pointerdown", function (e) {
        Array.prototype.forEach.call(
          host.querySelectorAll(".actions-dropdown:popover-open"),
          function (menu) {
            var trigger = host.querySelector('[data-actions-trigger="' + menu.id + '"]');
            if (
              !menu.contains(e.target) &&
              trigger !== e.target &&
              !(trigger && trigger.contains(e.target))
            )
              menu.hidePopover();
          },
        );
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape")
          Array.prototype.forEach.call(
            host.querySelectorAll(".actions-dropdown:popover-open"),
            function (menu) {
              menu.hidePopover();
            },
          );
      });
    }
    Array.prototype.forEach.call(
      host.querySelectorAll(".actions-dropdown[popover]"),
      function (menu) {
        var trigger = host.querySelector('[data-actions-trigger="' + menu.id + '"]');
        if (!trigger) return;
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          if (menu.matches(":popover-open")) {
            menu.hidePopover();
            return;
          }
          menu.style.visibility = "hidden";
          menu.showPopover();
          var r = trigger.getBoundingClientRect();
          var w = menu.offsetWidth,
            h = menu.offsetHeight;
          var left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w));
          var top =
            r.bottom + h + 8 <= window.innerHeight ? r.bottom + 4 : Math.max(8, r.top - h - 4);
          menu.style.left = left + "px";
          menu.style.top = top + "px";
          menu.style.visibility = "visible";
        });
      },
    );
  }
  function confirmar(mensagem, rotuloConfirmar) {
    return new Promise(function (resolve) {
      var o = document.createElement("div");
      o.className = "modal-overlay hidden";
      o.innerHTML =
        '<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="cfTitulo" aria-describedby="cfMsg">' +
        '<h3 class="modal-title" id="cfTitulo">Confirmar ação</h3><p id="cfMsg">' +
        esc(mensagem) +
        "</p>" +
        '<div class="form-actions"><button type="button" class="btn" data-nao>Cancelar</button>' +
        '<button type="button" class="btn btn-danger" data-sim>' +
        esc(rotuloConfirmar || "Confirmar") +
        "</button></div></div>";
      document.body.appendChild(o);
      function fim(v) {
        fecharModal(o);
        o.remove();
        resolve(v);
      }
      o.querySelector("[data-sim]").addEventListener("click", function () {
        fim(true);
      });
      o.querySelector("[data-nao]").addEventListener("click", function () {
        fim(false);
      });
      o.addEventListener("click", function (e) {
        if (e.target === o) fim(false);
      });
      o.addEventListener("keydown", function (e) {
        if (e.key === "Escape") fim(false);
      });
      abrirModal(o, o.querySelector("[data-nao]"));
    });
  }
  function opcoes(lista, valor, rotulo, vazio, selecionado) {
    var h = vazio != null ? '<option value="">' + esc(vazio) + "</option>" : "";
    return (
      h +
      lista
        .map(function (i) {
          return (
            '<option value="' +
            esc(i[valor]) +
            '"' +
            (String(i[valor]) === String(selecionado) ? " selected" : "") +
            ">" +
            esc(i[rotulo]) +
            "</option>"
          );
        })
        .join("")
    );
  }
  return {
    esc: esc,
    fmtData: fmtData,
    fmtDataHora: fmtDataHora,
    statusBadge: statusBadge,
    anunciar: anunciar,
    feedback: feedback,
    abrirModal: abrirModal,
    fecharModal: fecharModal,
    ligarModal: ligarModal,
    ajustarMenusAcoes: ajustarMenusAcoes,
    confirmar: confirmar,
    opcoes: opcoes,
  };
})();
