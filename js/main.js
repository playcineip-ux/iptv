/* ============================================================
   CINEPIPOQUEIRA — Script principal (Novo Visual v1)
   Configurações editáveis em js/config.js
   ============================================================ */
(function () {
  "use strict";

  var CFG = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG) ? SITE_CONFIG : {};
  var WA = CFG.whatsapp || {};

  /* ---------- ANALYTICS: track() unificado ----------
     Envia eventos para GA4, Meta Pixel e dataLayer. Se não houver
     provedor, o evento fica no window.dataLayer para conectar depois.
     Eventos: cta_test_click, plan_select, whatsapp_open, faq_open   */
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    if (typeof window.fbq === "function") window.fbq("trackCustom", name, params);
  }

  /* ---------- 1. WHATSAPP ---------- */
  function waLink(message) {
    var number = String(WA.number || "").replace(/\D/g, "");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message || "");
  }
  function messageFor(el) {
    var type = el.getAttribute("data-wa-msg");
    if (type === "trial") return WA.trialMessage || WA.defaultMessage;
    if (type === "device") return WA.deviceMessage || WA.defaultMessage;
    if (type === "plan") {
      var plano = el.getAttribute("data-plan") || "";
      var tpl = WA.planMessageTemplate || "Olá! Quero saber mais sobre o plano {plano}.";
      return tpl.replace("{plano}", plano);
    }
    return WA.defaultMessage;
  }
  [].forEach.call(document.querySelectorAll("[data-wa]"), function (el) {
    el.setAttribute("href", waLink(messageFor(el)));
    el.addEventListener("click", function () {
      var loc = el.getAttribute("data-loc") || "";
      var ev = el.getAttribute("data-ev");
      track("whatsapp_open", { origin: loc, interest: el.getAttribute("data-wa-msg") || "default" });
      if (ev === "test") track("cta_test_click", { location: loc });
      if (ev === "plan") track("plan_select", { plan: el.getAttribute("data-plan") || "" });
    });
  });
  // Cliques em CTAs que não abrem WhatsApp (ex.: "Conhecer os planos")
  [].forEach.call(document.querySelectorAll("[data-ev='plans']"), function (el) {
    el.addEventListener("click", function () { track("plan_select", { plan: "ver_todos", location: el.getAttribute("data-loc") || "" }); });
  });

  /* ---------- 2. REDES SOCIAIS ---------- */
  [].forEach.call(document.querySelectorAll("[data-social]"), function (el) {
    var key = el.getAttribute("data-social");
    if (CFG.social && CFG.social[key]) el.setAttribute("href", CFG.social[key]);
  });

  /* ---------- 3. CABEÇALHO AO ROLAR ---------- */
  var header = document.getElementById("header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. MENU MOBILE ---------- */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  if (navToggle && nav) {
    /* M1.1 — trava a rolagem do fundo enquanto o painel esta aberto. */
    var travarFundo = function (on) {
      document.body.classList.toggle("nav-open", on);
    };
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      travarFundo(open);
    });
    [].forEach.call(nav.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        travarFundo(false);
      });
    });
  }

  /* ---------- 5. SCROLLSPY (nav ativa) ---------- */
  var navLinks = nav ? [].slice.call(nav.querySelectorAll("a[href^='#']")) : [];
  var spySections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 6. REVEAL ---------- */
  var revealEls = document.querySelectorAll(".section-title, .panel, .plan, .tile, .poster-row, .trust-bar, .faq-item, .final-cta__box, .hero__content, .hero__media");
  [].forEach.call(revealEls, function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); ro.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    [].forEach.call(revealEls, function (el) { ro.observe(el); });
  } else {
    [].forEach.call(revealEls, function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 7. FAQ ---------- */
  [].forEach.call(document.querySelectorAll(".faq-item"), function (item) {
    var btn = item.querySelector(".faq-item__q");
    var ans = item.querySelector(".faq-item__a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      if (!isOpen) {
        item.classList.add("is-open");
        ans.style.maxHeight = ans.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
        track("faq_open", { question: btn.getAttribute("data-faq") || "" });
      } else {
        item.classList.remove("is-open");
        ans.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- 8. CATÁLOGO TMDB (Filmes / Séries em abas) ---------- */
  (function trending() {
    var moviesRow = document.getElementById("moviesRow");
    var seriesRow = document.getElementById("seriesRow");
    if (!moviesRow || !seriesRow) return;
    var cfg = CFG.trending || {};

    function posterHtml(item) {
      return '<figure class="poster">' +
        '<img src="' + item.img + '" alt="Capa de ' + item.title + '" decoding="async" loading="lazy">' +
        (item.tag ? '<span class="poster__tag">' + item.tag + "</span>" : "") +
        '<span class="poster__play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>' +
        '<span class="poster__dots">&#8942;</span>' +
        '<figcaption class="poster__cap">' + item.title + "</figcaption>" +
        "</figure>";
    }
    function fromTmdb(m) {
      return { title: m.title || m.name, img: "https://image.tmdb.org/t/p/w342" + m.poster_path, tag: m.vote_average ? "★ " + m.vote_average.toFixed(1) : "" };
    }
    function fill(row, items) { if (items && items.length) row.innerHTML = items.map(posterHtml).join(""); }

    if (cfg.tmdbApiKey) {
      var base = "https://api.themoviedb.org/3/trending/";
      var qs = "/week?language=pt-BR&api_key=" + encodeURIComponent(cfg.tmdbApiKey);
      function load(path) {
        return fetch(base + path + qs).then(function (r) { return r.ok ? r.json() : Promise.reject(); })
          .then(function (d) { return (d.results || []).filter(function (m) { return m.poster_path; }).slice(0, 14).map(fromTmdb); })
          .catch(function () { return []; });
      }
      Promise.all([load("movie"), load("tv")]).then(function (res) {
        fill(moviesRow, res[0]); fill(seriesRow, res[1]); buildDots();
        paintDevices(res[0].concat(res[1]));
      });
    }

    /* Telas dos dispositivos: reaproveita os itens já baixados acima, sem
       nenhuma chamada extra à API. Sem dados, cai no fallback abstrato. */
    function paintDevices(items) {
      var stage = document.getElementById("devicesStage");
      if (!stage) return;
      if (!items || !items.length) { stage.classList.add("is-empty"); return; }
      stage.classList.remove("is-empty");
      var pos = 0;
      [].forEach.call(stage.querySelectorAll(".dv__screen"), function (screen) {
        var n = parseInt(screen.getAttribute("data-count"), 10) || 1;
        var html = "";
        for (var i = 0; i < n; i++) {
          var item = items[pos % items.length]; pos++;
          html += '<img src="' + item.img + '" alt="" aria-hidden="true" loading="lazy" decoding="async">';
        }
        screen.innerHTML = html;
      });
    }
    if (!cfg.tmdbApiKey) { paintDevices(null); }

    var rows = { movies: moviesRow, series: seriesRow };
    var activePane = "movies";
    var dotsEl = document.getElementById("trendDots");

    /* M2 — durante resize/rotacao a linha pode reportar clientWidth ainda
       invalido (0, ou alguns pixels): a divisao gerava dezenas de dots — ja
       foram observados 66 — e com 0 daria Infinity, travando o laco abaixo.
       Sem dimensao utilizavel devolve 0 e buildDots preserva os dots atuais.
       O teto pelo numero de itens impede qualquer contagem absurda. */
    function pages(row) {
      var w = row.clientWidth;
      if (!w || w < 40) return 0;
      var n = Math.ceil((row.scrollWidth - 2) / w);
      if (!isFinite(n) || n < 1) return 0;
      return Math.min(n, row.children.length || 1);
    }
    function currentPage(row) {
      var w = row.clientWidth;
      return w ? Math.round(row.scrollLeft / w) : 0;
    }
    function buildDots() {
      if (!dotsEl) return;
      var row = rows[activePane];
      var n = pages(row);
      if (!n) return;
      dotsEl.innerHTML = "";
      for (var i = 0; i < n; i++) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Página " + (i + 1));
        b.className = i === currentPage(row) ? "is-active" : "";
        (function (idx) { b.addEventListener("click", function () { row.scrollTo({ left: idx * row.clientWidth, behavior: "smooth" }); }); })(i);
        dotsEl.appendChild(b);
      }
    }
    function syncDots() {
      if (!dotsEl) return;
      var cur = currentPage(rows[activePane]);
      [].forEach.call(dotsEl.children, function (b, i) { b.classList.toggle("is-active", i === cur); });
    }
    [moviesRow, seriesRow].forEach(function (row) {
      var t; row.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(syncDots, 80); }, { passive: true });
    });
    /* Debounce: o resize dispara em rajada e e justamente durante a rajada
       que as dimensoes ficam transitorias. */
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(buildDots, 150);
    });

    // Abas
    var tabs = [].slice.call(document.querySelectorAll(".trend__tab"));
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var pane = tab.getAttribute("data-tab");
        activePane = pane;
        tabs.forEach(function (t) { var on = t === tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on ? "true" : "false"); });
        rows.movies.hidden = pane !== "movies";
        rows.series.hidden = pane !== "series";
        buildDots();
      });
    });

    // Setas
    [].forEach.call(document.querySelectorAll(".trend__arrow"), function (arrow) {
      arrow.addEventListener("click", function () {
        var row = rows[activePane];
        var amount = Math.round(row.clientWidth * 0.85) * (arrow.getAttribute("data-arrow") === "next" ? 1 : -1);
        row.scrollBy({ left: amount, behavior: "smooth" });
      });
    });
  })();

  /* ---------- 9. GRIDS DE CANAIS E COMPETIÇÕES (logos oficiais) ---------- */
  (function channels() {
    var CH = [
      ["telecine-logo.png", "Telecine"], ["tnt-logo.png", "TNT"], ["warner-logo.png", "Warner"],
      ["axn-logo.png", "AXN"], ["universaltv-logo.png", "Universal TV"], ["discovery-logo.png", "Discovery"],
      ["cartoonnetwork-logo.png", "Cartoon Network"], ["sporttv-logo.png", "SporTV"]
    ];
    var COMP = [
      ["brasileirao.png", "Brasileirão"], ["libertadores.png", "Libertadores"], ["chapions-league.png", "Champions League"],
      ["nba.png", "NBA"], ["formula-1.png", "Fórmula 1"], ["ufc.png", "UFC"]
    ];
    function fillGrid(id, list, path) {
      var g = document.getElementById(id); if (!g) return;
      if (g.children.length) return; // já preenchido no HTML: não sobrescreve
      g.innerHTML = list.map(function (i) {
        return '<div class="tile"><img src="' + path + i[0] + '" alt="' + i[1] + '" loading="lazy"></div>';
      }).join("");
    }
    fillGrid("channelsGrid", CH, "assets/img/channels/");
    fillGrid("competitionsGrid", COMP, "assets/img/sports/");
  })();

  /* ---------- 10. SELETOR DE PLANOS (mobile) ---------- */
  (function planSelector() {
    var grid = document.getElementById("plansGrid");
    var select = document.getElementById("planSelect");
    if (!grid || !select) return;
    var cards = [].slice.call(grid.querySelectorAll(".plan"));

    var chips = cards.map(function (card) {
      var name = card.querySelector(".plan__name").textContent.trim();
      var price = card.querySelector(".plan__price").textContent.trim();
      var badgeEl = card.querySelector(".plan__badge");
      var badgeType = badgeEl ? (badgeEl.classList.contains("plan__badge--yellow") ? "yellow" : "green") : "";
      var badgeTxt = badgeEl ? badgeEl.textContent.trim() : "";
      var chip = document.createElement("button");
      chip.className = "plan-select__item";
      chip.setAttribute("data-plan", name);
      if (badgeType) chip.setAttribute("data-badge", badgeType);
      chip.innerHTML =
        (badgeTxt ? '<span class="ps-badge" style="color:' + (badgeType === "yellow" ? "var(--yellow)" : "var(--green-light)") + '">' + badgeTxt + "</span>" : '<span class="ps-badge">&nbsp;</span>') +
        '<span class="ps-name">' + name + "</span>" +
        '<span class="ps-price">' + price.replace("R$", '<span class="cur">R$</span>') + "</span>";
      return chip;
    });

    function selectPlan(name) {
      cards.forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-plan") === name); });
      chips.forEach(function (c) { c.classList.toggle("is-selected", c.getAttribute("data-plan") === name); });
    }
    chips.forEach(function (chip) {
      select.appendChild(chip);
      chip.addEventListener("click", function () {
        var name = chip.getAttribute("data-plan");
        selectPlan(name);
        track("plan_select", { plan: name, location: "selector_mobile" });
      });
    });
    // Padrão: plano recomendado (Semestral)
    var rec = cards.filter(function (c) { return c.classList.contains("plan--recommended"); })[0] || cards[0];
    selectPlan(rec.getAttribute("data-plan"));
  })();

  /* ---------- 11. TELA ADICIONAL (colapsável) ---------- */
  (function addon() {
    var toggle = document.getElementById("addonToggle");
    var panel = document.getElementById("addonPanel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = toggle.parentElement.classList.toggle("is-open");
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  })();

  /* ---------- 12. CTA FIXO (mobile) — some ao chegar no rodapé ---------- */
  (function sticky() {
    var cta = document.getElementById("stickyCta");
    // M4: o CTA final e o sticky sao o mesmo pedido, no mesmo verde e em
    // largura total — lado a lado eles competiam. O sticky agora recolhe
    // tambem quando a faixa final entra em cena, nao so no rodape.
    var alvos = [].filter.call(
      [document.querySelector(".final-cta"), document.querySelector(".site-footer")],
      Boolean
    );
    if (!cta || !alvos.length || !("IntersectionObserver" in window)) return;
    var visivel = alvos.map(function () { return false; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = alvos.indexOf(e.target);
        if (i > -1) visivel[i] = e.isIntersecting;
      });
      cta.classList.toggle("is-hidden", visivel.indexOf(true) > -1);
    }, { rootMargin: "0px 0px -10px 0px" });
    alvos.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 13. ANO DO RODAPÉ ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 14. FERRAMENTAS DE ANÁLISE (GA4 + Meta Pixel) ---------- */
  var an = CFG.analytics || {};
  if (an.googleAnalyticsId) {
    var gs = document.createElement("script");
    gs.async = true; gs.src = "https://www.googletagmanager.com/gtag/js?id=" + an.googleAnalyticsId;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", an.googleAnalyticsId);
  }
  if (an.metaPixelId) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", an.metaPixelId);
    window.fbq("track", "PageView");
  }
})();
