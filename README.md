# PIM IV — Frontend Web

Aplicação web do PIM IV para gerenciamento de tarefas, colaboradores, equipes e usuários. Este repositório contém um cliente independente que consome a API REST do [PIMBackend](https://github.com/kZgiorgetti/PIMBackend).

O frontend é feito com HTML, CSS e JavaScript puro. Não usa framework nem possui etapa de build: os arquivos estáticos são servidos diretamente pelo servidor local ou pela hospedagem.

## 1. Apresentação do projeto

O PIMFrontend oferece uma interface web para os perfis Admin, Gestor e Colaborador. Ele não contém o servidor da API nem o banco de dados; os dados e as regras de negócio são fornecidos pelo Backend.

## 2. Objetivo e funcionalidades

- Autenticação e navegação conforme o perfil do usuário.
- Painel com resumo de tarefas e atrasos para Admin e Gestor.
- Consulta e gerenciamento de tarefas, incluindo status, responsável, comentários e histórico.
- Gerenciamento de colaboradores e equipes.
- Gerenciamento de usuários para Admin.
- Preferências de acessibilidade, como contraste, tamanho de fonte e suporte a navegação por teclado.

Para usar as telas que consultam ou alteram dados, a API precisa estar em execução e acessível pelo navegador.

## 3. Tecnologias utilizadas

- HTML para as páginas.
- CSS para layout, identidade visual e estilos responsivos.
- JavaScript puro para navegação, interface e comunicação HTTP.
- Node.js e npm para executar os comandos auxiliares definidos em `package.json`.
- `http-server`, chamado por `npx` no comando de desenvolvimento. Não é uma dependência declarada do projeto.

Não há framework, transpilação, bundler ou etapa de build.

## 4. Estrutura de pastas

```text
.
├── config.js              # Endereço da API usado pelo navegador
├── index.html             # Entrada que encaminha para a página adequada
├── styles.css             # Estilos compartilhados
├── pages/                 # Páginas HTML independentes
├── js/
│   ├── core/               # Sessão, navegação, preferências e interface comum
│   ├── dtos/               # Conversão dos dados enviados à API
│   ├── pages/              # Lógica JavaScript de cada página
│   └── services/           # Cliente HTTP e serviços da API
├── icons/                  # Ícones SVG
├── docs/                   # Documentação complementar, incluindo acessibilidade
├── scripts/check.js        # Verificações estáticas do repositório
├── package.json            # Comandos npm do projeto
└── package-lock.json       # Lockfile npm, sem dependências da aplicação
```

As páginas são arquivos em `pages/`, e não rotas de uma SPA. A raiz `index.html` encaminha o usuário para a página inicial adequada à sessão.

## 5. Pré-requisitos

- Git para clonar o repositório.
- Node.js 18 ou superior e npm para usar `npm start` e `npm run check`.
- Acesso à internet na primeira execução de `npm start`, caso `npx` ainda não tenha o `http-server` disponível localmente ou em cache.
- PIMBackend em execução e acessível para autenticação e funcionalidades que usam dados da API.

Não é necessário instalar dependências do frontend com `npm install`: `package.json` não declara dependências. O comando `npm start` usa `npx --yes http-server` para obter e executar o servidor estático quando necessário.

## 6. Como clonar o repositório

```bash
git clone https://github.com/kZgiorgetti/PIMFrontend.git
cd PIMFrontend
```

## 7. Como configurar o endereço da API

Edite `config.js` e defina `window.PIM_CONFIG.apiUrl` com a origem do Backend, sem incluir `/api/v1`:

```js
window.PIM_CONFIG = { apiUrl: "http://localhost:5000" };
```

O cliente HTTP acrescenta `/api/v1` à URL configurada; por exemplo, a chamada final fica semelhante a `http://localhost:5000/api/v1/auth/login`. O código também remove uma barra final, se houver.

Use a origem correspondente ao ambiente. Em produção, publique `config.js` com o endereço HTTPS da API. O frontend lê essa configuração no navegador; não lê variáveis de ambiente como `EXPO_PUBLIC_API_URL`.

## 8. Como executar localmente

Na raiz do repositório:

```bash
npm start
```

O script executa `npx --yes http-server . -p 8080 -c-1`. O site fica em `http://localhost:8080`; `-c-1` desativa o cache do servidor durante o desenvolvimento. O frontend pode ser servido por outro servidor estático, desde que preserve os caminhos a partir da raiz do projeto.

## 9. Como verificar o funcionamento

Execute a verificação estática:

```bash
npm run check
```

O comando chama `node scripts/check.js`. O script percorre o repositório, ignorando `.git`, `node_modules` e `docs`; verifica a sintaxe dos arquivos `.js` encontrados fora de `scripts/` com `node --check`; e, nos HTML, procura atributos `style` ou de eventos inline (`on...`) e exige `<html lang="pt-BR">`. Ele não testa o comportamento das telas, a disponibilidade da API, CORS nem o login.

Para uma verificação manual, abra `http://localhost:8080` e use o DevTools do navegador, especialmente as abas **Console** e **Network**. Erros de CORS aparecem no Console; falhas de conexão, respostas HTTP e URLs chamadas podem ser inspecionadas em Network. Uma resposta bem-sucedida do servidor estático só confirma que o frontend foi servido; operações de dados também dependem do Backend.

Com o Backend local padrão em execução, `http://localhost:5000/health` verifica a disponibilidade da API e do banco de dados. Para confirmar uma operação da interface, faça login com uma conta válida do Backend e acompanhe no Network as chamadas para `/api/v1`.

## 10. Como publicar em hospedagem estática

Publique os arquivos do projeto mantendo a estrutura de diretórios, incluindo `index.html`, `config.js`, `styles.css`, `pages/`, `js/` e `icons/`. Não há build para executar. Antes da publicação, configure `config.js` com a URL HTTPS da API de produção.

As páginas são arquivos existentes em `/pages/*.html`, portanto não precisam de fallback de SPA para `index.html`. Configure a hospedagem/CDN para servir esses arquivos e aplique políticas de cache compatíveis com a publicação. Como `config.js` muda por ambiente, configure `Cache-Control: no-store` para esse arquivo.

Se a hospedagem usar Content Security Policy, permita as chamadas à API em `connect-src`, por exemplo:

```text
connect-src 'self' https://api.exemplo.com;
```

Substitua `https://api.exemplo.com` pela origem real do Backend e mantenha as demais diretivas da política apropriadas à hospedagem.

## 11. Integração com o Backend

O PIMFrontend é um cliente independente da API REST do [PIMBackend](https://github.com/kZgiorgetti/PIMBackend). A API centraliza autenticação, regras de negócio e dados; o frontend envia requisições sob o prefixo `/api/v1`, incluindo autenticação, tarefas, colaboradores, equipes, usuários e relatórios.

Para requisições autenticadas, o cliente envia o token Bearer da sessão e tenta renovar a sessão quando recebe uma resposta 401 aplicável. A API deve estar em execução e aceitar a origem do frontend na configuração CORS do Backend. `http://localhost:8080` e `http://127.0.0.1:8080` são origens diferentes e precisam ser permitidas separadamente se ambas forem usadas.

Consulte o [README do PIMBackend](https://github.com/kZgiorgetti/PIMBackend) para instalar e configurar a API. O [PIMMobile](https://github.com/kZgiorgetti/PIMMobile) é outro cliente independente que também consome o Backend. As instruções daquele projeto são separadas; este repositório não requer Flutter.

## 12. Problemas comuns e soluções

| Sintoma                                                    | O que verificar                                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm start` não inicia ou `npx` não encontra `http-server` | Confirme Node.js/npm, acesso à internet na primeira execução e execute o comando na raiz do repositório.                                                                |
| `EADDRINUSE` na porta 8080                                 | Outro processo já usa a porta; encerre-o ou use outro servidor/porta para servir os arquivos.                                                                           |
| `Failed to fetch` ou `ERR_CONNECTION_REFUSED`              | Confirme se o Backend está em execução e se `config.js` aponta para a origem e porta corretas.                                                                          |
| `blocked by CORS policy`                                   | Permita a origem exata do frontend na configuração CORS do Backend; esquema, host e porta fazem parte da origem.                                                        |
| Login falha ou a página retorna ao login                   | Confira no DevTools a resposta da API, a sessão e os tokens. A sessão expirada precisa ser renovada ou iniciada novamente.                                              |
| A página abre, mas listas ou ações falham                  | O servidor estático pode estar funcionando enquanto a API está indisponível ou inacessível; inspecione Console e Network.                                               |
| JavaScript, CSS ou ícones não carregam após publicação     | Confira se a hospedagem publicou as pastas e arquivos preservando a estrutura e os caminhos do projeto.                                                                 |
| `npm run check` reporta erro de sintaxe                    | Confira o arquivo indicado diretamente com `node --check caminho/do/arquivo.js`; o script imprime um resumo de erro e não detalha a causa do processo filho que falhou. |
