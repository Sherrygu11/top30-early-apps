(function () {
  "use strict";

  const RANK_KEYS = ["highestEarly", "lowestEarly", "biggestAdvantage", "biggestDecline"];
  const state = { lang: "zh", view: "chart", data: null, rankKey: "highestEarly" };
  const tips = {};
  let tipSeq = 0;

  const $ = (id) => document.getElementById(id);
  const t = (k) => UI_STRINGS[state.lang][k];
  const locale = () => (state.lang === "en" ? "en-US" : "zh-CN");
  const sname = (o) => (state.lang === "en" ? o.nameEn : o.name);
  const pct = (v) => (v == null ? "—" : v.toFixed(1) + "%");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 按容器实际宽度绘制 SVG，这样手机上文字也保持清晰可读（容器隐藏时回退到 640）
  function chartWidth(id) {
    const w = $(id).clientWidth;
    return w > 0 ? Math.max(300, Math.round(w)) : 640;
  }

  function niceStep(x) {
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    const f = x / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }

  function niceScale(max, ticks, integer) {
    let step = niceStep(Math.max(max, 1e-9) / ticks);
    if (integer) step = Math.max(1, Math.round(step));
    const top = Math.ceil(max / step) * step || step;
    const list = [];
    for (let v = 0; v <= top + 1e-9; v += step) list.push(Math.round(v * 100) / 100);
    return { top, ticks: list };
  }

  /* ---------------- 悬浮提示 ---------------- */
  function regTip(tip) {
    const key = "t" + tipSeq++;
    tips[key] = tip;
    return key;
  }

  function buildTip(tip) {
    const box = $("tip");
    box.replaceChildren();
    const title = document.createElement("div");
    title.className = "tip-title";
    title.textContent = tip.title;
    box.appendChild(title);
    tip.rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "tip-row";
      if (r.series) {
        const key = document.createElement("span");
        key.className = "tip-key";
        key.style.background = `var(--viz-${r.series})`;
        row.appendChild(key);
      }
      const val = document.createElement("span");
      val.className = "tip-value";
      val.textContent = r.value;
      row.appendChild(val);
      if (r.name) {
        const name = document.createElement("span");
        name.className = "tip-name";
        name.textContent = r.name;
        row.appendChild(name);
      }
      box.appendChild(row);
    });
  }

  function placeTip(x, y) {
    const box = $("tip");
    box.hidden = false;
    const r = box.getBoundingClientRect();
    let left = x + 14;
    let top = y + 14;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - 14;
    box.style.left = Math.max(8, left) + "px";
    box.style.top = Math.max(8, top) + "px";
  }

  function hideTip() {
    $("tip").hidden = true;
  }

  function bindTips() {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest && e.target.closest("[data-tip]");
      if (!el || !tips[el.dataset.tip]) return hideTip();
      buildTip(tips[el.dataset.tip]);
      placeTip(e.clientX, e.clientY);
    });
    document.addEventListener("focusin", (e) => {
      const el = e.target.closest && e.target.closest("[data-tip]");
      if (!el || !tips[el.dataset.tip]) return;
      const r = el.getBoundingClientRect();
      buildTip(tips[el.dataset.tip]);
      placeTip(r.left + r.width / 2, r.top);
    });
    document.addEventListener("focusout", hideTip);
    document.addEventListener("pointerleave", hideTip);
    window.addEventListener("scroll", hideTip, { passive: true });
  }

  /* ---------------- 通用小组件 ---------------- */
  function barRows(items, opts) {
    const max = Math.max(...items.map((i) => i.w), 1e-9);
    const cls = opts && opts.ranked ? "bar-rows" : "bar-rows no-rank";
    return `<div class="${cls}">${items
      .map((it, idx) => {
        const width = Math.max((it.w / max) * 82, 0.5);
        return `<div class="bar-row" tabindex="0" data-tip="${it.tip}">${
          opts && opts.ranked ? `<span class="bar-no">${idx + 1}</span>` : ""
        }<span class="bar-label" title="${esc(it.label)}">${esc(it.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div><span class="bar-value">${esc(it.value)}</span></div></div>`;
      })
      .join("")}</div>`;
  }

  function tableHtml(headers, rows, numericCols) {
    const num = new Set(numericCols || []);
    return `<div class="table-scroll"><table class="mini-table"><thead><tr>${headers
      .map((h, i) => `<th class="${num.has(i) ? "num" : ""}">${esc(h)}</th>`)
      .join("")}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c, i) => `<td class="${num.has(i) ? "num" : ""}">${esc(c)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table></div>`;
  }

  /* ---------------- 指标卡 ---------------- */
  function renderKpis() {
    const d = state.data;
    const first = d.trend[0];
    const last = d.trend[d.trend.length - 1];
    let trendSub = "";
    if (first && last && first.avgEarlyRate != null && last.avgEarlyRate != null && first.year !== last.year) {
      const delta = last.avgEarlyRate - first.avgEarlyRate;
      const text = `${delta < 0 ? "▼" : delta > 0 ? "▲" : "―"} ${Math.abs(delta).toFixed(1)}pt`;
      trendSub = t("stKpiTrendSub")(first.year, text);
    }
    const share = d.totals.schools ? Math.round((d.totals.binding / d.totals.schools) * 100) : 0;
    const tile = (label, value, sub) =>
      `<div class="kpi"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(value)}</div><div class="kpi-sub">${esc(sub)}</div></div>`;
    $("kpiRow").innerHTML =
      tile(t("stKpiSchools"), d.totals.schools, t("stKpiSchoolsSub")(d.totals.withEarly)) +
      tile(t("stKpiAvgEarly"), pct(d.totals.avgEarlyRate), trendSub) +
      tile(t("stKpiBinding"), d.totals.binding, t("stKpiBindingSub")(share)) +
      tile(t("stKpiComments"), d.comments.total, t("stKpiCommentsSub")(d.comments.last7));
  }

  /* ---------------- 早申类型分布 ---------------- */
  function renderType() {
    const d = state.data;
    const total = d.totals.schools || 1;
    const items = d.typeBreakdown.map((i) => {
      const label = t("stType" + i.key);
      const share = Math.round((i.count / total) * 100);
      return {
        label,
        w: i.count,
        value: `${i.count}`,
        tip: regTip({ title: label, rows: [{ value: `${i.count} ${t("stUnitSchools")}`, name: `${share}%` }] }),
        share,
        count: i.count,
      };
    });
    $("typeChart").innerHTML = barRows(items, { ranked: false });
    $("typeTable").innerHTML = tableHtml(
      [t("stColType"), t("stColCount"), t("stColShare")],
      items.map((i) => [i.label, i.count, i.share + "%"]),
      [1, 2]
    );
  }

  /* ---------------- 近三年趋势（折线图）---------------- */
  function renderTrend() {
    const d = state.data;
    const trend = d.trend;
    const series = [
      { id: "s1", name: t("stSeriesEarly"), field: "avgEarlyRate" },
      { id: "s2", name: t("stSeriesRegular"), field: "avgRegularRate" },
    ];
    const n = trend.length;
    if (!n) {
      $("trendChart").innerHTML = `<div class="empty">${esc(t("stNone"))}</div>`;
      $("trendTable").innerHTML = "";
      return;
    }

    const W = chartWidth("trendChart"), H = 280;
    const m = { l: 42, r: 112, t: 14, b: 30 };
    const pw = W - m.l - m.r;
    const ph = H - m.t - m.b;
    const maxVal = Math.max(...trend.flatMap((p) => series.map((s) => p[s.field] || 0)));
    const scale = niceScale(maxVal, 4, false);
    const x = (i) => (n === 1 ? m.l + pw / 2 : m.l + (i * pw) / (n - 1));
    const y = (v) => m.t + ph - (v / scale.top) * ph;
    const band = n === 1 ? pw : pw / (n - 1);

    let svg = `<svg class="svg-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("stTrendTitle"))}">`;
    scale.ticks.forEach((tv) => {
      svg += `<line class="${tv === 0 ? "axis-line" : "grid-line"}" x1="${m.l}" x2="${m.l + pw}" y1="${y(tv)}" y2="${y(tv)}"/>`;
      svg += `<text class="axis-label" x="${m.l - 8}" y="${y(tv) + 4}" text-anchor="end">${tv}%</text>`;
    });
    trend.forEach((p, i) => {
      svg += `<text class="axis-label" x="${x(i)}" y="${H - 8}" text-anchor="middle">${p.year}</text>`;
    });

    series.forEach((s) => {
      const pts = trend.map((p, i) => (p[s.field] == null ? null : [x(i), y(p[s.field])])).filter(Boolean);
      if (!pts.length) return;
      svg += `<path d="M${pts.map((p) => p.join(",")).join("L")}" fill="none" stroke="var(--viz-${s.id})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      pts.forEach((p) => {
        svg += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--viz-${s.id})" stroke="var(--viz-surface)" stroke-width="2"/>`;
      });
      const lastP = trend[n - 1];
      if (lastP[s.field] != null) {
        svg += `<text class="end-label" x="${x(n - 1) + 12}" y="${y(lastP[s.field]) + 4}">${esc(s.name)} ${lastP[s.field].toFixed(1)}%</text>`;
      }
    });

    trend.forEach((p, i) => {
      const key = regTip({
        title: `${p.year}`,
        rows: series.map((s) => ({ series: s.id, value: pct(p[s.field]), name: s.name })),
      });
      const bx = Math.max(m.l, x(i) - band / 2);
      const bw = Math.min(band, m.l + pw - bx);
      svg += `<g class="hit" tabindex="0" data-tip="${key}" role="img" aria-label="${p.year}: ${series.map((s) => `${s.name} ${pct(p[s.field])}`).join(", ")}"><rect class="col-bg" x="${bx}" y="${m.t}" width="${bw}" height="${ph}"/><line class="xhair" x1="${x(i)}" x2="${x(i)}" y1="${m.t}" y2="${m.t + ph}"/></g>`;
    });
    svg += "</svg>";

    const legend = `<div class="legend">${series
      .map((s) => `<span><i style="background:var(--viz-${s.id})"></i>${esc(s.name)}</span>`)
      .join("")}</div>`;
    $("trendChart").innerHTML = legend + svg;
    $("trendTable").innerHTML = tableHtml(
      [t("stColYear"), t("stSeriesEarly"), t("stSeriesRegular"), t("stColSchoolsCounted")],
      trend.map((p) => [p.year, pct(p.avgEarlyRate), pct(p.avgRegularRate), p.earlySchools]),
      [1, 2, 3]
    );
  }

  /* ---------------- 排行榜 ---------------- */
  function rankValueText(key, v) {
    if (key === "biggestAdvantage") return v.toFixed(2) + "×";
    if (key === "biggestDecline") return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}pt`;
    return pct(v);
  }

  function renderRankTabs() {
    $("rankTabs").innerHTML = RANK_KEYS.map(
      (k) => `<button role="tab" data-key="${k}" aria-selected="${k === state.rankKey}" class="${k === state.rankKey ? "active" : ""}">${esc(t("stRankTab_" + k))}</button>`
    ).join("");
    $("rankDesc").textContent = t("stRankDesc_" + state.rankKey);
  }

  function renderRank() {
    renderRankTabs();
    const key = state.rankKey;
    const list = (state.data.rankings && state.data.rankings[key]) || [];
    if (!list.length) {
      $("rankChart").innerHTML = `<div class="empty">${esc(t("stNone"))}</div>`;
      $("rankTable").innerHTML = "";
      return;
    }
    const items = list.map((r) => {
      const rows = [
        { value: pct(r.earlyRate), name: t("stSeriesEarly") },
        { value: pct(r.regularRate), name: t("stSeriesRegular") },
      ];
      if (key === "biggestDecline") rows.unshift({ value: `${pct(r.fromRate)} → ${pct(r.toRate)}`, name: `${r.fromYear}–${r.toYear}` });
      return {
        label: sname(r),
        w: Math.abs(r.value),
        value: rankValueText(key, r.value),
        tip: regTip({ title: sname(r), rows }),
      };
    });
    $("rankChart").innerHTML = barRows(items, { ranked: true });
    $("rankTable").innerHTML = tableHtml(
      [t("stColRank"), t("stColSchool"), t("stColValue"), t("stColEarly"), t("stColRegular")],
      list.map((r, i) => [i + 1, sname(r), rankValueText(key, r.value), pct(r.earlyRate), pct(r.regularRate)]),
      [0, 2, 3, 4]
    );
  }

  /* ---------------- 留言活跃度 ---------------- */
  function renderComments() {
    const c = state.data.comments;
    if (!c.total) {
      const empty = `<div class="empty"><div class="empty-title">${esc(t("stCommEmpty"))}</div><p>${esc(t("stCommEmptyHint"))}</p><a class="btn" href="index.html">${esc(t("stCommGo"))}</a></div>`;
      $("commChart").innerHTML = empty;
      $("commTable").innerHTML = empty;
      return;
    }

    const daily = c.daily;
    const n = daily.length;
    const W = chartWidth("commChart"), H = 210;
    const m = { l: 34, r: 8, t: 16, b: 26 };
    const pw = W - m.l - m.r;
    const ph = H - m.t - m.b;
    const maxCount = Math.max(...daily.map((d) => d.count));
    const scale = niceScale(Math.max(maxCount, 4), 4, true);
    const slot = pw / n;
    const bw = Math.min(14, slot - 4);
    const y = (v) => m.t + ph - (v / scale.top) * ph;
    const fmtDay = (iso) => iso.slice(5);

    let svg = `<svg class="svg-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("stCommTitle"))}">`;
    scale.ticks.forEach((tv) => {
      svg += `<line class="${tv === 0 ? "axis-line" : "grid-line"}" x1="${m.l}" x2="${m.l + pw}" y1="${y(tv)}" y2="${y(tv)}"/>`;
      svg += `<text class="axis-label" x="${m.l - 8}" y="${y(tv) + 4}" text-anchor="end">${tv}</text>`;
    });
    [0, Math.floor((n - 1) / 2), n - 1].forEach((i, idx) => {
      const cx = m.l + i * slot + slot / 2;
      svg += `<text class="axis-label" x="${cx}" y="${H - 8}" text-anchor="${idx === 0 ? "start" : idx === 2 ? "end" : "middle"}">${fmtDay(daily[i].date)}</text>`;
    });

    let labelled = false;
    daily.forEach((d, i) => {
      const cx = m.l + i * slot + slot / 2;
      const bx = cx - bw / 2;
      const key = regTip({ title: d.date, rows: [{ value: `${d.count} ${t("stUnitComments")}` }] });
      let shape = "";
      if (d.count > 0) {
        const top = y(d.count);
        const h = m.t + ph - top;
        const r = Math.min(4, h);
        shape = `<path class="col" fill="var(--viz-s1)" d="M${bx},${top + h}L${bx},${top + r}Q${bx},${top} ${bx + r},${top}L${bx + bw - r},${top}Q${bx + bw},${top} ${bx + bw},${top + r}L${bx + bw},${top + h}Z"/>`;
        if (!labelled && d.count === maxCount) {
          labelled = true;
          shape += `<text class="val-label" x="${cx}" y="${top - 5}" text-anchor="middle">${d.count}</text>`;
        }
      }
      svg += `<g class="hit" tabindex="0" data-tip="${key}" role="img" aria-label="${d.date}: ${d.count}"><rect class="col-bg" x="${m.l + i * slot}" y="${m.t}" width="${slot}" height="${ph}"/>${shape}</g>`;
    });
    svg += "</svg>";

    const hotItems = c.mostDiscussed.map((h) => ({
      label: sname(h),
      w: h.count,
      value: `${h.count}`,
      tip: regTip({ title: sname(h), rows: [{ value: `${h.count} ${t("stUnitComments")}` }] }),
    }));
    const hot = hotItems.length
      ? `<h3 class="chart-sub-title">${esc(t("stCommHot"))}</h3>${barRows(hotItems, { ranked: true })}`
      : "";
    $("commChart").innerHTML = svg + hot;

    const dayRows = daily.filter((d) => d.count > 0).map((d) => [d.date, d.count]);
    $("commTable").innerHTML =
      tableHtml([t("stColDate"), t("stColComments")], dayRows.length ? dayRows : [["—", 0]], [1]) +
      (c.mostDiscussed.length
        ? `<h3 class="chart-sub-title">${esc(t("stCommHot"))}</h3>` +
          tableHtml([t("stColSchool"), t("stColComments")], c.mostDiscussed.map((h) => [sname(h), h.count]), [1])
        : "");
  }

  /* ---------------- 整页渲染 ---------------- */
  function renderAll() {
    if (!state.data) return;
    Object.keys(tips).forEach((k) => delete tips[k]);
    tipSeq = 0;
    hideTip();
    renderKpis();
    renderType();
    renderTrend();
    renderRank();
    renderComments();
    $("updatedAt").textContent = t("stUpdated")(new Date(state.data.generatedAt).toLocaleString(locale()));
  }

  async function load() {
    const body = $("statsBody");
    body.classList.add("is-loading");
    $("statsError").hidden = true;
    try {
      const r = await fetch("/api/stats", { cache: "no-store" });
      if (!r.ok) throw new Error("bad status " + r.status);
      state.data = await r.json();
      renderAll();
    } catch (e) {
      if (!state.data) $("statsError").hidden = false;
    } finally {
      body.classList.remove("is-loading");
    }
  }

  /* ---------------- 语言 / 主题 / 视图 ---------------- */
  function applyStaticI18n() {
    document.title = t("stPageTitle");
    document.documentElement.setAttribute("lang", state.lang === "en" ? "en" : "zh-CN");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    $("themeToggle").setAttribute("title", t("themeToggleTitle"));
    $("langToggle").textContent = t("langToggleLabel");
    $("langToggle").setAttribute("title", t("langToggleTitle"));
    $("footerText").innerHTML = t("footerHtml")(new Date().getFullYear());
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("siteTheme"); } catch (e) {}
    document.documentElement.setAttribute("data-theme", saved === "light" ? "light" : "dark");
    updateThemeIcon();
  }

  function updateThemeIcon() {
    $("themeToggle").textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("siteTheme", next); } catch (e) {}
    updateThemeIcon();
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
    renderAll();
  }

  function setView(view) {
    state.view = view;
    $("statsRoot").classList.toggle("show-table", view === "table");
    document.querySelectorAll(".view-toggle button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    hideTip();
    if (view === "chart") renderAll();
  }

  let resizeTimer;
  let lastWidth = window.innerWidth;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        renderAll();
      }
    }, 150);
  }

  function init() {
    initTheme();
    initLang();
    bindTips();
    window.addEventListener("resize", onResize);
    $("themeToggle").addEventListener("click", toggleTheme);
    $("langToggle").addEventListener("click", toggleLang);
    $("refreshBtn").addEventListener("click", load);
    $("retryBtn").addEventListener("click", load);
    document.querySelectorAll(".view-toggle button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
    $("rankTabs").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-key]");
      if (!btn) return;
      state.rankKey = btn.dataset.key;
      if (state.data) {
        Object.keys(tips).forEach((k) => delete tips[k]);
        tipSeq = 0;
        renderType();
        renderTrend();
        renderRank();
        renderComments();
      }
    });
    load();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
