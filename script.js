(function () {
  "use strict";

  const state = {
    query: "",
    typeFilter: "ALL",
    view: "card", // 'card' | 'table'
    sortKey: "rank",
    sortDir: 1,
    lang: "zh", // 'zh' | 'en'
  };

  const els = {
    grid: document.getElementById("cardGrid"),
    tableWrap: document.getElementById("tableWrap"),
    tableBody: document.getElementById("tableBody"),
    resultCount: document.getElementById("resultCount"),
    search: document.getElementById("searchInput"),
    chips: document.querySelectorAll(".chip"),
    viewBtns: document.querySelectorAll(".view-toggle button"),
    themeToggle: document.getElementById("themeToggle"),
    langToggle: document.getElementById("langToggle"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalBody: document.getElementById("modalBody"),
    modalClose: document.getElementById("modalClose"),
    statTotal: document.getElementById("statTotal"),
    statAvgEarly: document.getElementById("statAvgEarly"),
    statBinding: document.getElementById("statBinding"),
    statNoEarly: document.getElementById("statNoEarly"),
    footerText: document.getElementById("footerText"),
  };

  // 取当前语言下的界面文案 / get a UI string in the current language
  function t(key) {
    return UI_STRINGS[state.lang][key];
  }

  // 取某校在当前语言下的动态字段（英文缺失时回退中文）
  function loc(s, field) {
    if (state.lang === "en" && s.en && s.en[field] != null) return s.en[field];
    return s[field];
  }

  function typeLabel(type) {
    return TYPE_META[type].label[state.lang];
  }

  function fmtPct(v) {
    return v == null ? "—" : v.toFixed(1) + "%";
  }

  function getFiltered() {
    const q = state.query.trim().toLowerCase();
    return SCHOOL_DATA.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.en && s.en.location && s.en.location.toLowerCase().includes(q));
      const matchesType =
        state.typeFilter === "ALL" ||
        (state.typeFilter === "ED" && (s.type === "ED" || s.type === "ED2")) ||
        state.typeFilter === s.type;
      return matchesQuery && matchesType;
    });
  }

  function getSorted(list) {
    const key = state.sortKey;
    const dir = state.sortDir;
    return [...list].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (av == null) av = dir === 1 ? Infinity : -Infinity;
      if (bv == null) bv = dir === 1 ? Infinity : -Infinity;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }

  function renderStats() {
    const total = SCHOOL_DATA.length;
    const withEarly = SCHOOL_DATA.filter((s) => s.earlyRate != null);
    const avgEarly =
      withEarly.reduce((sum, s) => sum + s.earlyRate, 0) / withEarly.length;
    const bindingCount = SCHOOL_DATA.filter((s) => s.binding).length;
    const noEarlyCount = SCHOOL_DATA.filter((s) => s.type === "NONE").length;

    els.statTotal.textContent = total;
    els.statAvgEarly.textContent = avgEarly.toFixed(1) + "%";
    els.statBinding.textContent = bindingCount;
    els.statNoEarly.textContent = noEarlyCount;
  }

  // 取某校近三年趋势所依据的字段：优先早申录取率，无早申计划则退回常规录取率
  function getTrendKey(s) {
    return s.earlyRate != null ? "earlyRate" : "regularRate";
  }

  function renderTrendMini(s) {
    if (!s.history || s.history.length === 0) return "";
    const key = getTrendKey(s);
    const values = s.history.map((h) => h[key]);
    const max = Math.max(...values, 1);
    const delta = values[values.length - 1] - values[0];
    const dir = delta < -0.05 ? "down" : delta > 0.05 ? "up" : "flat";
    const arrow = dir === "down" ? "▼" : dir === "up" ? "▲" : "―";
    const bars = s.history
      .map((h) => `<span class="trend-bar" style="height:${Math.max((h[key] / max) * 100, 6)}%" title="${h.year}: ${h[key].toFixed(1)}%"></span>`)
      .join("");
    return `
      <div class="trend-row">
        <span class="rate-label">${key === "earlyRate" ? t("cardTrendEarly") : t("cardTrendRegular")}</span>
        <span class="trend-bars">${bars}</span>
        <span class="trend-delta trend-${dir}">${arrow} ${Math.abs(delta).toFixed(1)}pt</span>
      </div>
    `;
  }

  function renderCard(s) {
    const hasEarly = s.earlyRate != null;
    const maxRate = Math.max(s.earlyRate || 0, s.regularRate || 0, 1);
    const primaryName = state.lang === "en" ? s.nameEn : s.name;
    const secondaryName = state.lang === "en" ? s.name : s.nameEn;

    return `
      <article class="school-card" data-id="${s.rank}" tabindex="0">
        <div class="card-top">
          <div class="rank-badge">#${s.rank}</div>
          <div class="card-title">
            <div class="zh">${primaryName}</div>
            <div class="en">${secondaryName}</div>
          </div>
          <span class="type-badge ${TYPE_META[s.type].className}">${typeLabel(s.type)}</span>
        </div>
        <div class="card-loc">📍 ${loc(s, "location")}</div>
        <div class="rate-block">
          <div class="rate-row">
            <span class="rate-label">${t("cardRateEarly")}</span>
            <div class="rate-bar-track"><div class="rate-bar-fill" style="width:${hasEarly ? (s.earlyRate / maxRate) * 100 : 0}%"></div></div>
            <span class="rate-val">${fmtPct(s.earlyRate)}</span>
          </div>
          <div class="rate-row">
            <span class="rate-label">${t("cardRateRegular")}</span>
            <div class="rate-bar-track"><div class="rate-bar-fill regular" style="width:${(s.regularRate / maxRate) * 100}%"></div></div>
            <span class="rate-val">${fmtPct(s.regularRate)}</span>
          </div>
        </div>
        ${renderTrendMini(s)}
        <div class="card-meta">
          <span>${t("cardDeadlinePrefix")} <b>${loc(s, "deadline")}</b></span>
          <span>${t("cardDecisionPrefix")} <b>${loc(s, "decision")}</b></span>
        </div>
      </article>
    `;
  }

  function renderRow(s) {
    const primaryName = state.lang === "en" ? s.nameEn : s.name;
    const secondaryName = state.lang === "en" ? s.name : s.nameEn;
    return `
      <tr data-id="${s.rank}">
        <td>#${s.rank}</td>
        <td class="name-cell">${primaryName}<span class="en">${secondaryName}</span></td>
        <td><span class="type-badge ${TYPE_META[s.type].className}">${typeLabel(s.type)}</span></td>
        <td>${loc(s, "deadline")}</td>
        <td>${loc(s, "decision")}</td>
        <td>${fmtPct(s.earlyRate)}</td>
        <td>${fmtPct(s.regularRate)}</td>
        <td>${fmtPct(s.overallRate)}</td>
      </tr>
    `;
  }

  function render() {
    const filtered = getSorted(getFiltered());
    els.resultCount.innerHTML = t("resultCountHtml")(SCHOOL_DATA.length, filtered.length);

    if (filtered.length === 0) {
      const emptyHtml = `<div class="empty-state">${t("emptyStateHtml")}</div>`;
      els.grid.innerHTML = emptyHtml;
      els.tableBody.innerHTML = `<tr><td colspan="8">${emptyHtml}</td></tr>`;
    } else {
      els.grid.innerHTML = filtered.map(renderCard).join("");
      els.tableBody.innerHTML = filtered.map(renderRow).join("");
    }

    document.querySelectorAll(".school-card, tr[data-id]").forEach((el) => {
      el.addEventListener("click", () => openModal(Number(el.dataset.id)));
    });
  }

  function renderHistoryTable(s) {
    if (!s.history || s.history.length === 0) return "";
    const rows = s.history
      .map(
        (h) => `
          <tr>
            <td>${h.year}</td>
            <td>${fmtPct(h.earlyRate)}</td>
            <td>${fmtPct(h.regularRate)}</td>
          </tr>`
      )
      .join("");
    return `
      <div class="modal-section-title">${t("modalHistoryTitle")}</div>
      <table class="history-table">
        <thead><tr><th>${t("modalHistoryYear")}</th><th>${t("modalHistoryEarly")}</th><th>${t("modalHistoryRegular")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function openModal(rank) {
    const s = SCHOOL_DATA.find((x) => x.rank === rank);
    if (!s) return;
    const primaryName = state.lang === "en" ? s.nameEn : s.name;
    const secondaryName = state.lang === "en" ? s.name : s.nameEn;
    els.modalBody.innerHTML = `
      <span class="type-badge ${TYPE_META[s.type].className}">${typeLabel(s.type)}</span>
      <h2>#${s.rank} ${primaryName}</h2>
      <div class="modal-en">${secondaryName} · ${loc(s, "location")}</div>
      <div class="modal-grid">
        <div class="modal-field"><div class="f-label">${t("modalDeadlineLabel")}</div><div class="f-val">${loc(s, "deadline")}</div></div>
        <div class="modal-field"><div class="f-label">${t("modalDecisionLabel")}</div><div class="f-val">${loc(s, "decision")}</div></div>
        <div class="modal-field"><div class="f-label">${t("modalEarlyRateLabel")}</div><div class="f-val">${fmtPct(s.earlyRate)}</div></div>
        <div class="modal-field"><div class="f-label">${t("modalRegularRateLabel")}</div><div class="f-val">${fmtPct(s.regularRate)}</div></div>
        <div class="modal-field"><div class="f-label">${t("modalOverallRateLabel")}</div><div class="f-val">${fmtPct(s.overallRate)}</div></div>
        <div class="modal-field"><div class="f-label">${t("modalTuitionLabel")}</div><div class="f-val">${loc(s, "tuition")}</div></div>
      </div>
      ${renderHistoryTable(s)}
      <div class="modal-notes">💡 ${loc(s, "notes")}</div>
      <div class="comments">
        <div class="modal-section-title">${t("commentsTitle")}</div>
        <div class="comment-list" id="commentList">${t("commentsLoading")}</div>
        <form class="comment-form" id="commentForm">
          <input type="text" id="commentNickname" maxlength="30" placeholder="${t("commentNickname")}" />
          <textarea id="commentMessage" maxlength="500" rows="3" required placeholder="${t("commentPlaceholder")}"></textarea>
          <button type="submit" id="commentSubmit">${t("commentSubmit")}</button>
          <div class="comment-status" id="commentStatus"></div>
        </form>
      </div>
    `;
    els.modalOverlay.classList.add("open");
    initComments(s);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderCommentList(items) {
    const box = document.getElementById("commentList");
    if (!box) return;
    if (!items.length) {
      box.textContent = t("commentsEmpty");
      return;
    }
    const locale = state.lang === "en" ? "en-US" : "zh-CN";
    box.innerHTML = items
      .map((c) => {
        const name = c.nickname === "Anonymous" ? t("commentAnonymous") : c.nickname;
        const date = new Date(c.createdAt).toLocaleDateString(locale);
        return `<div class="comment-item"><div class="comment-meta"><b>${escapeHtml(name)}</b> · ${date}</div><div class="comment-body">${escapeHtml(c.message)}</div></div>`;
      })
      .join("");
  }

  async function initComments(s) {
    const school = s.nameEn;
    const listBox = document.getElementById("commentList");
    const form = document.getElementById("commentForm");
    const status = document.getElementById("commentStatus");

    async function load() {
      try {
        const r = await fetch(`/api/comments?school=${encodeURIComponent(school)}`);
        if (!r.ok) throw new Error("bad status");
        renderCommentList(await r.json());
      } catch (e) {
        if (listBox) listBox.textContent = t("commentsUnavailable");
        if (form) form.style.display = "none";
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("commentSubmit");
      const msgEl = document.getElementById("commentMessage");
      btn.disabled = true;
      btn.textContent = t("commentSending");
      status.textContent = "";
      try {
        const r = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            school,
            nickname: document.getElementById("commentNickname").value,
            message: msgEl.value,
          }),
        });
        if (r.status === 429) status.textContent = t("commentRateLimit");
        else if (!r.ok) status.textContent = t("commentError");
        else {
          msgEl.value = "";
          await load();
        }
      } catch (err) {
        status.textContent = t("commentError");
      } finally {
        btn.disabled = false;
        btn.textContent = t("commentSubmit");
      }
    });

    load();
  }

  // 优先使用数据库中的学校数据；接口不可用时继续使用内置的 data.js 数据
  async function loadSchoolsFromApi() {
    try {
      const r = await fetch("/api/schools");
      if (!r.ok) return;
      const remote = await r.json();
      if (!Array.isArray(remote) || remote.length === 0) return;
      SCHOOL_DATA.splice(0, SCHOOL_DATA.length, ...remote);
      renderStats();
      render();
    } catch (e) {
      /* 保持内置数据 */
    }
  }

  function closeModal() {
    els.modalOverlay.classList.remove("open");
  }

  function setView(view) {
    state.view = view;
    els.viewBtns.forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    els.grid.style.display = view === "card" ? "grid" : "none";
    els.tableWrap.style.display = view === "table" ? "block" : "none";
  }

  function initTheme() {
    // 默认使用浅色主题，不跟随系统深色模式，避免首次打开就显示很暗的背景
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    els.themeToggle.textContent = isDark ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    updateThemeIcon();
  }

  function applyStaticI18n() {
    document.title = t("pageTitle");
    document.documentElement.setAttribute("lang", state.lang === "en" ? "en" : "zh-CN");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });

    els.themeToggle.setAttribute("title", t("themeToggleTitle"));
    els.langToggle.textContent = t("langToggleLabel");
    els.langToggle.setAttribute("title", t("langToggleTitle"));
    els.footerText.innerHTML = t("footerHtml")(new Date().getFullYear());
  }

  function initLang() {
    let saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) {}
    state.lang = saved === "en" ? "en" : "zh";
    applyStaticI18n();
  }

  function toggleLang() {
    state.lang = state.lang === "en" ? "zh" : "en";
    try { localStorage.setItem("lang", state.lang); } catch (e) {}
    applyStaticI18n();
    renderStats();
    render();
  }

  function bindEvents() {
    els.search.addEventListener("input", (e) => {
      state.query = e.target.value;
      render();
    });

    els.chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        els.chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.typeFilter = chip.dataset.type;
        render();
      });
    });

    els.viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });

    document.querySelectorAll("th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (state.sortKey === key) {
          state.sortDir *= -1;
        } else {
          state.sortKey = key;
          state.sortDir = 1;
        }
        document.querySelectorAll("th[data-sort] .arrow").forEach((a) => (a.textContent = ""));
        th.querySelector(".arrow").textContent = state.sortDir === 1 ? "▲" : "▼";
        render();
      });
    });

    els.themeToggle.addEventListener("click", toggleTheme);
    els.langToggle.addEventListener("click", toggleLang);
    els.modalClose.addEventListener("click", closeModal);
    els.modalOverlay.addEventListener("click", (e) => {
      if (e.target === els.modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function init() {
    initTheme();
    initLang();
    bindEvents();
    renderStats();
    setView("card");
    render();
    loadSchoolsFromApi();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
