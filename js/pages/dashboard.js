document.addEventListener("DOMContentLoaded", async function () {
  var u = App.iniciarPagina({ atual: "dashboard", papeis: ["Admin", "Gestor"] });
  if (!u) return;
  var fb = document.getElementById("painelFeedback");

  try {
    var res = await Promise.all([AppServices.relatorioService.resumo(), AppServices.relatorioService.atrasadas()]);
    var resumo = res[0], atrasadas = res[1];
    var tot = { Pendentes: 0, EmAndamento: 0, Concluidas: 0 };
    resumo.forEach(function (r) { tot.Pendentes += r.pendentes; tot.EmAndamento += r.emAndamento; tot.Concluidas += r.concluidas; });

    document.getElementById("totais").innerHTML =
      card("Pendentes", tot.Pendentes, "clock", "pendente") + card("Em andamento", tot.EmAndamento, "arrow-up-to-line", "andamento") +
      card("Concluídas", tot.Concluidas, "check", "concluida") + card("Atrasadas", atrasadas.length, "circle-exclamation-point", "atrasada");

    document.getElementById("porColaborador").innerHTML = resumo.length ? resumo.map(function (r) {
      return "<li><strong>" + App.esc(r.colaboradorNome) + "</strong>: " + r.concluidas + " de " + r.total + " concluídas (" +
        r.pendentes + " pendentes, " + r.emAndamento + " em andamento)" +
        '<progress max="' + Math.max(r.total, 1) + '" value="' + r.concluidas + '" aria-label="Progresso de ' + App.esc(r.colaboradorNome) + '"></progress></li>';
    }).join("") : '<li class="empty-state">Nenhum colaborador ativo.</li>';

    document.getElementById("atrasadas").innerHTML = atrasadas.length
      ? '<div class="table-wrap"><table><caption class="sr-only">Tarefas atrasadas</caption><thead><tr><th scope="col">Tarefa</th><th scope="col">Responsável</th><th scope="col">Prazo</th><th scope="col">Dias de atraso</th></tr></thead><tbody>' +
        atrasadas.map(function (t) {
          return '<tr><td><a href="/pages/tarefa.html?id=' + t.id + '">' + App.esc(t.titulo) + "</a></td><td>" + App.esc(t.colaboradorNome || "Sem responsável") +
            "</td><td>" + App.fmtData(t.dataPrazo) + "</td><td>" + t.diasAtraso + "</td></tr>";
        }).join("") + "</tbody></table></div>"
      : '<p class="empty-state">Nenhuma tarefa atrasada. 🎉</p>';
  } catch (err) { App.feedback(fb, err.message, "erro"); }

  function card(rotulo, valor, icone, estado) {
    return '<div class="stat stat--' + estado + '"><div><span class="icon icon-' + icone + '" aria-hidden="true"></span> ' + rotulo + '</div><div class="valor">' + valor + "</div></div>";
  }
});
