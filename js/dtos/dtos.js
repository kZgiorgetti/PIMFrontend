var AppDTOs = AppDTOs || {};

/* Conversões entre o formulário e o contrato da API (/api/v1). */
AppDTOs.tarefaPayload = function (f) {
  return {
    titulo: f.titulo,
    descricao: f.descricao || "",
    prioridade: f.prioridade || "Media",
    dataPrazo: f.dataPrazo ? f.dataPrazo + "T23:59:00Z" : null,
    colaboradorId: f.colaboradorId ? Number(f.colaboradorId) : null,
    equipeId: f.equipeId ? Number(f.equipeId) : null,
  };
};
AppDTOs.colaboradorPayload = function (f) {
  return { nome: f.nome, email: f.email || null, cargo: f.cargo || null };
};
AppDTOs.equipePayload = function (f) {
  return { nome: f.nome, descricao: f.descricao || null };
};
AppDTOs.usuarioCriarPayload = function (f) {
  return { nome: f.nome, email: f.email, senha: f.senha, perfil: f.perfil };
};
AppDTOs.usuarioAtualizarPayload = function (f) {
  return { nome: f.nome, email: f.email, perfil: f.perfil };
};
