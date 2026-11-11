document.addEventListener("DOMContentLoaded", async function () {
  var u = App.iniciarPagina({ atual: "usuarios", papeis: ["Admin"] });
  if (!u) return;
  var lista = document.getElementById("usuariosLista"), fb = document.getElementById("usuarioFeedback");
  var modal = document.getElementById("usuarioModal"), erro = document.getElementById("usuarioFormErro"), cache = [];
  var modalSenha = document.getElementById("senhaModal"), erroSenha = document.getElementById("senhaFormErro");
  App.ligarModal(modal); App.ligarModal(modalSenha);

  async function carregar() {
    try {
      cache = await AppServices.usuarioService.listar();
      lista.innerHTML = '<table><caption class="sr-only">Lista de usuários</caption><thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Perfil</th><th scope="col">Situação</th><th scope="col">Ações</th></tr></thead><tbody>' +
        cache.map(function (x) {
          var proprio = x.id === u.id;
          return "<tr><td>" + App.esc(x.nome) + "</td><td>" + App.esc(x.email) + "</td><td>" + App.esc(x.perfil) + "</td><td>" + (x.ativo ? "✔ Ativo" : "✖ Inativo") + "</td><td>" +
            '<button class="actions-trigger" type="button" data-actions-trigger="acoesUsuario' + x.id + '">Ações <span class="icon icon-chevron-down" aria-hidden="true"></span></button><div class="actions-dropdown" id="acoesUsuario' + x.id + '" popover="manual">' +
            '<button type="button" data-editar="' + x.id + '" aria-label="Editar ' + App.esc(x.nome) + '">Editar</button>' +
            '<button type="button" data-senha="' + x.id + '" aria-label="Redefinir senha de ' + App.esc(x.nome) + '">Redefinir senha</button>' +
            (proprio ? "" : '<hr><button class="' + (x.ativo ? "action-danger" : "") + '" type="button" data-ativo="' + x.id + ":" + (x.ativo ? "0" : "1") + '" aria-label="' + (x.ativo ? "Inativar " : "Ativar ") + App.esc(x.nome) + '">' + (x.ativo ? "Inativar" : "Ativar") + "</button>") +
            "</div></td></tr>";
        }).join("") + "</tbody></table>";
      App.ajustarMenusAcoes(lista);
    } catch (e) { App.feedback(fb, e.message, "erro"); }
  }

  function abrir(x) {
    App.feedback(erro, "");
    document.getElementById("usuarioModalTitulo").textContent = x ? "Editar usuário" : "Novo usuário";
    document.getElementById("usuarioId").value = x ? x.id : "";
    document.getElementById("usuarioNome").value = x ? x.nome : "";
    document.getElementById("usuarioEmail").value = x ? x.email : "";
    document.getElementById("usuarioSenha").value = "";
    document.getElementById("grupoSenha").classList.toggle("hidden", !!x);
    document.getElementById("usuarioPerfil").value = x ? x.perfil : "Colaborador";
    App.abrirModal(modal);
  }
  document.getElementById("abrirModalUsuario").addEventListener("click", function () { abrir(null); });

  document.getElementById("usuarioForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var d = { nome: document.getElementById("usuarioNome").value.trim(), email: document.getElementById("usuarioEmail").value.trim(),
      senha: document.getElementById("usuarioSenha").value, perfil: document.getElementById("usuarioPerfil").value };
    var id = document.getElementById("usuarioId").value;
    if (!d.nome || !d.email || (!id && !d.senha)) { App.feedback(erro, "Preencha nome, e-mail" + (id ? "" : " e senha") + ".", "erro"); return; }
    try {
      if (id) await AppServices.usuarioService.atualizar(id, d); else await AppServices.usuarioService.criar(d);
      App.fecharModal(modal); App.feedback(fb, "Usuário salvo com sucesso.", "ok"); await carregar();
    } catch (err) { App.feedback(erro, err.message, "erro"); }
  });

  document.getElementById("senhaForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      await AppServices.usuarioService.redefinirSenha(document.getElementById("senhaUsuarioId").value, document.getElementById("novaSenha").value);
      App.fecharModal(modalSenha); App.feedback(fb, "Senha redefinida.", "ok");
    } catch (err) { App.feedback(erroSenha, err.message, "erro"); }
  });

  lista.addEventListener("click", async function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    try {
      if (b.dataset.editar) abrir(cache.find(function (x) { return x.id === Number(b.dataset.editar); }));
      else if (b.dataset.senha) {
        App.feedback(erroSenha, ""); document.getElementById("senhaUsuarioId").value = b.dataset.senha; document.getElementById("novaSenha").value = "";
        App.abrirModal(modalSenha);
      } else if (b.dataset.ativo) {
        var p = b.dataset.ativo.split(":");
        if (p[1] === "0") { if (!(await App.confirmar("Inativar este usuário? Ele não poderá mais entrar no sistema.", "Inativar"))) return; await AppServices.usuarioService.inativar(p[0]); }
        else await AppServices.usuarioService.ativar(p[0]);
        App.feedback(fb, "Situação do usuário atualizada.", "ok"); await carregar();
      }
    } catch (err) { App.feedback(fb, err.message, "erro"); }
  });
  carregar();
});
