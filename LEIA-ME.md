# Meu site acadêmico (modelo com animações)

Site pessoal de pesquisador(a), com o mesmo visual e as mesmas animações do modelo original:
fundo animado com "varredura de satélite", partículas que reagem ao mouse, texto digitado,
contadores animados, cartões com efeito 3D, trilho lateral de escala, tema claro/escuro,
gráficos, blog com janela de leitura e galeria de fotos.

Tudo roda de graça no **GitHub Pages**. Não precisa saber programar: o conteúdo fica em
arquivos de texto (JSON e Markdown).

---

## 📁 O que tem na pasta

```
SEU-USUARIO.github.io/
├── index.html            ← estrutura da página (nome, textos fixos, links)
├── .nojekyll             ← faz o GitHub servir a pasta /data sem mexer (NÃO APAGUE)
├── LEIA-ME.md            ← este guia
├── publicar.ps1          ← publica as mudanças (Windows)
├── publicar.sh           ← publica as mudanças (Mac/Linux)
├── atualizar-cv.ps1      ← converte seu CV .docx → PDF (Windows + Word)
├── visualizar.bat / .sh  ← abre o site no seu computador
├── assets/
│   ├── profile.jpg       ← SUA FOTO (substitua)
│   ├── CV.pdf            ← SEU CV (substitua)
│   ├── css/style.css     ← todo o visual e as animações em CSS
│   ├── js/main.js        ← animações, gráficos e carregamento do conteúdo
│   ├── logos/            ← logos das instituições (trajetória)
│   ├── blog/             ← imagens do blog
│   ├── gallery/          ← fotos da galeria
│   └── mentees/          ← fotos das pessoas que você orienta
└── data/                 ← ✏️ SEU CONTEÚDO
    ├── journey.json      ← trajetória (formação e experiência)
    ├── projects.json     ← projetos
    ├── publications.json ← publicações
    ├── awards.json       ← prêmios
    ├── mentees.json      ← orientandos
    ├── gallery.json      ← galeria de fotos
    ├── insights.json     ← números dos gráficos
    └── blog/
        ├── posts.json    ← lista de posts
        └── *.md          ← um arquivo por post
```

---

## 🚀 PASSO A PASSO (primeira vez)

### Passo 1 — Criar conta no GitHub
Crie uma conta em https://github.com (se ainda não tiver). Anote seu **nome de usuário**
(ex.: `mariasilva`). Seu site vai ficar em `https://mariasilva.github.io`.

### Passo 2 — Instalar o Git e um editor
- **Git:** https://git-scm.com/downloads (instale com as opções padrão).
- **Editor:** recomendo o **VS Code** (https://code.visualstudio.com). Ele avisa quando um JSON tem erro.
- **Python** (só para ver o site no seu computador antes de publicar): https://www.python.org/downloads
  — no Windows marque **"Add Python to PATH"** na instalação.

Configure o Git uma vez (no terminal / PowerShell):
```bash
git config --global user.name "Ricardo Tomáz"
git config --global user.email "ricardogomesagro@gmail.com"
```

### Passo 3 — Renomear a pasta
Renomeie a pasta do site para **`SEU-USUARIO.github.io`** (ex.: `mariasilva.github.io`).

### Passo 4 — Personalizar (veja a seção "O que editar" abaixo)
No mínimo: Ricardo Tomáz, foto, links e textos do `index.html`, e o conteúdo da pasta `data/`.

**Dica:** no VS Code, use **Ctrl+Shift+H** (substituir em todos os arquivos) para trocar de uma vez:

| Procurar          | Trocar por                         |
|-------------------|------------------------------------|
| `Ricardo Tomáz`        | Ricardo Tomáz completo                  |
| `SEU-USUARIO`     | seu usuário do GitHub              |
| `https://www.linkedin.com/in/ricardo-gomes-tom%C3%A1z-0137ba189/`    | seu usuário do LinkedIn            |
| `https://scholar.google.com/citations?user=SFU4irkAAAAJ&hl=pt-BR`  | o código do seu Google Scholar (o que vem depois de `user=` no link do seu perfil) |
| `http://lattes.cnpq.br/5179241416233826`   | o número do seu Lattes             |
| `https://orcid.org/0000-0001-7708-4263` | seu ORCID                      |
| `ricardogomesagro@gmail.com` | seu e-mail                   |
| `SN`              | suas iniciais (logo no menu, em `index.html`) |

### Passo 5 — Ver o site no seu computador
O site carrega arquivos JSON, então **não funciona clicando duas vezes no `index.html`**.
- **Windows:** dê dois cliques em `visualizar.bat`.
- **Mac/Linux:** no terminal, dentro da pasta: `./visualizar.sh`

Abra **http://localhost:8000** no navegador. Para parar, feche a janela ou aperte Ctrl+C.

### Passo 6 — Criar o repositório no GitHub
1. Entre no GitHub → botão **"+"** (canto superior direito) → **New repository**.
2. **Repository name:** exatamente `SEU-USUARIO.github.io` (ex.: `mariasilva.github.io`).
3. Deixe **Public**. **Não** marque "Add a README".
4. Clique em **Create repository**.

### Passo 7 — Enviar os arquivos
Abra o terminal (Windows: clique com o botão direito dentro da pasta → "Abrir no Terminal")
e rode, trocando `SEU-USUARIO`:
```bash
git init
git add .
git commit -m "Primeira versão do site"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-USUARIO.github.io.git
git push -u origin main
```
Na primeira vez, o Git vai abrir uma janela pedindo login no GitHub.

> **Sem terminal?** No repositório recém-criado, clique em **"uploading an existing file"**
> e arraste **todo o conteúdo** da pasta (inclusive `assets` e `data`). O arquivo `.nojekyll`
> é oculto: se ele não for, crie no GitHub com **Add file → Create new file**, nome `.nojekyll`, vazio.

### Passo 8 — Ligar o GitHub Pages
1. No repositório: **Settings → Pages**.
2. Em **Build and deployment → Source**: **Deploy from a branch**.
3. **Branch:** `main`, pasta **`/ (root)`** → **Save**.
4. Espere 1–2 minutos. Seu site estará em **https://SEU-USUARIO.github.io** 🎉

---

## 🔁 Atualizações do dia a dia

Depois de editar qualquer coisa:

- **Windows (PowerShell):** `./publicar.ps1 "adicionei um artigo"`
- **Mac/Linux:** `./publicar.sh "adicionei um artigo"`

O script confere se os JSON estão sem erro e só então envia. O site atualiza em ~1 minuto.

> Se o PowerShell disser que "a execução de scripts foi desabilitada", rode uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**Atualizar o CV** (Windows com Word instalado):
```powershell
./atualizar-cv.ps1 "C:\caminho\Meu_CV.docx"            # só converte
./atualizar-cv.ps1 "C:\caminho\Meu_CV.docx" -Publicar  # converte e publica
```
Ou simplesmente salve seu CV em PDF com o nome `assets/CV.pdf`.

---

## ✏️ O que editar

### 1. `index.html` (textos fixos)
Procure os comentários com ✏️. Lá estão: título da aba, nome, iniciais, frase de apresentação,
instituição/cargo, links das redes, as 4 "pílulas" flutuantes ao redor da foto,
os números da faixa de contadores (`data-count="…"`), a biografia, o quadro "Em resumo"
e os cartões de contato.

Não usa alguma rede (ORCID, Lattes…)? Apague a linha `<a …>` correspondente.

### 2. `assets/js/main.js` — só o bloco do topo
```js
const SITE = {
  authorNames: ['Sobrenome, N.', 'N. Sobrenome', 'Ricardo Tomáz'],
  typedPhrases: ['ciência de qualidade', 'novas descobertas', ...],
  locale: 'pt-BR'
};
```
- `authorNames`: como Ricardo Tomáz aparece nos artigos. Ele fica em **negrito** e
  artigos em que você é 1º autor aparecem primeiro dentro de cada ano.
- `typedPhrases`: as frases do efeito máquina de escrever ("Transformando dados em …").
- `locale`: `'pt-BR'` ou `'en-US'` para o formato das datas.

### 3. Foto
Substitua `assets/profile.jpg` por uma foto sua **com o mesmo nome** (de preferência quadrada).

### 4. Conteúdo em `data/`

**Trajetória** — `data/journey.json`
```json
{ "date": "2024 - Atual", "type": "research", "title": "Doutorado em …",
  "org": "Universidade · Cidade", "logo": "assets/logos/minha-univ.png",
  "description": "O que você fez." }
```
`type` pode ser `research`, `education` ou `work`. Sem logo? Use `"logo": ""`.

**Projetos** — `data/projects.json`
```json
{ "title": "Meu Projeto", "description": "O que faz.",
  "icon": "fa-solid fa-flask", "categories": ["Pesquisa"], "tags": ["Python"],
  "repo": "https://github.com/SEU-USUARIO/repo", "demo": "" }
```
As `categories` viram os botões de filtro. Ícones: busque em https://fontawesome.com/search
(versão gratuita) e copie a classe, ex.: `fa-solid fa-dna`.

**Publicações** — `data/publications.json`
```json
{ "title": "Título", "authors": "Sobrenome, N., Coautor, A.",
  "venue": "Revista, 12(3), 45-67", "year": 2025,
  "link": "https://…", "pdf": "", "doi": "10.xxxx/xxxxx", "scholar": "" }
```
Ordenadas automaticamente do ano mais recente para o mais antigo.
O gráfico "Produção por ano" é calculado sozinho a partir deste arquivo.

**Gráficos** — `data/insights.json`
`focus` = gráfico radar das áreas; `skills` = barras de ferramentas. Valores de 0 a 100.
Mantenha o mesmo número de itens em `labels` e `values`.

**Blog** (2 passos)
1. Crie `data/blog/2025-12-01-meu-post.md` e escreva em Markdown.
2. Adicione no `data/blog/posts.json`:
```json
{ "title": "Título do post", "date": "2025-12-01", "readTime": "4 min",
  "excerpt": "Resumo de uma linha.", "tags": ["Leituras"],
  "file": "2025-12-01-meu-post.md" }
```
O post mais recente aparece automaticamente no destaque "Último post do blog".
Cada post tem link próprio: `https://SEU-USUARIO.github.io/?post=2025-12-01-meu-post`.

**Prêmios** — `data/awards.json`: `title`, `org`, `year`, `icon`, `story`.

**Orientandos** — `data/mentees.json` + fotos em `assets/mentees/`.
Sem foto? Aparece um avatar com as iniciais automaticamente.

**Galeria** — `data/gallery.json` + fotos em `assets/gallery/`.
As imagens `foto1/2/3.jpg` são só exemplos: troque ou apague (e tire do JSON).

Não quer uma seção (ex.: Orientações)? Apague o bloco `<section id="mentorship">…</section>`
no `index.html` **e** o item correspondente no menu (`<li><a href="#mentorship">…`).

---

## ⚠️ Erros comuns em JSON
- Toda vírgula entre itens: `{ … },` **exceto** no último item da lista.
- Sempre aspas duplas: `"title"`, nunca `'title'`.
- Ano é número sem aspas: `"year": 2025`.
- Se uma seção mostra "Não foi possível carregar…", o JSON dela tem erro.
  Cole o conteúdo em https://jsonlint.com para ver onde.

## 🎨 Mudar as cores
No começo de `assets/css/style.css` ficam as variáveis `--brand`, `--brand-2`, `--veg` etc.
(uma lista para o tema escuro e outra para o claro). Trocando esses códigos de cor,
o site inteiro — inclusive as animações e os gráficos — muda junto.

## 🌐 Domínio próprio (opcional)
Em **Settings → Pages → Custom domain**, coloque seu domínio (ex.: `mariasilva.com.br`)
e siga as instruções de DNS do GitHub.
