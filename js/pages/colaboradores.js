document.addEventListener("DOMContentLoaded", async function () {
  var u = App.iniciarPagina({ atual: "colaboradores", papeis: ["Admin", "Gestor"] });
  if (!u) return;
  var lista = document.getElementById("colabLista"), fb = document.getElementById("colabFeedback");
  var modal = document.getElementById("colabModal"), erro = document.getElementById("colabFormErro"), cache = [];
  App.ligarModal(modal);

  async function carregar() {
    try {
      cache = await AppServices.colaboradorService.listar(false);
      lista.innerHTML = cache.length ? '<table><caption class="sr-only">Lista de colaboradores</caption><thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Cargo</th><th scope="col">Situação</th><th scope="col">Ações</th></tr></thead><tbody>' +
        cache.map(function (c) {
          return "<tr><td>" + App.esc(c.nome) + "</td><td>" + App.esc(c.email || "—") + "</td><td>" + App.esc(c.cargo || "—") + "</td><td>" + (c.ativo ? "Ativo" : "Inativo") +
            '</td><td><button class="actions-trigger" type="button" data-actions-trigger="acoesColab' + c.id + '">Ações <span class="icon icon-chevron-down" aria-hidden="true"></span></button><div class="actions-dropdown" id="acoesColab' + c.id + '" popover="manual">' +
            '<button type="button" data-editar="' + c.id + '" aria-label="Editar ' + App.esc(c.nome) + '">Editar</button><hr>' +
            '<button class="action-danger" type="button" data-excluir="' + c.id + '" aria-label="Excluir ' + App.esc(c.nome) + '">Excluir</button></div></td></tr>';
        }).join("") + "</tbody></table>" : '<div class="empty-state">Nenhum colaborador cadastrado.</div>';
      App.ajustarMenusAcoes(lista);
    } catch (e) { App.feedback(fb, e.message, "erro"); }
  }

  function abrir(c) {
    App.feedback(erro, "");
    document.getElementById("colabModalTitulo").textContent = c ? "Editar colaborador" : "Novo colaborador";
    document.getElementById("colabId").value = c ? c.id : "";
    document.getElementById("colabNome").value = c ? c.nome : "";
    document.getElementById("colabEmail").value = c && c.email ? c.email : "";
    document.getElementById("colabCargo").value = c && c.cargo ? c.cargo : "";
    App.abrirModal(modal);
  }

  document.getElementById("abrirModalColab").addEventListener("click", function () { abrir(null); });
  document.getElementById("colabForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var d = { nome: document.getElementById("colabNome").value.trim(), email: document.getElementById("colabEmail").value.trim(), cargo: document.getElementById("colabCargo").value.trim() };
    if (!d.nome) { App.feedback(erro, "Informe o nome.", "erro"); return; }
    try {
      var id = document.getElementById("colabId").value;
      if (id) await AppServices.colaboradorService.atualizar(id, d); else await AppServices.colaboradorService.criar(d);
      App.fecharModal(modal); App.feedback(fb, "Colaborador salvo com sucesso.", "ok"); await carregar();
    } catch (err) { App.feedback(erro, err.message, "erro"); }
  });

  lista.addEventListener("click", async function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.editar) { abrir(cache.find(function (c) { return c.id === Number(b.dataset.editar); })); return; }
    if (b.dataset.excluir && await App.confirmar("Deseja excluir este colaborador? Se houver tarefas abertas, ele será apenas inativado.", "Excluir")) {
      try {
        var r = await AppServices.colaboradorService.remover(b.dataset.excluir);
        App.feedback(fb, r && r.mensagem ? r.mensagem : "Colaborador excluído.", "ok"); await carregar();
      } catch (err) { App.feedback(fb, err.message, "erro"); }
    }
  });
  carregar();
});
