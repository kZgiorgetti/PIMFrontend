# PIM IV — Frontend web (HTML/CSS/JS)

Aplicação web do sistema de colaboradores e tarefas (UNIP / ADS — PIM IV). Consome a API REST do repositório **PIMBackend** (`/api/v1`). É feita com HTML, CSS e JavaScript puro, sem framework e sem etapa de build.

## Pré-requisitos

- Node.js 18+ e npm.
- API do PIMBackend rodando e acessível. Consulte o README do backend.

## Configuração da API

A URL base é configurada em `config.js`:

```js
window.PIM_CONFIG = { apiUrl: "http://localhost:5000" };
```

Use o endereço correspondente ao ambiente (desenvolvimento local, testes ou produção), sem barra no final. Esse é o mecanismo de configuração consumido pela aplicação. Ela não lê `EXPO_PUBLIC_API_URL` nem outra variável de ambiente diretamente; em hospedagem estática, ajuste `config.js` no artefato publicado.

O endereço de origem do frontend também precisa estar permitido em `CORS_ORIGINS` no backend. `localhost` e `127.0.0.1` são origens distintas.

## Instalação e execução local

```bash
npm install
npm start
```

O frontend fica disponível em `http://localhost:8080`. O script `start` executa `http-server` por meio de `npx`; ele não é uma dependência declarada do projeto. Também é possível servir os arquivos com outro servidor estático.

## Produção

O projeto consiste em arquivos estáticos. Não existe comando de build nem de pré-visualização configurado. Para publicar, atualize `config.js` com a URL da API de produção e publique a raiz do projeto, incluindo `index.html`, `config.js`, `styles.css`, `pages/` e `js/`.

Configure a hospedagem para servir os arquivos existentes. As páginas são arquivos em `/pages/*.html`, não rotas de uma SPA; não é necessário fallback geral para `index.html` (mantenha-o apenas se a hospedagem exigir fallback para caminhos desconhecidos).

### Cabeçalhos de segurança

O Nginx usado anteriormente definia esses cabeçalhos. Configure-os na hospedagem ou CDN estática. Ajuste `connect-src` para a origem HTTPS da API do ambiente:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.exemplo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Configure `Cache-Control: no-store` para `/config.js`, pois seu conteúdo varia por ambiente. Para os demais arquivos, aplique uma política de cache adequada à estratégia de publicação. Um servidor estático local simples não define esses cabeçalhos.

## Verificação

```bash
npm run check
```

Verifica sintaxe JavaScript, atributos inline de estilo/eventos e `lang="pt-BR"` nos HTML.

## Entrar

1. Abra `http://localhost:8080`.
2. Entre com o Admin definido no backend (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
3. Em Usuários, crie um Gestor e um Colaborador para conferir os respectivos perfis.

| Perfil | Vê no menu |
|---|---|
| Admin | Painel, Tarefas, Colaboradores, Equipes, Usuários |
| Gestor | Painel, Tarefas, Colaboradores, Equipes |
| Colaborador | Minhas tarefas |

## Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Console: `blocked by CORS policy` | A origem do frontend não está em `CORS_ORIGINS` no backend. |
| `Failed to fetch` / `ERR_CONNECTION_REFUSED` | API indisponível ou `apiUrl` incorreta em `config.js`. |
| Volta ao login sozinho | Sessão expirada; a sessão fica em `sessionStorage` e fechar a aba também desloga. |
| Estilo/scripts não carregam | Confira os caminhos publicados e os cabeçalhos CSP na hospedagem. |
| 429 ao logar várias vezes | Limite de tentativas de login do backend; aguarde antes de tentar novamente. |

Acessibilidade: [docs/ACESSIBILIDADE.md](docs/ACESSIBILIDADE.md).
