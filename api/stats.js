const { getDb } = require("../lib/db");

const TOP_N = 10;
const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const db = await getDb();
    const schools = await db
      .collection("schools")
      .find({}, { projection: { _id: 0 } })
      .sort({ rank: 1 })
      .toArray();
    const comments = db.collection("comments");

    const base = (s) => ({ rank: s.rank, name: s.name, nameEn: s.nameEn, type: s.type, earlyRate: s.earlyRate, regularRate: s.regularRate });
    const withEarly = schools.filter((s) => s.earlyRate != null);

    // ---- 概览数字 ----
    const totals = {
      schools: schools.length,
      withEarly: withEarly.length,
      binding: schools.filter((s) => s.binding).length,
      noEarly: schools.filter((s) => s.type === "NONE").length,
      avgEarlyRate: withEarly.length ? round1(avg(withEarly.map((s) => s.earlyRate))) : null,
      avgRegularRate: schools.length ? round1(avg(schools.map((s) => s.regularRate))) : null,
    };

    // ---- 早申类型分布（ED 与 ED1/ED2 合并为 ED）----
    const typeCounts = { ED: 0, EA: 0, REA: 0, NONE: 0 };
    for (const s of schools) {
      const key = s.type === "ED" || s.type === "ED2" ? "ED" : s.type;
      if (key in typeCounts) typeCounts[key] += 1;
    }
    const typeBreakdown = Object.entries(typeCounts).map(([key, count]) => ({ key, count }));

    // ---- 逐年平均录取率趋势 ----
    const years = [...new Set(schools.flatMap((s) => (s.history || []).map((h) => h.year)))].sort((a, b) => a - b);
    const trend = years.map((year) => {
      const rows = schools.map((s) => (s.history || []).find((h) => h.year === year)).filter(Boolean);
      const early = rows.filter((h) => h.earlyRate != null).map((h) => h.earlyRate);
      const regular = rows.filter((h) => h.regularRate != null).map((h) => h.regularRate);
      return {
        year,
        avgEarlyRate: early.length ? round1(avg(early)) : null,
        avgRegularRate: regular.length ? round1(avg(regular)) : null,
        earlySchools: early.length,
        regularSchools: regular.length,
      };
    });

    // ---- 排行榜 ----
    const highestEarly = [...withEarly]
      .sort((a, b) => b.earlyRate - a.earlyRate)
      .slice(0, TOP_N)
      .map((s) => ({ ...base(s), value: s.earlyRate }));
    const lowestEarly = [...withEarly]
      .sort((a, b) => a.earlyRate - b.earlyRate)
      .slice(0, TOP_N)
      .map((s) => ({ ...base(s), value: s.earlyRate }));
    const biggestAdvantage = withEarly
      .filter((s) => s.regularRate > 0)
      .map((s) => ({ ...base(s), value: round2(s.earlyRate / s.regularRate) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_N);
    const biggestDecline = withEarly
      .map((s) => {
        const h = (s.history || []).filter((x) => x.earlyRate != null).sort((a, b) => a.year - b.year);
        if (h.length < 2) return null;
        const first = h[0];
        const last = h[h.length - 1];
        return { ...base(s), value: round1(last.earlyRate - first.earlyRate), fromYear: first.year, toYear: last.year, fromRate: first.earlyRate, toRate: last.earlyRate };
      })
      .filter(Boolean)
      .sort((a, b) => a.value - b.value)
      .slice(0, TOP_N);

    // ---- 留言统计（用 MongoDB 聚合）----
    const now = new Date();
    const start30 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29));
    const start7 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));

    const [total, last7, dailyRaw, hotRaw] = await Promise.all([
      comments.countDocuments({}),
      comments.countDocuments({ createdAt: { $gte: start7 } }),
      comments
        .aggregate([
          { $match: { createdAt: { $gte: start30 } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        ])
        .toArray(),
      comments.aggregate([{ $group: { _id: "$school", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 5 }]).toArray(),
    ]);

    const perDay = new Map(dailyRaw.map((d) => [d._id, d.count]));
    const daily = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.UTC(start30.getUTCFullYear(), start30.getUTCMonth(), start30.getUTCDate() + i));
      const key = dayKey(d);
      daily.push({ date: key, count: perDay.get(key) || 0 });
    }

    const byEn = new Map(schools.map((s) => [s.nameEn, s]));
    const mostDiscussed = hotRaw.map((h) => {
      const s = byEn.get(h._id);
      return { school: h._id, name: s ? s.name : h._id, nameEn: h._id, count: h.count };
    });

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({
      generatedAt: now.toISOString(),
      totals,
      typeBreakdown,
      trend,
      rankings: { highestEarly, lowestEarly, biggestAdvantage, biggestDecline },
      comments: { total, last7, daily, mostDiscussed },
    });
  } catch (err) {
    console.error("stats GET failed:", err.message);
    return res.status(500).json({ error: "Database unavailable" });
  }
};
