/* Brasil Jumbos — script principal (vanilla JS, sem dependências) */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Header: estado ao rolar + menu mobile
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    var menuBtn = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!menuBtn || !menu) return;
    var menuIcon = menuBtn.querySelector("[data-menu-icon]");

    function closeMenu() {
      menu.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Abrir menu");
      if (menuIcon) menuIcon.setAttribute("href", "#icon-menu");
      window.setTimeout(function () {
        menu.hidden = true;
      }, 250);
    }
    function openMenu() {
      menu.hidden = false;
      requestAnimationFrame(function () {
        menu.classList.add("is-open");
      });
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Fechar menu");
      if (menuIcon) menuIcon.setAttribute("href", "#icon-close");
    }

    menuBtn.addEventListener("click", function () {
      var isOpen = menu.classList.contains("is-open");
      if (isOpen) closeMenu(); else openMenu();
    });

    menu.querySelectorAll("[data-menu-link]").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initReveals() {
    var targets = document.querySelectorAll(
      "[data-reveal], [data-reveal-block], [data-reveal-left], [data-reveal-line]"
    );
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  function initHeroEntrance() {
    var figure = document.querySelector("[data-reveal-figure]");

    if (prefersReducedMotion) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
      if (figure) figure.style.opacity = 1;
      return;
    }

    /* A fotografia da Hero preenche exatamente a área dela, então a entrada
       usa SÓ opacidade: qualquer translate deixaria uma faixa preta à mostra
       na borda enquanto a animação roda. */
    if (figure) {
      figure.style.opacity = 0;
      figure.style.transition = "opacity 1s cubic-bezier(.16,.84,.44,1) .15s";
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll("[data-reveal-group] [data-reveal]").forEach(function (el, i) {
          el.style.transitionDelay = (i * 90) + "ms";
          el.classList.add("is-visible");
        });
        if (figure) figure.style.opacity = 1;
      });
    });
  }

  /* ---------------------------------------------------------------------
     Indicador discreto de progresso de scroll
     --------------------------------------------------------------------- */
  function initScrollProgress() {
    if (prefersReducedMotion) return;
    var bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = "scaleY(" + progress + ")";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------------
     Hero parallax muito sutil
     --------------------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReducedMotion) return;
    var intro = document.querySelector(".hero__intro");
    var hero = document.querySelector(".hero");
    if (!intro || !hero) return;

    /* Só o bloco de texto se move. A fotografia agora preenche a Hero inteira:
       deslocá-la abriria uma faixa vazia na borda. */
    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
      intro.style.transform = "translateY(" + (progress * 14) + "px)";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------------
     Contadores de impacto
     --------------------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.dataset.target || "0");
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";

      if (prefersReducedMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }

      var duration = 1000;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     ÚLTIMOS VÍDEOS — deck de três cartas

     Só monta o DOM. Toda a interação (leque, hover, foco, carrossel) é CSS:
     não há mouseenter/mouseleave aqui de propósito.
     --------------------------------------------------------------------- */
  function initLatestVideos() {
    var section = document.querySelector("[data-videos-section]");
    var deck = document.querySelector("[data-videos-deck]");
    if (!section || !deck) return;

    var videos = window.BRASIL_JUMBOS_LATEST_VIDEOS || [];
    if (!videos.length) return;

    /* A lista vem em ordem de importância (principal, segundo, terceiro) e
       vira posição visual. O DOM, porém, é montado esquerda → centro →
       direita para que o Tab siga a ordem da tela, não a de prioridade. */
    var byPosition = [
      { pos: "left", video: videos[1] },
      { pos: "center", video: videos[0] },
      { pos: "right", video: videos[2] },
    ];

    function buildCard(entry, index) {
      var v = entry.video;
      if (!v) return null;

      var url = (v.url || "").trim();
      var title = (v.title || "").trim();
      var thumb = (v.thumbnail || "").trim();

      /* Sem URL a carta existe, mas não é link: nada de href="#" nem de
         link morto que o teclado alcança e que não leva a lugar nenhum. */
      var card = document.createElement(url ? "a" : "div");
      card.className = "video-card video-card--" + entry.pos;
      if (url) {
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute(
          "aria-label",
          (title ? "Assistir: " + title : "Assistir ao vídeo " + (index + 1) + " do Brasil Jumbos") +
            " (abre em nova aba)"
        );
      } else {
        card.classList.add("video-card--pending");
      }

      var poster = document.createElement("span");
      poster.className = "video-card__poster";

      if (thumb) {
        var img = document.createElement("img");
        img.src = thumb;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        /* width/height reais reservam a caixa antes do download (evita CLS)
           sem forçar recorte: o CSS deixa a altura em `auto`. */
        if (v.width) img.width = v.width;
        if (v.height) img.height = v.height;
        /* Enquanto o arquivo ainda não existe (ou o caminho muda), a carta
           cai no estado sem thumbnail em vez de exibir ícone de imagem
           quebrada. Mantém o leque de pé durante a configuração. */
        img.addEventListener("error", function () {
          img.remove();
          card.classList.add("video-card--no-thumb");
          if (v.width && v.height) poster.style.aspectRatio = v.width + " / " + v.height;
        });
        poster.appendChild(img);
      } else {
        /* Sem arquivo ainda: a carta mantém a proporção declarada para o
           leque não desmontar enquanto as thumbnails não chegam. */
        card.classList.add("video-card--no-thumb");
        if (v.width && v.height) {
          poster.style.aspectRatio = v.width + " / " + v.height;
        }
      }

      var play = document.createElement("span");
      play.className = "video-card__play";
      play.setAttribute("aria-hidden", "true");
      play.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" focusable="false"><use href="#icon-play"></use></svg>';
      poster.appendChild(play);

      card.appendChild(poster);

      /* Título só aparece se for real — nada de placeholder inventado. */
      if (title) {
        var label = document.createElement("span");
        label.className = "video-card__title";
        label.textContent = title;
        card.appendChild(label);
      }

      return card;
    }

    var built = 0;
    byPosition.forEach(function (entry, i) {
      var card = buildCard(entry, i);
      if (card) {
        deck.appendChild(card);
        built++;
      }
    });

    if (built) section.hidden = false;
  }

  /* ---------------------------------------------------------------------
     Item de publicação como link editorial (sem thumbnail).
     Nesta direção visual, a única fotografia do site é a da Hero — o feed
     e os destaques viram tipografia. A integração com a API não muda.
     --------------------------------------------------------------------- */
  function buildPostLink(index, url, title) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "post-list__link";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    var idx = document.createElement("span");
    idx.className = "post-list__index";
    idx.textContent = String(index + 1).padStart(2, "0");

    var label = document.createElement("span");
    label.className = "post-list__title";
    label.textContent = title || "Publicação recente";

    var cta = document.createElement("span");
    cta.className = "post-list__cta";
    cta.textContent = "Abrir no Instagram ↗";

    a.appendChild(idx);
    a.appendChild(label);
    a.appendChild(cta);
    li.appendChild(a);
    return li;
  }

  /* Chave de comparação de publicação: só o caminho do permalink, sem
     query string (?utm_source=…) nem barra final — o mesmo Reel copiado de
     lugares diferentes gera URLs distintas para o mesmo conteúdo. */
  function postKey(url) {
    if (!url) return "";
    try {
      return new URL(url, window.location.href).pathname.replace(/\/+$/, "").toLowerCase();
    } catch (e) {
      return String(url).split("?")[0].replace(/\/+$/, "").toLowerCase();
    }
  }

  /* Permalinks já exibidos em "Destaques" — o destaque tem prioridade e o
     mesmo post não se repete em "Últimas publicações". */
  var featuredKeys = Object.create(null);

  /* =====================================================================
     INTEGRAÇÃO INSTAGRAM — DORMENTE, NÃO REMOVER

     As seções "Destaques" e "Últimas publicações" deixaram de ser
     renderizadas: quem ocupa esse lugar agora é ÚLTIMOS VÍDEOS. As funções
     abaixo continuam no projeto de propósito — ambas fazem early-return
     porque os elementos [data-featured-section] / [data-feed-section] não
     existem mais no HTML, então nenhuma requisição é disparada e nada é
     inserido na página.

     Ficam aqui, junto com netlify/functions/instagram-feed.js e o cache da
     Graph API, para que o feed automático possa ser reativado sem
     reconstruir a integração: basta devolver o markup da seção ao HTML.
     ===================================================================== */

  /* ---------------------------------------------------------------------
     Destaques (curados em data/featured-posts.js)
     --------------------------------------------------------------------- */
  function initFeatured() {
    var section = document.querySelector("[data-featured-section]");
    var grid = document.querySelector("[data-featured-grid]");
    var posts = window.BRASIL_JUMBOS_FEATURED_POSTS || [];
    if (!section || !grid || !posts.length) return;

    posts.forEach(function (post, i) {
      featuredKeys[postKey(post.url)] = true;
      grid.appendChild(buildPostLink(i, post.url, post.title));
    });

    section.hidden = false;
  }

  /* ---------------------------------------------------------------------
     Últimas publicações — feed automático via função serverless,
     com fallback em cascata: API -> cache -> posts estáticos configurados.
     --------------------------------------------------------------------- */
  function initFeed() {
    var section = document.querySelector("[data-feed-section]");
    var track = document.querySelector("[data-feed-track]");
    if (!section || !track) return;

    function captionTitle(item) {
      if (!item.caption) return "Publicação recente";
      var firstLine = item.caption.split("\n")[0].trim();
      if (!firstLine) return "Publicação recente";
      return firstLine.length > 70 ? firstLine.slice(0, 70).trim() + "…" : firstLine;
    }

    /* Remove o que já está em "Destaques": o mesmo post não aparece duas
       vezes na página. Se sobrar nada, a subseção continua oculta. */
    function withoutFeatured(list, urlOf) {
      return list.filter(function (item) { return !featuredKeys[postKey(urlOf(item))]; });
    }

    function renderFromApi(items) {
      withoutFeatured(items, function (i) { return i.permalink; })
        .forEach(function (item, i) {
          track.appendChild(buildPostLink(i, item.permalink, captionTitle(item)));
        });
    }

    function renderFromStatic(posts) {
      withoutFeatured(posts, function (p) { return p.url; })
        .forEach(function (post, i) {
          track.appendChild(buildPostLink(i, post.url, post.title));
        });
    }

    function reveal() {
      if (track.children.length > 0) section.hidden = false;
    }

    fetch("/.netlify/functions/instagram-feed", { headers: { Accept: "application/json" } })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error("bad response")); })
      .then(function (json) {
        var data = (json && json.data) || [];
        if (data.length) {
          renderFromApi(data);
        } else {
          renderFromStatic(window.BRASIL_JUMBOS_FEATURED_POSTS || []);
        }
        reveal();
      })
      .catch(function () {
        renderFromStatic(window.BRASIL_JUMBOS_FEATURED_POSTS || []);
        reveal();
      });
  }

  /* ---------------------------------------------------------------------
     Números de seguidores (só exibe quando configurado)
     --------------------------------------------------------------------- */
  function initSocialCounts() {
    var counts = window.BRASIL_JUMBOS_SOCIAL_COUNTS || {};
    document.querySelectorAll("[data-social-count]").forEach(function (el) {
      var key = el.dataset.socialCount;
      var value = counts[key];
      if (value === null || value === undefined) return;
      el.textContent = new Intl.NumberFormat("pt-BR").format(value) + " seguidores";
    });
  }

  /* ---------------------------------------------------------------------
     Ano do rodapé
     --------------------------------------------------------------------- */
  function initFooterYear() {
    var el = document.querySelector("[data-current-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHeroEntrance();
    initReveals();
    initScrollProgress();
    initHeroParallax();
    initCounters();
    initLatestVideos();
    initFeatured();
    initFeed();
    initSocialCounts();
    initFooterYear();
  });
})();
