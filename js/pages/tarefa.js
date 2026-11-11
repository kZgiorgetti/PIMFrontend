document.addEventListener("DOMContentLoaded", async function () {
  var u = App.iniciarPagina({ atual: "tarefas" });
  if (!u) return;
  var gestor = App.ehGestor(u);
  var id = new URLSearchParams(location.search).get("id");
  var fb = document.getElementById("detFeedback"), box = document.getElementById("detalhe");
  var tituloPagina = document.getElementById("detTitulo");
  var colaboradores = [];

  if (!id) { App.feedback(fb, "Tarefa não informada.", "erro"); return; }

  async function carregar() {
    try {
      var t = await AppServices.tarefaService.obter(id);
      var results = await Promise.all([AppServices.tarefaService.comentarios(id), AppServices.tarefaService.historico(id)]);
      if (gestor && !colaboradores.length) colaboradores = await AppServices.colaboradorService.listar(true);
      render(t, results[0], results[1]);
    } catch (e) { App.feedback(fb, e.message, "erro"); box.innerHTML = ""; }
  }

  function render(t, comentarios, historico) {
    document.title = t.titulo + " - Almoxarifado";
    tituloPagina.textContent = t.titulo;
    var statusOpts = Object.keys(App.STATUS).map(function (k) {
      return '<option value="' + k + '"' + (k === t.status ? " selected" : "") + ">" + App.STATUS[k].rotulo + "</option>";
    }).join("");
    box.innerHTML =
      '<div>' + App.statusBadge(t.status) +
      (t.atrasada ? ' <span class="badge atrasada"><span class="icon icon-circle-exclamation-point" aria-hidden="true"></span> Atrasada</span>' : "") + "</div>" +
      "<p>" + App.esc(t.descricao || "Sem descrição.") + "</p>" +
      '<div class="task-meta"><span>Responsável: ' + App.esc(t.colaboradorNome || "Sem responsável") + "</span><span>Equipe: " + App.esc(t.equipeNome || "—") +
      "</span><span>Prioridade: " + App.esc(App.PRIORIDADE[t.prioridade]) + "</span><span>Prazo: " + App.fmtData(t.dataPrazo) + "</span></div>" +
      '<form id="taskChangesForm" class="form"><div class="form-row"><div class="form-group"><label for="novoStatus">Status</label><select id="novoStatus">' + statusOpts + "</select></div>" +
      (gestor ? '<div class="form-group"><label for="novoResp">Pessoa responsável</label><select id="novoResp">' +
        App.opcoes(colaboradores, "id", "nome", "Sem responsável", t.colaboradorId) + '</select></div>' : "") + "</div></form>" +
      '<section class="detail-section" aria-labelledby="histTitulo"><h3 id="histTitulo">Histórico de status</h3>' +
      (historico.length ? '<ol class="lista-simples">' + historico.map(function (h) {
        return "<li>" + App.fmtDataHora(h.dataAlteracao) + ": " + App.esc(App.STATUS[h.statusAnterior].rotulo) + " → " + App.esc(App.STATUS[h.statusNovo].rotulo) +
          (h.usuarioId ? " (usuário #" + h.usuarioId + ")" : "") + "</li>";
      }).join("") + "</ol>" : '<p class="empty-state">Sem alterações de status.</p>') + "</section>" +
      '<section class="detail-section" aria-labelledby="comTitulo"><h3 id="comTitulo">Comentários</h3><div class="stack">' +
      (comentarios.length ? comentarios.map(function (c) {
        return '<div class="comentario"><small>' + App.esc(c.usuarioNome || "Usuário") + " · " + App.fmtDataHora(c.dataCriacao) + "</small><p>" + App.esc(c.texto) + "</p></div>";
      }).join("") : '<p class="empty-state">Nenhum comentário ainda.</p>') + "</div></section>" +
      '<section class="detail-section" aria-label="Adicionar comentário"><form id="comentarioForm" class="form"><div class="form-group"><label for="comentarioTexto">Novo comentário</label><textarea id="comentarioTexto" rows="3" maxlength="1000" required></textarea></div>' +
      '<div class="form-actions"><button class="btn btn-primary" type="submit">Comentar</button></div></form></section>';

    document.getElementById("taskChangesForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var status = document.getElementById("novoStatus").value;
      var responsavel = gestor ? document.getElementById("novoResp").value : "";
      var alterou = false;
      try {
        if (status !== t.status) { await AppServices.tarefaService.alterarStatus(id, status); alterou = true; }
        if (gestor && responsavel !== String(t.colaboradorId || "")) { await AppServices.tarefaService.reatribuir(id, responsavel); alterou = true; }
        if (!alterou) { App.feedback(fb, "Nenhuma alteração para confirmar."); return; }
        await carregar();
        App.feedback(fb, "Alterações salvas com sucesso.", "ok");
        App.anunciar("Alterações salvas com sucesso.");
      } catch (err) { App.feedback(fb, err.message, "erro"); }
    });
    document.getElementById("comentarioForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var txt = document.getElementById("comentarioTexto").value.trim();
      if (!txt) { App.feedback(fb, "Escreva o comentário antes de enviar.", "erro"); return; }
      await agir(function () { return AppServices.tarefaService.comentar(id, txt); }, "Comentário adicionado.");
    });
  }

  async function agir(fn, msgOk) {
    try { await fn(); await carregar(); App.feedback(fb, msgOk, "ok"); App.anunciar(msgOk); }
    catch (err) { App.feedback(fb, err.message, "erro"); }
  }
  carregar();
});
