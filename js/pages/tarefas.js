document.addEventListener("DOMContentLoaded", async function () {
  var u = App.iniciarPagina({ atual: "tarefas" });
  if (!u) return;
  var gestor = App.ehGestor(u);

  var lista = document.getElementById("tarefasList"), fb = document.getElementById("tarefaFeedback");
  var modal = document.getElementById("tarefaModal"), form = document.getElementById("tarefaForm");
  var formErro = document.getElementById("tarefaFormErro");
  var pagina = 1, tamanho = 10, total = 0, cache = [], colaboradores = [], equipes = [];
  App.ligarModal(modal);

  if (gestor) {
    document.getElementById("abrirModalTarefa").classList.remove("hidden");
    document.getElementById("fColabWrap").classList.remove("hidden");
    try {
      colaboradores = await AppServices.colaboradorService.listar(true);
      equipes = await AppServices.equipeService.listar();
    } catch (e) { App.feedback(fb, e.message, "erro"); }
    document.getElementById("fColab").innerHTML = App.opcoes(colaboradores, "id", "nome", "Todas as pessoas");
    document.getElementById("tarefaColaborador").innerHTML = App.opcoes(colaboradores, "id", "nome", "Sem responsável");
    document.getElementById("tarefaEquipe").innerHTML = App.opcoes(equipes, "id", "nome", "Sem equipe");
  }

  function filtros() {
    return {
      busca: document.getElementById("fBusca").value.trim(), status: document.getElementById("fStatus").value,
      prioridade: document.getElementById("fPrioridade").value, colaboradorId: gestor ? document.getElementById("fColab").value : "",
      page: pagina, pageSize: tamanho,
    };
  }

  async function carregar(anunciar) {
    try {
      var r = await AppServices.tarefaService.listar(filtros());
      cache = r.itens; total = r.total;
      lista.innerHTML = cache.length ? '<table><caption class="sr-only">Lista de tarefas</caption><thead><tr><th scope="col">Tarefa</th><th scope="col">Responsável</th><th scope="col">Prioridade</th><th scope="col">Status</th><th scope="col">Prazo</th><th scope="col">Ações</th></tr></thead><tbody>' + cache.map(linha).join("") + '</tbody></table>' : '<div class="empty-state">Nenhuma tarefa encontrada.</div>';
      App.ajustarMenusAcoes(lista);
      var paginas = Math.max(1, Math.ceil(total / tamanho));
      document.getElementById("pgInfo").textContent = "Página " + pagina + " de " + paginas + " (" + total + " tarefas)";
      document.getElementById("pgAnterior").disabled = pagina <= 1;
      document.getElementById("pgProxima").disabled = pagina >= paginas;
      if (anunciar) App.anunciar(total + " tarefas encontradas.");
    } catch (e) { App.feedback(fb, e.message, "erro"); }
  }

  function linha(t) {
    var acoes = '<button class="actions-trigger" type="button" data-actions-trigger="acoesTarefa' + t.id + '">Ações <span aria-hidden="true">▾</span></button><div class="actions-dropdown" id="acoesTarefa' + t.id + '" popover="manual">' +
      '<a href="/pages/tarefa.html?id=' + t.id + '">Ver detalhes</a>';
    if (t.status !== "Concluida") acoes += '<button type="button" data-concluir="' + t.id + '" aria-label="Concluir tarefa ' + App.esc(t.titulo) + '">Concluir</button>';
    if (gestor) acoes += '<button type="button" data-editar="' + t.id + '" aria-label="Editar tarefa ' + App.esc(t.titulo) + '">Editar</button>' +
      '<hr><button class="action-danger" type="button" data-excluir="' + t.id + '" aria-label="Excluir tarefa ' + App.esc(t.titulo) + '">Excluir</button>';
    acoes += '</div>';
    return '<tr><td><strong>' + App.esc(t.titulo) + '</strong></td><td>' + App.esc(t.colaboradorNome || "Sem responsável") + '</td><td>' +
      App.esc(App.PRIORIDADE[t.prioridade]) + '</td><td>' + App.statusBadge(t.status) + (t.atrasada ? ' <span class="badge atrasada"><span aria-hidden="true">!</span> Atrasada</span>' : "") +
      '</td><td>' + App.fmtData(t.dataPrazo) + '</td><td>' + acoes + '</td></tr>';
  }

  function abrir(t) {
    App.feedback(formErro, "");
    document.getElementById("tarefaModalTitulo").textContent = t ? "Editar tarefa" : "Nova tarefa";
    document.getElementById("tarefaId").value = t ? t.id : "";
    document.getElementById("tarefaTitulo").value = t ? t.titulo : "";
    document.getElementById("tarefaDescricao").value = t ? t.descricao : "";
    document.getElementById("tarefaPrioridade").value = t ? t.prioridade : "Media";
    document.getElementById("tarefaPrazo").value = t && t.dataPrazo ? t.dataPrazo.slice(0, 10) : "";
    document.getElementById("tarefaColaborador").value = t && t.colaboradorId ? t.colaboradorId : "";
    document.getElementById("tarefaEquipe").value = t && t.equipeId ? t.equipeId : "";
    App.abrirModal(modal);
  }

  document.getElementById("abrirModalTarefa").addEventListener("click", function () { abrir(null); });
  document.getElementById("filtros").addEventListener("submit", function (e) { e.preventDefault(); pagina = 1; carregar(true); });
  document.getElementById("pgAnterior").addEventListener("click", function () { pagina--; carregar(); });
  document.getElementById("pgProxima").addEventListener("click", function () { pagina++; carregar(); });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var dados = {
      titulo: document.getElementById("tarefaTitulo").value.trim(), descricao: document.getElementById("tarefaDescricao").value,
      prioridade: document.getElementById("tarefaPrioridade").value, dataPrazo: document.getElementById("tarefaPrazo").value,
      colaboradorId: document.getElementById("tarefaColaborador").value, equipeId: document.getElementById("tarefaEquipe").value,
    };
    if (!dados.titulo) { App.feedback(formErro, "Informe o título da tarefa.", "erro"); return; }
    try {
      var id = document.getElementById("tarefaId").value;
      if (id) await AppServices.tarefaService.atualizar(id, dados); else await AppServices.tarefaService.criar(dados);
      App.fecharModal(modal);
      App.feedback(fb, "Tarefa salva com sucesso.", "ok");
      await carregar();
    } catch (err) { App.feedback(formErro, err.message, "erro"); }
  });

  lista.addEventListener("click", async function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    try {
      if (b.dataset.concluir) { await AppServices.tarefaService.concluir(b.dataset.concluir); App.feedback(fb, "Tarefa concluída.", "ok"); await carregar(); }
      else if (b.dataset.editar) abrir(cache.find(function (t) { return t.id === Number(b.dataset.editar); }));
      else if (b.dataset.excluir) {
        if (await App.confirmar("Deseja realmente excluir esta tarefa?", "Excluir")) {
          await AppServices.tarefaService.excluir(b.dataset.excluir);
          App.feedback(fb, "Tarefa excluída.", "ok"); await carregar();
        }
      }
    } catch (err) { App.feedback(fb, err.message, "erro"); }
  });

  carregar();
});
