var AppServices = AppServices || {};
(function () {
  var api = AppServices.apiService;

  AppServices.authService = {
    login: function (email, senha) { return api.post("/auth/login", { email: email, senha: senha }); },
  };

  AppServices.tarefaService = {
    listar: function (f) {
      var q = new URLSearchParams();
      Object.keys(f || {}).forEach(function (k) { if (f[k] !== "" && f[k] != null) q.set(k, f[k]); });
      return api.get("/tarefas?" + q.toString());
    },
    obter: function (id) { return api.get("/tarefas/" + id); },
    criar: function (d) { return api.post("/tarefas", AppDTOs.tarefaPayload(d)); },
    atualizar: function (id, d) { return api.put("/tarefas/" + id, AppDTOs.tarefaPayload(d)); },
    excluir: function (id) { return api.del("/tarefas/" + id); },
    alterarStatus: function (id, status) { return api.patch("/tarefas/" + id + "/status", { status: status }); },
    concluir: function (id) { return api.post("/tarefas/" + id + "/concluir"); },
    reatribuir: function (id, colaboradorId) { return api.post("/tarefas/" + id + "/reatribuir", { colaboradorId: colaboradorId ? Number(colaboradorId) : null }); },
    historico: function (id) { return api.get("/tarefas/" + id + "/historico"); },
    comentarios: function (id) { return api.get("/tarefas/" + id + "/comentarios"); },
    comentar: function (id, texto) { return api.post("/tarefas/" + id + "/comentarios", { texto: texto }); },
  };

  AppServices.colaboradorService = {
    listar: function (apenasAtivos) { return api.get("/colaboradores?apenasAtivos=" + (apenasAtivos ? "true" : "false")); },
    criar: function (d) { return api.post("/colaboradores", AppDTOs.colaboradorPayload(d)); },
    atualizar: function (id, d) { return api.put("/colaboradores/" + id, AppDTOs.colaboradorPayload(d)); },
    remover: function (id) { return api.del("/colaboradores/" + id); },
  };

  AppServices.equipeService = {
    listar: function () { return api.get("/equipes"); },
    criar: function (d) { return api.post("/equipes", AppDTOs.equipePayload(d)); },
    atualizar: function (id, d) { return api.put("/equipes/" + id, AppDTOs.equipePayload(d)); },
    excluir: function (id) { return api.del("/equipes/" + id); },
    adicionarColaborador: function (id, cid) { return api.post("/equipes/" + id + "/colaboradores/" + cid); },
    removerColaborador: function (id, cid) { return api.del("/equipes/" + id + "/colaboradores/" + cid); },
  };

  AppServices.usuarioService = {
    listar: function () { return api.get("/usuarios"); },
    criar: function (d) { return api.post("/usuarios", AppDTOs.usuarioCriarPayload(d)); },
    atualizar: function (id, d) { return api.put("/usuarios/" + id, AppDTOs.usuarioAtualizarPayload(d)); },
    redefinirSenha: function (id, senha) { return api.post("/usuarios/" + id + "/redefinir-senha", { novaSenha: senha }); },
    ativar: function (id) { return api.post("/usuarios/" + id + "/ativar"); },
    inativar: function (id) { return api.post("/usuarios/" + id + "/inativar"); },
  };

  AppServices.relatorioService = {
    resumo: function () { return api.get("/relatorios/resumo-por-colaborador"); },
    atrasadas: function () { return api.get("/relatorios/atrasadas"); },
  };
})();
