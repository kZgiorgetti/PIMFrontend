// Verificação simples: sintaxe de todos os .js e ausência de scripts/estilos inline (a CSP do nginx os bloqueia).
const fs = require("fs"), path = require("path"), cp = require("child_process");
let erros = 0;
function* arquivos(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "docs"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* arquivos(p); else yield p;
  }
}
for (const f of arquivos(".")) {
  if (f.endsWith(".js") && !f.startsWith("scripts")) {
    try { cp.execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); } catch (e) { console.error("Sintaxe inválida:", f); erros++; }
  }
  if (f.endsWith(".html")) {
    const s = fs.readFileSync(f, "utf8");
    if (/\sstyle\s*=|\son[a-z]+\s*=/.test(s)) { console.error("Atributo inline (style/on*) em", f); erros++; }
    if (!/<html lang="pt-BR"/.test(s)) { console.error("Falta lang=pt-BR em", f); erros++; }
  }
}
console.log(erros ? `${erros} problema(s)` : "OK");
process.exit(erros ? 1 : 0);
