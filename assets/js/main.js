(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ───── 국문 / 영문 전환 (한 페이지 안에서) ─────
     data-en: 영문 내용, data-en-alt / data-en-aria-label: 영문 속성.
     국문 원본은 처음 전환할 때 data-ko에 보관합니다. */
  const META = {
    ko: { title: "한존재 閑存齋 · 영덕 한옥스테이", desc: "산과 들 사이, 하루 한 팀만 머무는 영덕의 독채 한옥스테이 한존재. 참나무 군불 황토방과 누마루, 정성껏 차린 아침상." },
    en: { title: "HANJONJAE 閑存齋 · Hanok Stay in Yeongdeok, Korea", desc: "A private hanok for one party a day, set between mountains and rice fields in Yeongdeok, Korea. Wood-fired ondol, an open numaru and a homemade breakfast." },
  };
  const swapAttr = (el, attr, lang) => {
    const koKey = "data-ko-" + attr, enKey = "data-en-" + attr;
    if (!el.hasAttribute(koKey)) el.setAttribute(koKey, el.getAttribute(attr) || "");
    el.setAttribute(attr, lang === "en" ? el.getAttribute(enKey) : el.getAttribute(koKey));
  };
  let currentLang = "ko";
  const setLang = (lang, { save = true } = {}) => {
    if (lang !== "en") lang = "ko";
    $$("[data-en]").forEach((el) => {
      if (el.parentElement && el.parentElement.closest("[data-en]")) return; // 바깥 묶음이 처리
      if (!el.hasAttribute("data-ko")) el.setAttribute("data-ko", el.innerHTML);
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ko");
    });
    $$("[data-en-alt]").forEach((el) => swapAttr(el, "alt", lang));
    $$("[data-en-aria-label]").forEach((el) => swapAttr(el, "aria-label", lang));
    document.documentElement.lang = lang;
    document.title = META[lang].title;
    const d = $('meta[name="description"]');
    if (d) d.setAttribute("content", META[lang].desc);
    $$(".lang [data-lang]").forEach((b) => {
      const on = b.dataset.lang === lang;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on);
    });
    currentLang = lang;
    if (save) {
      try { localStorage.setItem("hanjonjae-lang", lang); } catch (e) {}
      const u = new URL(location.href);
      if (lang === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang");
      history.replaceState(null, "", u);
    }
    document.dispatchEvent(new CustomEvent("langchange"));
  };
  const switchTo = (lang) => {
    if (lang === currentLang) return;
    const root = document.documentElement;
    root.classList.add("lang-switching");
    setTimeout(() => {
      setLang(lang);
      setTimeout(() => root.classList.toggle("lang-switching", false), 30);
    }, 200);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (b && b.closest(".lang")) { switchTo(b.dataset.lang); return; }
    if (e.target.closest("[data-lang-switch]")) switchTo(currentLang === "en" ? "ko" : "en");
  });
  // 첫 언어: 주소의 ?lang=en > 지난번 선택 > 브라우저 언어
  const initialLang = (() => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q) return q;
    try { const saved = localStorage.getItem("hanjonjae-lang"); if (saved) return saved; } catch (e) {}
    return (navigator.language || "ko").toLowerCase().startsWith("ko") ? "ko" : "en";
  })();
  if (initialLang === "en") setLang("en", { save: false });

  /* 헤더: 히어로를 지나면 한지 바탕으로 */
  const header = $(".header");
  const hero = $(".hero");
  const sideBook = $(".seal");
  const toTop = $(".to-top");
  const onScroll = () => {
    const past = window.scrollY > (hero ? hero.offsetHeight - 90 : 10);
    header.classList.toggle("is-solid", past);
    sideBook && sideBook.classList.toggle("is-show", past);
    toTop && toTop.classList.toggle("is-show", window.scrollY > window.innerHeight * 1.5);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop && toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* 전체 메뉴 */
  const drawer = $(".drawer");
  const openDrawer = (on) => {
    drawer.classList.toggle("is-open", on);
    drawer.setAttribute("aria-hidden", on ? "false" : "true");
    document.body.style.overflow = on ? "hidden" : "";
  };
  $(".menu-btn").addEventListener("click", () => openDrawer(true));
  $(".drawer__close").addEventListener("click", () => openDrawer(false));
  $$(".drawer__nav a").forEach((a) => a.addEventListener("click", () => openDrawer(false)));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 큰 제목만: 줄(<br>)마다 감싸서 시간차로 올라오게 */
  const splitLines = () => {
    $$("main h1, main h2").forEach((h) => {
      if (!h.closest(".reveal") || h.querySelector(".line")) return;
      const parts = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = parts
        .map((t, i) => `<span class="line"><span class="line__in" style="transition-delay:${(0.1 + i * 0.13).toFixed(2)}s">${t.trim()}</span></span>`)
        .join("");
    });
  };
  splitLines();
  document.addEventListener("langchange", splitLines);

  /* 스크롤 등장 (첫 화면 문구는 인트로가 끝난 뒤에) */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal, .reveal-img").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

  /* 첫 화면 장면 전환: 영상 → 가을 전경 → 누마루 → 처마 */
  const slides = $$(".hero__slide");
  const bars = $$(".hero__bars button");
  const numEl = $(".hero__num"), nameEl = $(".hero__name");
  let cur = 0, slideTimer = null;
  const slideLabel = (el) => (currentLang === "en" ? el.dataset.label : el.dataset.labelKo || el.dataset.label) || "";
  const showSlide = (i) => {
    if (!slides.length) return;
    slides[cur].classList.toggle("is-active", false);
    cur = (i + slides.length) % slides.length;
    const s = slides[cur];
    s.classList.add("is-active");
    const dur = Number(s.dataset.dur) || 7000;
    const vid = $("video", s);
    if (vid) { try { vid.currentTime = 0; } catch (e) {} vid.play().catch(() => {}); }
    bars.forEach((b, k) => {
      b.classList.toggle("is-done", k < cur);
      b.classList.toggle("is-run", false);
      b.setAttribute("aria-selected", k === cur);
    });
    if (bars[cur]) {
      bars[cur].style.setProperty("--dur", dur + "ms");
      void bars[cur].offsetWidth; // 진행 막대 처음부터 다시
      bars[cur].classList.add("is-run");
    }
    if (numEl) numEl.textContent = String(cur + 1).padStart(2, "0");
    if (nameEl) {
      nameEl.classList.add("is-swap");
      setTimeout(() => { nameEl.textContent = slideLabel(s); nameEl.classList.toggle("is-swap", false); }, 350);
    }
    clearTimeout(slideTimer);
    slideTimer = setTimeout(() => showSlide(cur + 1), dur);
  };
  bars.forEach((b, k) => b.addEventListener("click", () => showSlide(k)));
  document.addEventListener("langchange", () => { if (nameEl && slides[cur]) nameEl.textContent = slideLabel(slides[cur]); });

  // 첫 화면 2~4번 사진은 페이지가 다 뜬 뒤에 불러와서 첫 로딩을 가볍게
  const loadHeroPhotos = () => {
    $$(".hero__slide img[data-src]").forEach((im) => {
      if (im.dataset.srcset) im.srcset = im.dataset.srcset;
      im.src = im.dataset.src;
      im.removeAttribute("data-src");
    });
  };
  if (document.readyState === "complete") setTimeout(loadHeroPhotos, 800);
  else window.addEventListener("load", () => setTimeout(loadHeroPhotos, 800));
  bars.forEach((b) => b.addEventListener("click", loadHeroPhotos));

  const startHero = () => {
    $$(".hero .reveal").forEach((el) => el.classList.add("is-in"));
    showSlide(0);
  };

  /* 첫 방문 인트로: 로고가 번진 뒤 화면이 위로 걷힘 (같은 방문 중엔 한 번만) */
  const root = document.documentElement;
  const veil = $(".veil");
  if (veil && !root.classList.contains("no-intro")) {
    document.body.classList.add("is-intro");
    let lifted = false, ready = document.readyState === "complete", timeUp = false;
    const lift = () => {
      if (lifted || !ready || !timeUp) return;
      lifted = true;
      veil.classList.add("is-lift");
      document.body.classList.toggle("is-intro", false);
      try { sessionStorage.setItem("hanjonjae-intro", "1"); } catch (e) {}
      setTimeout(startHero, 450);
      setTimeout(() => { veil.style.display = "none"; }, 1400);
    };
    setTimeout(() => { timeUp = true; lift(); }, 2000);
    window.addEventListener("load", () => { ready = true; lift(); });
    setTimeout(() => { ready = true; lift(); }, 4500); // 느린 회선에서도 최대 4.5초
  } else {
    startHero();
  }

  /* 슬라이더: 버튼 · 드래그 · 진행바 */
  $$(".slider").forEach((slider) => {
    const track = $(".slider__track", slider);
    const cards = $$(".card", track);
    const count = $(".slider__count", slider.parentElement);
    const bar = $(".slider__bar i", slider);
    const step = () => cards[0].getBoundingClientRect().width + 28;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      const vis = track.clientWidth / track.scrollWidth;
      if (bar) { bar.style.width = vis * 100 + "%"; bar.style.left = ratio * (1 - vis) * 100 + "%"; }
      const idx = track.scrollLeft >= max - 2 ? cards.length : Math.min(cards.length, Math.round(track.scrollLeft / step()) + 1);
      if (count) count.textContent = String(idx).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // 화살표: 스냅을 잠시 끄고 직접 애니메이션 (브라우저마다 smooth 스크롤 + 스냅 동작이 달라서)
    const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let anim = null;
    const goTo = (i) => {
      const max = track.scrollWidth - track.clientWidth;
      i = Math.max(0, Math.min(cards.length - 1, i));
      const to = Math.max(0, Math.min(max, cards[i].offsetLeft - pad()));
      const from = track.scrollLeft;
      if (Math.abs(to - from) < 2) return;
      cancelAnimationFrame(anim);
      track.style.scrollSnapType = "none";
      const t0 = performance.now(), D = 650;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / D);
        track.scrollLeft = from + (to - from) * ease(t);
        if (t < 1) anim = requestAnimationFrame(tick);
        else { track.style.scrollSnapType = ""; update(); }
      };
      anim = requestAnimationFrame(tick);
    };
    const prevBtn = $('[data-dir="-1"]', slider.parentElement);
    const nextBtn = $('[data-dir="1"]', slider.parentElement);
    const syncBtns = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 2;
    };
    track.addEventListener("scroll", syncBtns, { passive: true });
    window.addEventListener("resize", syncBtns);
    syncBtns();
    // 지금 위치 기준 바로 앞/뒤 카드로 (끝에서 뒤로 가도 한 칸씩)
    prevBtn && prevBtn.addEventListener("click", () => {
      const x = track.scrollLeft;
      let i = -1;
      cards.forEach((c, k) => { if (c.offsetLeft - pad() < x - 2) i = k; });
      goTo(Math.max(0, i));
    });
    nextBtn && nextBtn.addEventListener("click", () => {
      const x = track.scrollLeft;
      const i = cards.findIndex((c) => c.offsetLeft - pad() > x + 2);
      goTo(i === -1 ? cards.length - 1 : i);
    });
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add("is-drag"); }
      track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      setTimeout(() => track.classList.remove("is-drag"), 0);
    });
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  /* 공간 상세: 사진 여러 장 갤러리 + 설명 */
  const modal = $(".modal");
  if (modal) {
    const photo = $(".modal__photo", modal), mBody = $(".modal__content", modal);
    const thumbs = $(".modal__thumbs", modal), countEl = $(".modal__count", modal);
    let list = [], at = 0;
    const show = (i) => {
      at = (i + list.length) % list.length;
      photo.classList.add("is-fade");
      const pre = new Image();
      pre.onload = pre.onerror = () => { photo.src = list[at]; photo.classList.toggle("is-fade", false); };
      pre.src = list[at];
      countEl.textContent = `${at + 1} / ${list.length}`;
      $$("button", thumbs).forEach((b, k) => b.classList.toggle("is-on", k === at));
    };
    let opener = null;
    const close = () => {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.toggle("is-open", false);
      document.body.style.overflow = "";
      if (opener) opener.focus({ preventScroll: true }); // 키보드 사용자: 누른 카드로 돌아가기
    };
    $$("[data-detail]").forEach((btn) =>
      btn.addEventListener("click", () => {
        opener = btn;
        const tpl = document.getElementById(btn.dataset.detail);
        if (!tpl) return;
        const key = tpl.dataset.gallery, n = Number(tpl.dataset.count) || 1;
        list = Array.from({ length: n }, (_, k) => `assets/img/gallery/${key}-${k + 1}.jpg`);
        thumbs.innerHTML = list
          .map((src, k) => `<button type="button" aria-label="${k + 1}"><img src="${src.replace(".jpg", "-t.jpg")}" alt=""></button>`)
          .join("");
        $$("button", thumbs).forEach((b, k) => b.addEventListener("click", () => show(k)));
        mBody.innerHTML = tpl.innerHTML;
        photo.alt = (mBody.querySelector("h3") || {}).textContent || "";
        show(0);
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
        setTimeout(() => $(".modal__close", modal).focus({ preventScroll: true }), 50);
      })
    );
    $(".modal__prev", modal).addEventListener("click", () => show(at - 1));
    $(".modal__next", modal).addEventListener("click", () => show(at + 1));
    $(".modal__close", modal).addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { close(); openDrawer(false); }
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "ArrowRight") show(at + 1);
      if (e.key === "ArrowLeft") show(at - 1);
    });
    // 휴대폰: 좌우로 밀어서 넘기기
    const stage = $(".modal__stage", modal);
    let tx = null;
    stage.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      tx = null;
      if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
    });
  }

  /* 장면 전환: 메뉴·링크로 섹션을 옮길 때 한지 막이 덮었다가 걷힘 */
  const wipe = $(".wipe");
  let wiping = false;
  const turnTo = (hash) => {
    const target = hash === "#top" ? document.body : document.querySelector(hash);
    if (!target || !wipe || reduceMotion || wiping) return false;
    wiping = true;
    wipe.classList.toggle("is-leave", false);
    wipe.classList.add("is-cover");
    setTimeout(() => {
      const y = hash === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
      const u = new URL(location.href); u.hash = hash === "#top" ? "" : hash;
      history.replaceState(null, "", u);
      wipe.classList.add("is-leave");
      wipe.classList.toggle("is-cover", false);
      setTimeout(() => { wipe.classList.toggle("is-leave", false); wiping = false; }, 560);
    }, 430);
    return true;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute("href");
    if (!h || h.length < 2) return;
    if (turnTo(h)) { e.preventDefault(); openDrawer(false); }
  });

  /* 한존재 소식: assets/data/news.json(블로그 최신 글)을 카드로 */
  const newsBox = $("[data-news]");
  if (newsBox) {
    const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    fetch("assets/data/news.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        const posts = (data.posts || []).slice(0, 6);
        if (!posts.length) return;
        newsBox.innerHTML = posts
          .map((p) => `
          <a class="post" href="${esc(p.link)}" target="_blank" rel="noopener">
            <div class="post__img">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}</div>
            <p class="post__meta">${esc(p.category)} · ${esc(p.date)}</p>
            <h3 class="post__title">${esc(p.title)}</h3>
            <p class="post__excerpt">${esc(p.excerpt)}</p>
          </a>`)
          .join("");
        newsBox.closest(".journal").classList.toggle("is-empty", false);
      })
      .catch(() => {}); // 파일이 없거나 열 수 없으면 섹션을 숨긴 채로 둠
  }

  /* 히어로 영상: 움직임 줄이기 설정이면 정지 */
  const v = $(".hero video");
  if (v) {
    // <source media>를 지원하지 않는 브라우저에서도 데스크톱엔 고화질 영상을 쓰도록
    const wide = window.matchMedia("(min-width: 821px)").matches;
    v.addEventListener("loadedmetadata", () => {
      if (wide && v.currentSrc.includes("hero_m.mp4")) { v.src = v.currentSrc.replace("hero_m.mp4", "hero.mp4"); v.play().catch(() => {}); }
    }, { once: true });
  }
})();
