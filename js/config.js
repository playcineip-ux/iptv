/* ============================================================
   CONFIGURAÇÃO DO SITE — CinePipoqueira
   ------------------------------------------------------------
   Edite APENAS este arquivo para atualizar:
   - Número do WhatsApp
   - Mensagens automáticas dos botões
   - Links das redes sociais
   - IDs do Google Analytics e Meta Pixel
   - Depoimentos de clientes
   ============================================================ */

const SITE_CONFIG = {

  /* ---------- WHATSAPP ----------
     Formato do número: código do país + DDD + número, apenas dígitos.
     Exemplo Brasil: "5511999999999"
     >>> SUBSTITUA o número abaixo pelo número oficial. <<< */
  whatsapp: {
    number: "5511966957972",

    // Mensagem padrão / teste de 3 horas (CTAs principais do hero, header, CTA final)
    defaultMessage:
      "Olá! Vim pelo site da CinePipoqueira e quero solicitar meu teste de 3 horas.",

    // Mensagem do botão de teste gratuito
    trialMessage:
      "Olá! Vim pelo Instagram playcineiptv e quero solicitar meu teste de 3 horas.",

    // Mensagem do botão de compatibilidade ("Confirmar meu aparelho")
    deviceMessage:
      "Olá! Vim pelo site e quero confirmar se meu aparelho é compatível.",

    // Modelo das mensagens de plano — {plano} é substituído pelo nome
    planMessageTemplate:
      "Olá! Vim pelo site e quero saber mais sobre o plano {plano}."
  },

  /* ---------- LINKS DE CHECKOUT DOS PLANOS ----------
     DESATIVADO: todos os botões "Assinar Plano X" abrem o
     WhatsApp, cada um com a mensagem do seu plano.
     Se um dia quiser pagamento direto, basta colar a URL da
     página de checkout no plano correspondente — o botão passa
     a levar para lá automaticamente. Atenção: o preço exibido
     no site deve sempre coincidir com o do checkout.          */
  checkout: {
    mensal: "",
    trimestral: "",
    semestral: "",
    anual: ""
  },

  /* ---------- REDES SOCIAIS ---------- */
  /* Redes sociais oficiais (Fonte 4). Instagram principal e Cine2
     estão confirmados. Facebook, TikTok e YouTube têm apenas o
     nome de usuário "cinepipoqueira" confirmado — os links
     completos ficam "a definir"; adicione-os aqui quando forem
     confirmados e crie o ícone correspondente no rodapé. */
  social: {
    instagram: "https://www.instagram.com/playcineiptv/",
    instagram2: "https://www.instagram.com/playcineiptv/"
  },

  /* ---------- FERRAMENTAS DE ANÁLISE ----------
     ATIVAS. O site carrega o Google Analytics e o Meta Pixel
     sozinho e registra, além das visitas de cada página:
     - whatsapp_click (GA) / Contact (Meta)
       => disparam em QUALQUER botão de WhatsApp, inclusive os
          "Assinar Plano X", já que hoje todos levam à conversa.
     - begin_checkout / InitiateCheckout
       => só passam a disparar se você reativar os links de
          pagamento na seção "checkout" acima.
     Deixe em branco ("") para desativar.                      */
  analytics: {
    googleAnalyticsId: "G-9QM9CRZ2VE",
    metaPixelId: "1321645109841915"
  },

  /* ---------- DEPOIMENTOS ----------
     A seção de depoimentos só aparece no site quando houver
     pelo menos um depoimento REAL cadastrado aqui.
     Modelo:
     { nome: "Nome do cliente", texto: "Depoimento real do cliente.", cidade: "Cidade/UF" }
  */
  testimonials: [
    // { nome: "", texto: "", cidade: "" },
  ],

  /* ---------- VÍDEO DE DEMONSTRAÇÃO ----------
     A seção "Por dentro do app" aparece automaticamente quando
     houver um preview. São dois arquivos:
     - demoPreview: clipe curto e MUDO que toca sozinho em loop
       (a "visão rápida" que o visitante vê de imediato).
     - demoVideo: vídeo completo COM SOM, que abre ao clicar em
       "Assistir com som". Deixe "" para não ter versão completa.
     Deixe demoPreview em "" para ocultar a seção toda.

     DESATIVADO: a seção foi retirada junto com o painel antigo.
     Para reativar: grave o vídeo do painel próprio, salve em
     assets/video/, aponte os caminhos aqui e descomente o bloco
     da seção "demo" no index.html.                             */
  demoPreview: "",
  demoVideo: "",

  /* ---------- CATÁLOGOS EM ALTA (filmes e séries) ----------
     Exibe duas vitrines de capas na seção de Conteúdos:
     "Filmes em alta" e "Séries em alta". Funciona de dois modos
     (cada catálogo fica oculto se não tiver dados):

     1) AUTOMÁTICO (recomendado): com a chave TMDB abaixo, o site
        busca sozinho os filmes e as séries mais populares da
        semana, com capas oficiais em português, sempre
        atualizados. Crie a chave gratuita em
        https://www.themoviedb.org (Configurações > API).

     2) MANUAL: preencha as listas "manualFilmes" e "manualSeries"
        com capas salvas em assets/img/posters/ (proporção 2:3,
        ex.: 342x513 px). O modo manual tem prioridade sobre o
        automático.                                             */
  trending: {
    tmdbApiKey: "1835e27e6b59e811cf2643987ef07645",
    manualFilmes: [
      // { titulo: "Nome do filme", imagem: "assets/img/posters/exemplo-1.jpg" },
    ],
    manualSeries: [
      // { titulo: "Nome da série", imagem: "assets/img/posters/exemplo-2.jpg" },
    ]
  },

  /* ---------- CATÁLOGO DINÂMICO (opcional / futuro) ----------
     Estrutura reservada para integração futura com uma API de
     catálogo (capas, sinopses etc.). Mantenha desativado até
     a integração ser configurada. */
  catalog: {
    enabled: false,
    apiUrl: "",
    apiKey: ""
  }
};
