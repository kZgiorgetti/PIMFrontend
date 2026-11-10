var AppServices = AppServices || {};

/* Cliente HTTP: anexa o Bearer, tenta refresh uma vez em 401 e devolve mensagens amigáveis (ProblemDetails). */
AppServices.apiService = (function () {
  var BASE = ((window.PIM_CONFIG && window.PIM_CONFIG.apiUrl) || "").replace(/\/$/, "");
  var ROOT = BASE + "/api/v1";
  var refreshando = null;

  async function lerResposta(resp) {
    if (resp.status === 204) return null;
    var data = null;
    try { data = await resp.json(); } catch (e) { /* sem corpo */ }
    if (!resp.ok) {
      var msg = (data && (data.error || data.detail)) || "Erro inesperado (" + resp.status + ").";
      if (data && data.errors) msg = Object.keys(data.errors).map(function (k) { return data.errors[k].join(" "); }).join(" ");
      var err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    return data;
  }

  async function renovar() {
    var s = App.getSession();
    if (!s || !s.refreshToken) return false;
    try {
      var r = await fetch(ROOT + "/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: s.refreshToken }),
      });
      if (!r.ok) return false;
      var t = await r.json();
      App.setSession({ accessToken: t.accessToken, refreshToken: t.refreshToken, usuario: t.usuario });
      return true;
    } catch (e) { return false; }
  }

  async function request(metodo, caminho, corpo, jaTentou) {
    var s = App.getSession();
    var headers = {};
    if (corpo !== undefined) headers["Content-Type"] = "application/json";
    if (s && s.accessToken) headers["Authorization"] = "Bearer " + s.accessToken;
    var resp = await fetch(ROOT + caminho, { method: metodo, headers: headers, body: corpo !== undefined ? JSON.stringify(corpo) : undefined });

    if (resp.status === 401 && !jaTentou && s && s.refreshToken && caminho.indexOf("/auth/") !== 0) {
      if (!refreshando) refreshando = renovar().finally(function () { refreshando = null; });
      var ok = await refreshando;
      if (ok) return request(metodo, caminho, corpo, true);
      App.sair(true);
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }
    return lerResposta(resp);
  }

  return {
    get: function (c) { return request("GET", c); },
    post: function (c, b) { return request("POST", c, b === undefined ? {} : b); },
    put: function (c, b) { return request("PUT", c, b); },
    patch: function (c, b) { return request("PATCH", c, b); },
    del: function (c) { return request("DELETE", c); },
  };
})();
