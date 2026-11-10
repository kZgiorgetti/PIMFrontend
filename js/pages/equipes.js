document.addEventListener("DOMContentLoaded", async function () {
  var u = App.iniciarPagina({ atual: "equipes", papeis: ["Admin", "Gestor"] });
  if (!u) return;
  var lista = document.getElementById("equipesLista"), fb = document.getElementById("equipeFeedback");
  var modal = document.getElementById("equipeModal"), erro = document.getElementById("equipeFormErro"), equipes = [], colabs = [];
  App.ligarModal(modal);

  async function carregar() {
    try {
      var r = await Promise.all([AppServices.equipeService.listar(), AppServices.colaboradorService.listar(true)]);
      equipes = r[0]; colabs = r[1];
      lista.innerHTML = equipes.length ? equipes.map(function (e) {
        var livres = colabs.filter(function (c) { return !e.membros.some(function (m) { return m.id === c.id; }); });
        return '<article class="team-card" aria-labelledby="eq' + e.id + '"><div class="team-card-header"><h3 id="eq' + e.id + '">' + App.esc(e.nome) + "</h3><div>" +
          '<button class="actions-trigger" type="button" data-actions-trigger="acoesEquipe' + e.id + '">Ações <span aria-hidden="true">▾</span></button><div class="actions-dropdown" id="acoesEquipe' + e.id + '" popover="manual">' +
          '<button type="button" data-editar="' + e.id + '" aria-label="Editar equipe ' + App.esc(e.nome) + '">Editar</button><hr>' +
          '<button class="action-danger" type="button" data-excluir="' + e.id + '" aria-label="Excluir equipe ' + App.esc(e.nome) + '">Excluir</button></div></div></div>' +
          "<p>" + App.esc(e.descricao || "Sem descrição.") + "</p><h4>Membros</h4>" +
          (e.membros.length ? '<div class="table-wrap"><table><caption class="sr-only">Membros da equipe ' + App.esc(e.nome) + '</caption><thead><tr><th scope="col">Nome</th><th scope="col">Ações</th></tr></thead><tbody>' + e.membros.map(function (m) {
            return '<tr><td>' + App.esc(m.nome) + '</td><td class="team-member-actions"><button class="actions-trigger" type="button" data-actions-trigger="acoesMembro' + e.id + '_' + m.id + '">Ações <span aria-hidden="true">▾</span></button><div class="actions-dropdown" id="acoesMembro' + e.id + '_' + m.id + '" popover="manual"><button class="action-danger" type="button" data-remover="' + e.id + ":" + m.id + '" aria-label="Remover ' + App.esc(m.nome) + " da equipe " + App.esc(e.nome) + '">Remover</button></div></td></tr>';
          }).join("") + "</tbody></table></div>" : '<p class="empty-state">Sem membros.</p>') +
          (livres.length ? '<div class="form-row team-add-member"><div class="form-group"><label for="add' + e.id + '">Adicionar pessoa</label><select id="add' + e.id + '">' + App.opcoes(livres, "id", "nome") +
            '</select></div><div class="form-group"><span></span><button class="btn" type="button" data-adicionar="' + e.id + '">Adicionar</button></div></div>' : "") + "</article>";
      }).join("") : '<div class="empty-state">Nenhuma equipe cadastrada.</div>';
      App.ajustarMenusAcoes(lista);
    } catch (err) { App.feedback(fb, err.message, "erro"); }
  }

  function abrir(e) {
    App.feedback(erro, "");
    document.getElementById("equipeModalTitulo").textContent = e ? "Editar equipe" : "Nova equipe";
    document.getElementById("equipeId").value = e ? e.id : "";
    document.getElementById("equipeNome").value = e ? e.nome : "";
    document.getElementById("equipeDescricao").value = e && e.descricao ? e.descricao : "";
    App.abrirModal(modal);
  }
  document.getElementById("abrirModalEquipe").addEventListener("click", function () { abrir(null); });
  document.getElementById("equipeForm").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var d = { nome: document.getElementById("equipeNome").value.trim(), descricao: document.getElementById("equipeDescricao").value.trim() };
    if (!d.nome) { App.feedback(erro, "Informe o nome da equipe.", "erro"); return; }
    try {
      var id = document.getElementById("equipeId").value;
      if (id) await AppServices.equipeService.atualizar(id, d); else await AppServices.equipeService.criar(d);
      App.fecharModal(modal); App.feedback(fb, "Equipe salva com sucesso.", "ok"); await carregar();
    } catch (err) { App.feedback(erro, err.message, "erro"); }
  });

  lista.addEventListener("click", async function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    try {
      if (b.dataset.editar) abrir(equipes.find(function (x) { return x.id === Number(b.dataset.editar); }));
      else if (b.dataset.excluir) {
        if (await App.confirmar("Deseja excluir esta equipe?", "Excluir")) { await AppServices.equipeService.excluir(b.dataset.excluir); App.feedback(fb, "Equipe excluída.", "ok"); await carregar(); }
      } else if (b.dataset.adicionar) {
        var sel = document.getElementById("add" + b.dataset.adicionar);
        await AppServices.equipeService.adicionarColaborador(b.dataset.adicionar, sel.value); App.feedback(fb, "Pessoa adicionada à equipe.", "ok"); await carregar();
      } else if (b.dataset.remover) {
        var p = b.dataset.remover.split(":");
        await AppServices.equipeService.removerColaborador(p[0], p[1]); App.feedback(fb, "Pessoa removida da equipe.", "ok"); await carregar();
      }
    } catch (err) { App.feedback(fb, err.message, "erro"); }
  });
  carregar();
});
