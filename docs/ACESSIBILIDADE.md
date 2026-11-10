# Acessibilidade e inclusão — recursos implementados

## Web (este repositório)
- HTML semântico (`header`, `nav`, `main`, `section`, `article`, `table` com `caption`/`th scope`), `lang="pt-BR"`, link "Ir para o conteúdo".
- Todos os campos com `<label for>`; erros em regiões `role="alert"`; feedback em `aria-live="polite"`; anúncios para leitores de tela em região dedicada.
- Foco visível (contorno de 3 px), navegação completa por teclado, modais com `role="dialog"`/`aria-modal`, **foco aprisionado**, `Esc` fecha e o foco retorna ao elemento de origem. Confirmações usam `role="alertdialog"` (não `window.confirm`).
- Contraste mínimo **WCAG AA** nos temas claro e escuro; **alto contraste** (alternador com `aria-pressed`) e **tamanho da letra** (A−/A+, 4 níveis), lembrados **por usuário** (localStorage `pim.prefs.<id>`).
- Status nunca só por cor: ícone + texto (○ Pendente, ◐ Em andamento, ✔ Concluída, ! Atrasada).
- Respeita `prefers-color-scheme` e `prefers-reduced-motion`. Alvos interativos ≥ 44 px. Botões com `aria-label` contextual ("Editar tarefa X").
- Linguagem inclusiva: "pessoa responsável", "Olá, <nome>", sem termos de gênero.
- CSP restritiva compatível (sem scripts/estilos inline).


> Os recursos do app mobile estão documentados no repositório `pim-mobile`.

## Pendente de validação manual
Teste com leitores de tela reais (NVDA/VoiceOver) e auditoria (axe/Lighthouse) — não executados.
