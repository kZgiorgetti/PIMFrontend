# PIM IV — Frontend web (HTML/CSS/JS)

Aplicação web do sistema de colaboradores e tarefas (UNIP / ADS — PIM IV). Consome a API do repositório **pim-backend** (`/api/v1`).
Sem framework e sem etapa de build: HTML semântico + JS puro, com login (JWT + refresh automático), navegação por perfil, painel, tarefas (filtros, busca, paginação), detalhe com comentários e histórico, colaboradores, equipes, usuários e acessibilidade (WCAG AA, alto contraste, tamanho de fonte).

```
index.html · config.js · styles.css
pages/   login, dashboard, tarefas, tarefa (detalhe), colaboradores, equipes, usuarios
js/      core/app.js · services/ · dtos/ · pages/
docker/  nginx (CSP, cabeçalhos) e geração do config.js
scripts/ check.js (verificação)
```

## Pré-requisitos
- A **API (pim-backend) rodando** e acessível (padrão: http://localhost:5000). Veja o README dele.
- **Uma** das opções: Node.js 18+ (para `npm start`) **ou** Docker.

## Passo 1 — Apontar para a API
A URL fica em `config.js`:
```js
window.PIM_CONFIG = { apiUrl: "http://localhost:5000" };
```
Altere se a API estiver em outro endereço. **Sem barra no final.**
(No Docker, esse arquivo é gerado automaticamente a partir da variável `API_URL`.)

## Passo 2 — Rodar

### Opção A — Node (sem Docker)
```bash
npm start            # serve a pasta em http://localhost:8080
```
Usa o `http-server` via `npx` (baixado na primeira execução). Qualquer servidor estático na **porta 8080** serve (ex.: `python3 -m http.server 8080`).

### Opção B — Docker (nginx)
```bash
cp .env.example .env          # API_URL=http://localhost:5000
docker compose up --build     # http://localhost:8080
```
Ou, sem `.env`: `API_URL=http://localhost:5000 docker compose up --build`.

> **Importante:** abra pelo endereço que está no `CORS_ORIGINS` do backend (padrão `http://localhost:8080`).
> `http://127.0.0.1:8080` é outra origem e será bloqueado pelo CORS. Se usar outra porta/endereço, ajuste `CORS_ORIGINS` no `.env` do backend e reinicie a API.

## Passo 3 — Entrar
1. Abra http://localhost:8080 → tela de login.
2. Entre com o **Admin** definido no backend (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
3. Em **Usuários**, crie um **Gestor** e um **Colaborador**. O Colaborador só vê e altera as próprias tarefas; saia e entre com ele para conferir.

| Perfil | Vê no menu |
|---|---|
| Admin | Painel, Tarefas, Colaboradores, Equipes, Usuários |
| Gestor | Painel, Tarefas, Colaboradores, Equipes |
| Colaborador | Minhas tarefas |

## Verificação
```bash
npm run check        # sintaxe dos .js; impede style=/on*= inline (a CSP do nginx os bloqueia); exige lang="pt-BR"
```

## Problemas comuns
| Sintoma | Causa / solução |
|---|---|
| Console: `blocked by CORS policy` | Origem do front não está em `CORS_ORIGINS` do backend (veja a nota acima) |
| `Failed to fetch` / `ERR_CONNECTION_REFUSED` | API fora do ar ou `apiUrl` errada em `config.js` / `API_URL` |
| Página em branco no Docker após trocar `API_URL` | Rebuild/recriar: `docker compose up --build --force-recreate` |
| Volta ao login sozinho | Sessão expirada (a sessão fica em `sessionStorage`: fechar a aba também desloga) |
| Estilo/scripts não carregam no Docker | A CSP só permite arquivos do próprio site e a `API_URL`; não adicione scripts/estilos de terceiros ou inline |
| 429 ao logar várias vezes | Limite de 10 tentativas/min no login. Aguarde 1 minuto |

Acessibilidade: [docs/ACESSIBILIDADE.md](docs/ACESSIBILIDADE.md).
