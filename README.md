# Superboard

> Quadro interativo para aulas de idiomas — com IA integrada, caption mode em tempo real e game mode.

![Status](https://img.shields.io/badge/status-ativo-brightgreen)
![Versão](https://img.shields.io/badge/versão-3.0-c00000)
![Licença](https://img.shields.io/badge/licença-todos%20os%20direitos%20reservados-red)

---

## Sobre

O **Superboard** é uma ferramenta pessoal de trabalho desenvolvida para aulas de idiomas. Combina um quadro branco com edição de texto avançada, transcrição de fala em tempo real (caption mode), geração de conteúdo via IA e um jogo da forca que sorteia palavras escritas no próprio quadro.

Não é um produto comercial. É uma ferramenta de uso próprio, parte de um ecossistema educacional, e **todos os direitos são reservados**. Não pode ser redistribuída, modificada ou comercializada sem autorização expressa da autora.

---

## Funcionalidades

### Quadro branco
- Desenho livre com pincel ajustável (roda do mouse ou slider)
- Formatação **parcial** de texto: negrito, itálico, sublinhado, tachado, cor, tamanho e marca-texto aplicados **por caractere** (não no elemento inteiro)
- Paleta de cores com 16 tons + seletor customizado
- Post-its coloridos para destacar conteúdo
- Inserção de ícones (Font Awesome)
- Colar imagens direto do clipboard (`Ctrl+V`)
- Grade de fundo opcional para alinhamento
- **Undo/Redo** completo (`Ctrl+Z` / `Ctrl+Shift+Z`)
- **Modo apresentação** que esconde a UI (`Esc` para sair)
- Contador de palavras e caracteres em tempo real

### IA integrada
Quatro operações sobre o texto selecionado (ou sobre o elemento inteiro):
- **Traduzir**
- **Corrigir texto**
- **Exemplos reais** de uso
- **Diálogo de 4 turnos** com nível CEFR (A1-A2, B1-B2, C1-C2)

> A IA só funciona com uma chave de acesso válida (solicitada ao abrir o quadro).

### Caption mode
- Transcrição de fala em tempo real (Web Speech API)
- Ativação por voz: diga **"caption"** para começar
- Encerramento por voz: diga **"stop caption"**
- O texto transcrito vira um elemento editável no quadro

### Game mode
- Jogo da forca que **sorteia palavras do próprio quadro**
- Teclado virtual + desenho da forca em canvas
- Sem repetir palavras até esgotar o vocabulário disponível

---

## Como usar

### Requisitos

- Navegador moderno (Chrome, Edge ou Firefox — recomenda-se Chrome para o caption mode)
- **Desktop ou notebook** (a ferramenta não é otimizada para mobile)
- Microfone (para o caption mode)
- Chave de acesso ao backend de IA

### Acesso

1. Abra o `index.html` em um navegador
2. Cole a chave de acesso quando o modal aparecer
3. Comece a usar

---

## Atalhos

| Atalho | Ação |
|---|---|
| `Ctrl + S` | Baixar o quadro como PNG |
| `Ctrl + L` | Modo desenho |
| `Ctrl + Z` | Desfazer |
| `Ctrl + Shift + Z` | Refazer |
| `Delete` | Excluir elemento selecionado |
| `Esc` | Sair do modo apresentação |
| `Alt + C` | Ativar/desativar caption mode |
| `Ctrl + V` | Colar imagem do clipboard |

### Cliques

| Ação | Resultado |
|---|---|
| Duplo clique (área vazia) | Cria um novo texto |
| Duplo clique (texto) | Edita o texto |
| Clique simples | Seleciona / move o elemento |
| Roda do mouse (modo desenho) | Ajusta a espessura do pincel |
| Selecionar texto + botão de IA | Aplica IA só na seleção |

---

## Estrutura do projeto

superboard/
├── index.html # Estrutura HTML
├── favicon.png # Ícone
├── css/
│ └── style.css # Todos os estilos
└── js/
├── config.js # Constantes (URL do backend, links)
├── state.js # Estado global (canvas, history, flags)
├── canvas.js # Inicialização do Fabric, ferramentas, cor/espessura
├── history.js # Undo/Redo, ações do quadro
├── format.js # Formatação parcial de texto, marca-texto, contador
├── tools.js # Tooltips, ícones, colar imagem
├── ai.js # Autenticação + requisições à IA
├── caption.js # Caption mode (Web Speech API)
├── game.js # Jogo da forca
├── modals.js # Modais, toast, gaveta, tabs
├── shortcuts.js # Atalhos de teclado
└── main.js # Boot (roda por último)


### Ordem de carregamento

Os scripts são carregados na ordem acima, **sem `type="module"`**. Isso significa que **a ordem das tags `<script>` no `index.html` importa**. Na prática, só `main.js` precisa vir por último (é o único que executa algo no `load`), mas manter a ordem completa é boa prática.

---

## Tecnologias

| Biblioteca | Uso |
|---|---|
| [Fabric.js 5.3.1](https://fabricjs.com/) | Canvas interativo |
| [Font Awesome 6.5.1](https://fontawesome.com/) | Ícones |
| [Poppins](https://fonts.google.com/specimen/Poppins) | Tipografia |
| Web Speech API | Caption mode |
| Google Apps Script | Backend da IA (fora do repo) |

Sem build, sem bundler, sem `npm install`. É HTML + CSS + JS puro.

---

## Sobre a persistência

O Superboard **não salva automaticamente** o conteúdo do quadro. Ao fechar ou recarregar a página, o quadro é perdido.

**Para guardar o trabalho:**
- `Ctrl + S` baixa o quadro como PNG
- Ou simplesmente não feche a aba durante a aula

Se um dia a persistência for adicionada (via `localStorage`), este README será atualizado.

---

## Privacidade

- A **chave de acesso** é salva no `localStorage` do seu navegador, nunca no código
- O caption mode usa a **Web Speech API do navegador** — o áudio não é enviado para nenhum servidor do projeto
- As requisições de IA enviam apenas o **texto selecionado** para o backend configurado

---

## Licença

**Todos os direitos reservados.**

Copyright (c) 2026 Diandra C.

Esta ferramenta é parte integrante de um ecossistema educacional e é de uso pessoal e restrito. É expressamente proibida a cópia, modificação, distribuição, sublicenciamento, venda ou qualquer outra forma de uso comercial ou não autorizado, no todo ou em parte, sem a autorização prévia e por escrito da autora.

O código-fonte é disponibilizado publicamente apenas para fins de visualização e referência. Nenhuma licença de uso é concedida por meio desta publicação.

---

## Autoria

Desenvolvido por **Diandra C.** — [@dicarvalho.prof](https://instagram.com/dicarvalho.prof)

---

## Reportar problemas

Este é um projeto pessoal, sem suporte oficial. Se você é a autora e encontrou um bug, abra uma issue descrevendo:

1. O que você fez
2. O que esperava que acontecesse
3. O que aconteceu de fato
4. O erro do console (F12 → Console)

---

## Roadmap (ideias futuras)

- Persistência em `localStorage` com auto-save
- Exportar quadro como SVG
- Tema escuro para uso noturno
- Modo colaborativo (múltiplos cursores)
- Histórico de palavras usadas no game mode

> Nada disso é promessa — só um registro de ideias.
