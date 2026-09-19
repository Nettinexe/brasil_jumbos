# Brasil Jumbos — site institucional

Site institucional (não comercial) do Brasil Jumbos, criado por João Teixeira.
HTML, CSS e JavaScript puros — sem framework, sem build step.

## Como executar localmente

Não há processo de build. Basta servir a pasta com qualquer servidor estático
(abrir `index.html` direto no navegador também funciona, exceto para o feed
automático do Instagram, que depende de uma função serverless).

```bash
# qualquer um destes funciona
python -m http.server 8080
npx serve .
```

Depois acesse `http://localhost:8080`.

## Estrutura

```
joao_brasiljumbos/
  index.html
  styles.css
  script.js
  assets/
    images/
      lateral.webp       fotografia da Hero — desktop (≥1024px), João à direita
      frente.webp        fotografia da Hero — mobile/tablet (≤1023px), frontal
      icone.svg          logotipo oficial (header + footer)
      lateral-og.jpg     imagem de preview social (og:image / twitter:image)
      favicon-*.png      favicons gerados a partir do peixe do logotipo
    process_images.py    utilitário: derivados responsivos (não usado hoje)
    remove_bg.py         utilitário: recorte com alpha via rembg (não usado hoje)
  data/
    featured-posts.js   posts/reels selecionados manualmente ("Destaques")
                         — também usado como fallback estático de último nível
                         para o feed automático (seção 22 do briefing)
    social-config.js    números de seguidores por rede (null = não exibe)
  netlify/
    functions/
      instagram-feed.js função serverless que busca o feed do Instagram
```

## Direção visual: uma única fotografia

**A partir da Hero, a tipografia é a imagem.** O site carrega exatamente
**3 imagens**:

1. o retrato de João na Hero (a única fotografia de conteúdo);
2. o logo no header;
3. o logo no footer.

Todas as outras fotografias foram **removidas do HTML** (não escondidas com
CSS) junto com seus wrappers, colunas, `aspect-ratio` e máscaras — cada seção
foi redesenhada para funcionar sem elas, usando tipografia grande, números,
palavras-fantasma em outline, linhas e grid. Os ícones de redes sociais são
SVG inline (sprite no topo do `index.html`), nunca imagens raster.

Para conferir: `document.images.length` deve ser `3` em qualquer viewport.

### As duas versões da fotografia da Hero

São duas variantes **da mesma função** (Hero), trocadas só por HTML
responsivo — sem JavaScript:

| Arquivo         | Quando            | Enquadramento                              |
|-----------------|-------------------|--------------------------------------------|
| `lateral.webp`  | `≥1024px`         | João em 3/4 à direita; área escura à esquerda recebe a headline |
| `frente.webp`   | `≤1023px`         | frontal e centralizado, tolera telas estreitas |

O corte é feito por `<source media="(max-width: 1023px)">` **e** por dois
`<link rel="preload">` com o mesmo `media`, para que cada viewport baixe
**apenas uma** das duas. O breakpoint coincide de propósito com o ponto em
que o layout da Hero muda de pilha para as duas zonas do desktop.

A fotografia é uma **camada que preenche** a área dela (`object-fit: cover`,
usado só aqui), não uma foto dentro de uma caixa: no desktop é uma camada
absoluta que encosta no topo, na base e na direita; no mobile é a faixa
inferior da Hero. A borda esquerda é dissolvida por `mask-image` e o
`.hero__veil` faz a fusão com o preto da página — é isso que evita a emenda
vertical entre o fundo da foto e o fundo do site.

### Logotipo

`assets/images/icone.svg` é o arquivo oficial, usado no header e no footer
(mesmo asset, sem versões paralelas). Ele **já tem transparência real** —
não há `<rect>` branco: a transparência vem de uma máscara de luminância
interna, então nada precisou ser editado no arquivo. A marca é vermelha e
aparece direto sobre o preto, sem caixa ou moldura.

**Atenção ao peso:** apesar da extensão `.svg`, o arquivo é um PNG de
2730×1536 embutido em base64 dentro de um wrapper SVG (aparece duas vezes:
uma como máscara, outra como imagem) — por isso tem ~1,3MB. Ele é usado no
header, ou seja, acima da dobra. Se em algum momento for possível obter um
SVG realmente vetorial da marca, ele reduz esse custo em ~99%.

### Feed do Instagram sem thumbnails

A integração com a API **não mudou** (`netlify/functions/instagram-feed.js`,
cache, fallback em cascata e variáveis de ambiente seguem iguais). O que
mudou foi só a apresentação: cada publicação vira um link editorial
numerado (`01 · título · Abrir no Instagram ↗`) em vez de um card com
thumbnail. Se não houver dados, a seção continua oculta — nunca é renderizado
um placeholder/skeleton de imagem.

## Como substituir a fotografia da Hero

Coloque os novos arquivos em `assets/images/` e atualize, no `index.html`,
os três pontos que apontam para eles:

1. os dois `<link rel="preload">` no `<head>` (com os respectivos `media`);
2. o `<source media="(max-width: 1023px)">` do `<picture class="hero__media">`;
3. o `src` + `width`/`height` do `<img>` (dimensões intrínsecas reais, para CLS).

Mantenha `fetchpriority="high"` e **sem** `loading="lazy"`: essa imagem é o
LCP da página. Se o enquadramento novo pedir, ajuste apenas
`object-position` em `.hero__media img` (desktop usa `56% center`) — nunca
`width`/`height`, que quebrariam o preenchimento.

Também vale regenerar `lateral-og.jpg` (preview social, 1200×675 opaco) e os
`favicon-*.png` a partir do peixe do logotipo.

## Como atualizar os números sociais

Edite `data/social-config.js`. Enquanto um valor estiver `null`, o número
correspondente não aparece no site — nenhuma métrica é inventada.

```js
window.BRASIL_JUMBOS_SOCIAL_COUNTS = {
  instagram: 850000,
  youtube: null,
  facebook: null,
  tiktok: null,
};
```

## ÚLTIMOS VÍDEOS — o deck de três cartas

A seção de vídeos é um **deck de três cartas**: a central em pé, as laterais
abertas em leque. Ela substituiu a apresentação antiga ("Destaques" e
"Últimas publicações"), que era uma lista de links numerados.

### Como configurar

Tudo vive em `data/latest-videos.js`. A lista tem **sempre três itens**, em
ordem de importância:

| posição na lista | carta | papel |
|---|---|---|
| `[0]` | centro | vídeo principal / mais recente |
| `[1]` | esquerda | segundo vídeo |
| `[2]` | direita | terceiro vídeo |

```js
window.BRASIL_JUMBOS_LATEST_VIDEOS = [
  { thumbnail: "assets/videos/video-01.webp", url: "", title: "",
    width: 1080, height: 1920 },   // CENTRO
  // ...
];
```

Para trocar a ordem visual, basta reordenar os objetos. O HTML, porém, é
montado **esquerda → centro → direita**, para que a navegação por Tab siga a
ordem da tela e não a de prioridade.

As thumbnails vão em `assets/videos/` (veja o `LEIA-ME.txt` de lá).

### Estados enquanto falta configuração

O deck foi feito para nunca quebrar durante a montagem:

- **`url` vazia** → a carta é renderizada como `<div>`, não como link. Não é
  gerado `href="#"` nem link morto que o teclado alcança e que não leva a
  lugar nenhum. Assim que a URL real entra, ela vira `<a>` sozinha.
- **thumbnail ausente ou com 404** → a carta cai num estado sem imagem
  mantendo a proporção declarada em `width`/`height`, em vez de exibir ícone
  de imagem quebrada. O leque continua de pé.
- **`title` vazio** → nenhum texto é exibido. Não existe placeholder textual.

### Sem player, só thumbnail

Nada de `<iframe>`, `<video>` ou embed de plataforma: o clique abre o vídeo
na origem (`target="_blank"` + `rel="noopener noreferrer"`). As imagens usam
`loading="lazy"`, `decoding="async"` e `width`/`height` reais — a seção está
abaixo da dobra e **não** deve ser pré-carregada; só a Hero tem prioridade.

A altura fica em `auto`: a carta se adapta à proporção **real** do arquivo,
sem recorte e sem distorção, seja 9:16 ou qualquer outra.

### Duas armadilhas que o código evita de propósito

**1. O reveal fica no deck, nunca nas cartas.** O sistema de reveal termina
em `transform: none`. Se `[data-reveal]` estivesse nas cartas, ele apagaria a
rotação do leque no fim da animação e o hover deixaria de funcionar. Por isso
`data-reveal-block` está no `.video-deck`: o conjunto entra, as cartas
mantêm seus próprios transforms.

**2. O deck não pode ter `overflow` escondido.** As cartas giradas — e a que
sobe no hover — seriam cortadas nos cantos. O respiro vem do `padding` do
deck. O `overflow:hidden` existe só **dentro** da carta, para prender a
thumbnail ao raio da borda.

### Interação

Toda a interação é CSS; o JS apenas monta o DOM (nenhum
`mouseenter`/`mouseleave`).

- **Laterais** (hover ou `:focus-visible`): endireitam, sobem, crescem um fio
  e vão para a frente (`z-index: 10`).
- **Central**: **não se move**, nem no hover nem no foco — é a âncora da
  composição. Recebe só o anel de foco.
- Os efeitos de hover moram em `@media (hover: hover) and (pointer: fine)`
  para não travarem em touch; os de foco ficam fora dessa query, para valerem
  no teclado de qualquer aparelho.
- Só `transform`, `opacity`, `box-shadow` e `border-color` são animados.
- Em `prefers-reduced-motion`, **nada se desloca**: endireitar a carta já
  seria movimento. O destaque passa a vir só de borda, sombra e empilhamento.

Abaixo de 1024px o leque vira **carrossel com scroll-snap** (cartas retas,
84vw até 340px, a seguinte espiando na borda). 1024px é o mesmo ponto em que
o resto do site troca para desktop — nenhum breakpoint novo foi criado.

## Como adicionar posts em destaque

> **Nota:** esta seção está **dormente**. O lugar dela na página passou a ser
> ocupado por ÚLTIMOS VÍDEOS. A configuração, o `script.js` e a função
> serverless continuam no projeto para que o feed possa ser reativado sem
> reconstruir a integração — basta devolver o markup da seção ao HTML.

Edite `data/featured-posts.js` e adicione objetos ao array
`BRASIL_JUMBOS_FEATURED_POSTS`.

```js
window.BRASIL_JUMBOS_FEATURED_POSTS = [
  {
    url: "https://www.instagram.com/p/XXXXXXXXX/",
    thumbnail: "assets/processed/joao-peixe-jumbo-768.webp",
    type: "reel", // "reel" | "post" | "video"
    title: "Pirarara jumbo de 1,10m",
  },
];
```

## Como ativar a integração com o Instagram

O feed automático (seção hoje dormente — ver nota acima) chama
`/.netlify/functions/instagram-feed`, que nunca expõe o token no navegador.

1. Gere um token de longa duração para uma conta profissional (Business/
   Creator) através do fluxo atual do Instagram Graph API / Meta for
   Developers. **Não** use a Basic Display API — ela foi descontinuada.
2. No painel da Netlify: **Site settings → Environment variables**, adicione:
   - `INSTAGRAM_ACCESS_TOKEN`
   - `INSTAGRAM_USER_ID`
3. Redeploy o site.

Sem essas variáveis configuradas, a função responde `data: []` e o
front-end usa automaticamente os posts estáticos de
`data/featured-posts.js` como último fallback — o site nunca quebra nem
mostra conteúdo inventado.

## Como ativar os depoimentos

A seção `#depoimentos` existe no HTML mas fica `hidden` por padrão — nenhum
depoimento foi fornecido para publicação. Para ativar: preencha
`data-testimonials-list` em `index.html` (ou adapte para carregar de um
array em JS, seguindo o mesmo padrão de `featured-posts.js`) com depoimentos
reais e remova o atributo `hidden` da `<section id="depoimentos">`.

## Deploy (Netlify)

1. Conecte o repositório (ou arraste a pasta em app.netlify.com/drop para um
   teste rápido).
2. Build command: nenhum. Publish directory: `joao_brasiljumbos` (ou a raiz,
   dependendo de como o repositório for organizado).
3. Configure as variáveis de ambiente do Instagram (seção acima).
4. Aponte o domínio `www.brasiljumbos.com.br` nas configurações de domínio
   da Netlify.

## Engenharia de layout: por que não há mais sticky/scrollytelling

Uma segunda rodada de direção de arte havia introduzido dois mecanismos de
scrollytelling: um "palco" `position:sticky` com crossfade para os 3 blocos
de "Três Respostas" (~300vh de percurso) e uma trilha horizontal sticky
para a timeline (a altura do wrapper era calculada em JS a partir da
largura da trilha, chegando a ~4x a altura da viewport). Uma terceira
rodada, focada em estabilidade estrutural, **removeu os dois por completo**
— o ganho visual não compensava a fragilidade: alturas artificiais gigantes,
o "buraco" preto depois de "HOJE" (o próprio spacer de ~4 telas de altura),
e um bug real de `position:sticky` (veja abaixo) que passou despercebido em
duas rodadas de revisão visual.

Hoje:

- **Três Respostas** (`.pillar`) são três blocos editoriais empilhados,
  `display:grid` por bloco (`número | conteúdo | mídia` a partir de
  1024px), altura 100% definida pelo conteúdo via `padding-block: clamp(...)`.
  Sem JS nenhum controlando a geometria.
- **Timeline** (`.timeline-list`) é uma lista vertical real — cada
  `.timeline-item` é uma row do documento, também `display:grid`
  (`ano | conteúdo`, e `ano | conteúdo | foto` para 2020/HOJE). Os anos
  gigantes (`.timeline-item__year`, contorno/outline) ocupam espaço real no
  grid; só a palavra-fantasma "BRASIL" atrás do título de 2016 é
  decorativa (`position:absolute`, contida com `overflow:clip` no próprio
  item, nunca pode vazar para fora dele).
- `script.js` não tem mais `initStage`/`initTimeline` — a geometria dessas
  duas seções é 100% CSS, então funciona igual com JavaScript desativado e
  sobrevive a qualquer resize sem recálculo.

**A armadilha de CSS que causou tudo isso, para não reintroduzir:**
`overflow-x: hidden` no `<html>` ou no `<body>` quebra `position: sticky`
em **toda** a página, silenciosamente — o navegador aplica
`overflow-y: auto` por baixo dos panos (regra da spec para eixos "hidden" +
"visible" combinados), o que faz o `body` virar seu próprio scroll
container e desalinha a lógica de sticky do scroll real da janela. Os
elementos continuam com `getComputedStyle().position === "sticky"` (parece
certo!), mas deslizam junto com o resto da página — e o efeito quebrado
ainda pode parecer certo em capturas de tela isoladas, porque o conteúdo
continua passando pela viewport, só que sem "prender". `html`/`body` usam
`overflow-x: clip` (não `hidden`) por causa disso, e ainda é necessário
hoje: o sangramento decorativo das fotos (Hero, peixe do painel 03) depende
dele. Se `position:sticky` for reintroduzido no futuro, valide sempre com
`elemento.getBoundingClientRect().top` no meio do scroll — nunca só
visualmente.

## Grid de 12 colunas e escala de espaçamento

As seções principais usam `.grid-12` (12 colunas, `column-gap` fluido) a
partir de 1024px; abaixo disso vira uma coluna só. As faixas de colunas
ficam declaradas no CSS de cada seção, não em classes utilitárias soltas:

| Seção            | Colunas                                      |
|------------------|----------------------------------------------|
| Três Respostas   | número 1–2 · headline 3–6 · copy 7–12        |
| Timeline         | ano 1–4 · conteúdo 5–12                      |
| Um novo olhar    | headline 1–8 · copy 9–12                     |
| O que você encontra | headline 1–5 · lista 7–12                 |
| Redes sociais    | Instagram span 6 · demais span 2 cada        |

Espaçamento vem só de tokens (`--space-xs/sm/md/lg/xl`, `--section-space`,
`--chapter-gap`) — nada de `margin-top: 300px` avulso. `--chapter-gap`
(96–160px) é o respiro entre capítulos; só a Hero usa `min-height:100svh`.

A headline da Hero usa `clamp(2.2rem, min(7.5vw, 6.8vh), 3.6rem)`: o termo
em `vh` faz as 5 linhas + copy + CTA caberem inteiras em telas baixas
(1280×720, 1366×768) sem nenhum valor fixo chutado por resolução.

## Métrica real da Anton e a entrelinha dos títulos

A fonte display é **Anton**. Os acentos dela são desenhados bem acima da
caixa alta, e era daí que vinha o problema de títulos "colados". Medindo a
fonte no navegador (canvas, `actualBoundingBox`), em unidades `em`:

| referência | altura acima da baseline |
|---|---|
| caixa alta sem acento (`H`, `O`) | **0.875** |
| acento agudo/circunflexo (`É` `Ê` `Á` `Í`) | **1.109** |
| til (`Ã` `Õ`) | **1.078** |
| cauda do `Q` / cedilha do `Ç` | até **0.313** *abaixo* |

O acento ocupa sozinho a faixa **0.875 → 1.109 = 0.234em**. Com
`line-height` entre `.8` e `.96` essa faixa simplesmente não existia, e o
acento da linha de baixo era desenhado dentro do corpo da linha de cima.

Isso explica por que só **alguns** títulos pareciam quebrados: os
acentuados (`TRÊS`, `JOÃO?`, `AQUÁRIO`, `MILHÕES`, `É MAIOR`) colidiam, e
os sem acento (`UM NOVO OLHAR`, `ACONTECE`) nunca deram problema.

### Como os valores foram escolhidos

Não foram estimados. Para cada par de linhas de cada título real da página
foi calculado, **coluna de pixel por coluna de pixel**, o menor
`line-height` em que nenhuma tinta da linha de baixo invade a de cima:

| título | mínimo medido |
|---|---|
| `O PRIMEIRO / AQUÁRIO JUMBO.` | 1.097em ← maior exigência da página |
| `O MUNDO DOS PEIXES / É MAIOR…` (rodapé) | 1.093em |
| `QUEM É / JOÃO?` | 1.070em |
| `MILHÕES DE / VISUALIZAÇÕES.` | 1.070em |
| `O MUNDO DOS / PEIXES É` (Hero) | 1.060em |
| `O QUE VOCÊ / ENCONTRA NO` | 0.957em |
| `UM NOVO / OLHAR` | 0.877em |
| `BRASIL / JUMBOS.` | 0.703em |

Daí saem os três tokens em `:root`:

```css
--lh-display-xl:  1.08;  /* títulos grandes  — exigência máxima 1.070 */
--lh-display-md:  1.14;  /* títulos médios   — exigência máxima 1.097 */
--lh-display-flat: .92;  /* SÓ onde nenhuma linha leva acento */
```

`--lh-display-flat` é usado em exatamente dois lugares, e os dois são
seguros **por construção**, não por sorte: `BRASIL / JUMBOS.` (nome da
marca, sem um acento sequer) e os numerais de impacto (`+2`, `+300`).

> Se algum dia entrar um título novo com acento, ele deve usar
> `--lh-display-xl` ou `--lh-display-md` — nunca `--lh-display-flat`.

### Os wrappers `.hero__line` / `.new-look__line`

Os dois tinham `overflow:hidden`, resquício de um reveal em máscara que não
existe mais: hoje o `data-reveal` está **no próprio wrapper** (opacidade +
`translateY`), e o `<span>` interno não anima. O clip não servia a nenhuma
animação e cortava o topo do `É` da Hero. Foi removido — não compensado com
`padding`/`margin` negativo, simplesmente removido, porque não havia o que
preservar.

### Por que não há `text-wrap: balance`

Todos os títulos display quebram por `<br>` explícito no HTML (ou são de
uma linha só). `balance` seria CSS morto e, se algum dia as quebras saírem
do HTML, ele passaria a disputar com quebras que são decisão de design.

## Altura da Hero: `--hero-chrome`

A headline da Hero no desktop não usa um coeficiente `vh`. Um `vh` puro não
atende 720px e 768px ao mesmo tempo: o custo fixo da Hero (header, paddings,
eyebrow, parágrafo, assinatura, CTA e indicador de scroll) é o **mesmo** nos
dois, mas pesa muito mais numa tela de 720 — calibrar para caber em 720
desperdiça altura em 768, e vice-versa.

```css
--hero-chrome: 366px;   /* tudo que na Hero NÃO é a headline */

.hero__headline{
  font-size: clamp(2.2rem,
                   min(5.2vw, calc((100svh - var(--hero-chrome)) * .167)),
                   4.8rem);
}
```

O termo de altura mede a sobra real para a headline; `.167` divide essa
sobra pelas 5 linhas já multiplicadas pela entrelinha (5 × 1.08 = 5.4 ⇒
1/5.4 = .185) e guarda ~10% de folga. O teto de `5.2vw` é o que segura a
linha mais longa em ~40% da largura da Hero — é ele que impede o texto de
avançar sobre o João.

Resultado medido (fonte da headline, e se a Hero cabe em 100svh):

| viewport | antes | depois | ganho | Hero cabe |
|---|---|---|---|---|
| 1280×720  | 48.96px | 59.1px | +20.7% | sim (720/720) |
| 1366×768  | 52.22px | 67.1px | +28.6% | sim (768/768) |
| 1440×900  | 57.60px | 74.9px | +30.0% | sim (900/900) |
| 1536×864  | 57.60px | 76.8px | +33.3% | sim (864/864) |
| 1920×1080 | 57.60px | 76.8px | +33.3% | sim (1080/1080) |

1280×720 fica abaixo da faixa de 25–35% de propósito: é a tela mais baixa
testada e, com 5 linhas + entrelinha correta + parágrafo + CTA + indicador,
qualquer valor maior empurraria o indicador de scroll para fora da Hero.

Esta regra vive **dentro de `@media (min-width: 1024px)`**. Entre 768 e
1023px a Hero ainda é empilhada (texto em cima, foto embaixo), a headline
usa a largura inteira e continua com a escala já aprovada.

## Sistema de breakpoints

Um único sistema, usado em todo o CSS — sem valores ad-hoc como 720/860/900:

```
mobile   até 767px
tablet   768–1023px   (--bp-tablet)
laptop   1024–1279px  (--bp-laptop)
desktop  1280px+      (--bp-desktop)
```

A troca estrutural (pilha → grid) acontece **sempre em 1024px**, o mesmo
ponto em que o header troca para navegação desktop — header e conteúdo
nunca ficam em "estados" diferentes. Entre 768 e 1279px o layout já usa a
versão desktop/grid; o que muda nesse intervalo é só escala via `clamp()`,
não estrutura.

`--header-height` (64px mobile / 88px tablet+) é uma altura **fixa** do
header (`height` + `display:flex; align-items:center`, não
padding-e-conteúdo-automático) — a Hero soma essa mesma variável no seu
`padding-top`, então os dois nunca podem ficar dessincronizados por um
header mais alto do que o esperado.

### Hero mobile: uma composição só (headline + João lado a lado)

No mobile a Hero tem três zonas:

```
ZONA A   headline (esquerda)  |  João (direita)     <- o "palco"
ZONA B   texto de apoio + assinatura, largura cheia
ZONA C   CTAs + Instagram + indicador de scroll
```

Tudo gira em torno de **uma variável**:

```css
.hero{
  --hero-stage-h: clamp(300px, 84vw, 390px);
  --hero-stage-top: calc(var(--header-height) + 14px);
}
.hero__media   { position:absolute; top:var(--hero-stage-top);
                 right:-12px; width:44%; height:var(--hero-stage-h); }
.hero__headline{ max-width:78%; min-height:calc(var(--hero-stage-h) - 26px); }
```

`--hero-stage-h` vale para os **dois lados ao mesmo tempo**: é a altura da
caixa do João *e* o `min-height` da headline. É isso que garante que o
parágrafo sempre comece depois do palco, em qualquer largura, sem ajuste
por breakpoint — o João nunca cai atrás do texto corrido.

#### Por que a altura do palco controla o tamanho do João

A foto é 2730×1536 (paisagem) e a caixa dele é estreita e alta. Nessa
combinação o `object-fit: cover` escala **sempre pela altura** e recorta na
horizontal. Consequência prática:

- a **altura** do palco decide o tamanho da cabeça;
- a **largura** da caixa decide só quanto do corpo aparece.

Aumentar a largura não aumenta o João. Por isso a escala dele se ajusta por
`--hero-stage-h`, não por `width` nem por `transform: scale()`.

`object-position: 50% top` centra a janela no corpo dele (que ocupa de 31% a
70% do quadro): o recorte que sobra sai pela direita, onde a foto já sangra
12px para fora do container, e `top` garante que o cabelo nunca seja
cortado. As duas máscaras cruzadas (`mask-composite`) dissolvem a caixa
retangular — a da esquerda apaga a emenda contra a headline, a de baixo
evita que o corpo termine num corte reto sobre o parágrafo.

#### A largura da headline é uma restrição de quebra, não de composição

O design exige cinco linhas:

```
O MUNDO DOS / PEIXES É / MAIOR / DO QUE / PARECE.
```

Medido em Anton, **"O MUNDO DOS" sozinho precisa de ~70% da coluna**,
enquanto as outras quatro linhas ocupam de 33% a 45%. Por isso
`max-width: 78%`: não é a largura visual do bloco, é só o mínimo para a
primeira linha não quebrar em duas. Visualmente a headline continua
ocupando pouco mais de 40% — o João fica ao lado das linhas curtas.

Isso também explica o piso do `clamp`: entre 361 e 390px o antigo piso de
`3rem` era **maior** que o termo em `vw`, e "O MUNDO DOS" estourava a
coluna. Com o piso em `2.35rem` quem manda nessa faixa é o `vw`, que
acompanha a largura da coluna.

Verificado por pixel em 360, 390 e 430: escondendo o texto e medindo a
luminância do fundo exatamente sob a tinta de cada linha, o pior valor é
**21/255** — a headline está sempre sobre preto, nunca sobre o João.

### Entrelinha no mobile é MAIOR que no desktop

Parece contraintuitivo, mas segue da métrica da Anton (ver acima): a reserva
do acento é uma fração fixa do `em` (0.234em). Em telas pequenas os títulos
display caem para o piso do `clamp()`, e aí 1.08em de entrelinha vira só
~2.9px de folga entre o til do "JOÃO?" e a linha de cima — tecnicamente não
encosta, mas **lê como se encostasse**. Por isso o bloco `≤767px` sobe a
entrelinha dos títulos (1.12–1.22) em vez de baixá-la.

A exceção é `.timeline-item__title--giant` ("BRASIL / JUMBOS."), que não tem
um acento sequer e mantém `--lh-display-flat` para preservar a pilha cerrada.

### O bloco 431–767px foi removido

Existia um ajuste `@media (min-width: 431px) and (max-width: 767px)` que
empurrava a fotografia para baixo (`inset-block-start: 50%`) e congelava a
headline em `3.35rem`. Ele resolvia a Hero antiga, em que a foto era uma
camada de fundo atrás do texto.

Com o palco lado a lado esse bloco passou a **atrapalhar**: o
`inset-block-start: 50%` vencia o `top` do palco (vem depois no arquivo) e
jogava o João para o meio da tela em telas de 431px para cima — o que
quebrava a composição justamente em tablets. Foi removido.

## Progressive enhancement (a página funciona sem JavaScript)

Um script síncrono no `<head>` (`document.documentElement.classList.add('js')`)
adiciona a classe `.js` ao `<html>` antes da página pintar. Todo o sistema
de reveal-on-scroll (`[data-reveal]`, `[data-reveal-block]`,
`[data-reveal-scale]`) está escondido atrás do seletor `.js [data-reveal...]`
no CSS — sem JavaScript, `.js` nunca existe, essas regras de `opacity:0`
nem chegam a valer, e todo o conteúdo nasce visível. Teste isso desabilitando
JavaScript no navegador antes de mudar esse sistema: nenhum elemento pode
depender de script rodar para aparecer.

## Notas de performance/SEO já aplicadas

- Imagem da Hero (LCP) sem `loading="lazy"`, com `fetchpriority="high"` e
  `<link rel="preload">`.
- Todas as demais imagens abaixo da dobra usam `loading="lazy"` +
  `decoding="async"`.
- `<picture>` com `srcset`/`sizes` (webp com fallback jpg) em todas as fotos.
- Uma única webfont (Anton, peso 400, `font-display: swap`) só para
  headlines; o corpo do texto usa a pilha `system-ui`.
- `prefers-reduced-motion: reduce` remove parallax, contadores animados e o
  scroll horizontal da timeline, mostrando o conteúdo final imediatamente.
- JSON-LD (`Person`) com apenas informações confirmadas pelo cliente.
