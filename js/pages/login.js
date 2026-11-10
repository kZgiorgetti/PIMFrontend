document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("loginForm");
  var fb = document.getElementById("loginFeedback");
  var btn = document.getElementById("btnEntrar");

  var s = App.getSession();
  if (s && s.accessToken) { irParaInicio(s.usuario); return; }
  if (new URLSearchParams(location.search).get("expirou")) App.feedback(fb, "Sua sessão expirou. Entre novamente.", "erro");

  function irParaInicio(u) {
    window.location.href = u.perfil === "Colaborador" ? "/pages/tarefas.html" : "/pages/dashboard.html";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = document.getElementById("email").value.trim();
    var senha = document.getElementById("senha").value;
    if (!email || !senha) { App.feedback(fb, "Informe o e-mail e a senha.", "erro"); return; }
    btn.disabled = true;
    App.feedback(fb, "Entrando…", null);
    try {
      var t = await AppServices.authService.login(email, senha);
      App.setSession({ accessToken: t.accessToken, refreshToken: t.refreshToken, usuario: t.usuario });
      irParaInicio(t.usuario);
    } catch (err) {
      App.feedback(fb, err.message, "erro");
      document.getElementById("senha").value = "";
      document.getElementById("senha").focus();
    } finally { btn.disabled = false; }
  });
});
