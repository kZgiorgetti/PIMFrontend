var s = JSON.parse(sessionStorage.getItem("pim.session") || "null");
window.location.replace(s && s.usuario ? (s.usuario.perfil === "Colaborador" ? "/pages/tarefas.html" : "/pages/dashboard.html") : "/pages/login.html");
