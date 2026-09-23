/**
 * ÚLTIMOS VÍDEOS — os três vídeos em destaque do Brasil Jumbos.
 *
 * ---------------------------------------------------------------------------
 * COMO CONFIGURAR
 * ---------------------------------------------------------------------------
 * A lista tem SEMPRE três itens, em ordem de importância:
 *
 *   [0]  vídeo principal / mais recente  ->  carta do CENTRO
 *   [1]  segundo vídeo                   ->  carta da ESQUERDA
 *   [2]  terceiro vídeo                  ->  carta da DIREITA
 *
 * Para trocar a ordem visual, basta reordenar os objetos aqui — o script
 * cuida do resto. (A ordem no HTML continua esquerda → centro → direita,
 * para que a navegação por Tab siga a ordem visual da tela.)
 *
 * ---------------------------------------------------------------------------
 * CAMPOS
 * ---------------------------------------------------------------------------
 * thumbnail  Caminho da imagem. Use WebP e salve em assets/videos/.
 *            Enquanto o arquivo não existir, deixe como está: a carta é
 *            renderizada sem imagem, sem quebrar o layout.
 *
 * url        Link do vídeo na plataforma original (Instagram, YouTube,
 *            TikTok…). ENQUANTO ESTIVER VAZIO a carta aparece, mas NÃO é
 *            clicável — não é gerado href="#" nem link morto. Assim que
 *            você colar o link real, ela vira link automaticamente.
 *
 * title      OPCIONAL. Só preencha se for o título real do vídeo. Vazio =
 *            nenhum texto é exibido sobre a thumbnail (nada de placeholder).
 *
 * width      Dimensões REAIS do arquivo de thumbnail, em pixels. Servem para
 * height     o navegador reservar o espaço certo antes da imagem carregar
 *            (evita o layout "pular"). O padrão 1080×1920 é o de um vídeo
 *            vertical 9:16 — ajuste se a sua thumbnail tiver outra proporção.
 *            A imagem NUNCA é distorcida nem cortada: a carta se adapta à
 *            proporção real do arquivo.
 */
window.BRASIL_JUMBOS_LATEST_VIDEOS = [
  {
    /* CENTRO — vídeo principal */
    thumbnail: "tumbMulherpegaCascudogigantenaamazônia.webp",
    url: "https://www.instagram.com/reel/DdZh1lSp_Du/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
    title: "Mulher pega Cascudo gigante na amazônia!!",
    width: 1080,
    height: 1920,
  },
  {
    /* ESQUERDA — segundo vídeo */
    thumbnail: "tumbCascudosecovoltaavidadeformamilagrosa.webp",
    url: "https://www.instagram.com/reel/DdZl8gtpWU2/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
    title: "Cascudo seco volta a vida de forma milagrosa?",
    width: 1080,
    height: 1920,
  },
  {
    /* DIREITA — terceiro vídeo */
    thumbnail: "tumbPorqueaLulamudadecorquandoabatida.webp",
    url: "https://www.instagram.com/reel/DdM0LygJ-Sf/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
    title: "Por que a Lula muda de cor quando abatida?",
    width: 1080,
    height: 1920,
  },
];
