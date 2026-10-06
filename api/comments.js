const crypto = require("crypto");
const { getDb } = require("../lib/db");

const MAX_MESSAGE = 500;
const MAX_NICKNAME = 30;
const MAX_PER_HOUR = 5;

function clientHash(req) {
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim() || "unknown";
  return crypto.createHash("sha256").update(ip + "|top30-early-apps").digest("hex").slice(0, 32);
}

module.exports = async (req, res) => {
  try {
    const db = await getDb();
    const comments = db.collection("comments");

    if (req.method === "GET") {
      const school = String(req.query.school || "").slice(0, 100);
      if (!school) return res.status(400).json({ error: "school is required" });
      const items = await comments
        .find({ school }, { projection: { _id: 0, school: 1, nickname: 1, message: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const school = String(body.school || "").trim().slice(0, 100);
      const nickname = String(body.nickname || "").trim().slice(0, MAX_NICKNAME);
      const message = String(body.message || "").trim();

      if (!school || !message) return res.status(400).json({ error: "school and message are required" });
      if (message.length > MAX_MESSAGE) return res.status(400).json({ error: "message too long" });

      const exists = await db.collection("schools").countDocuments({ nameEn: school }, { limit: 1 });
      if (!exists) return res.status(400).json({ error: "unknown school" });

      const ipHash = clientHash(req);
      const since = new Date(Date.now() - 60 * 60 * 1000);
      const recent = await comments.countDocuments({ ipHash, createdAt: { $gte: since } });
      if (recent >= MAX_PER_HOUR) return res.status(429).json({ error: "too many comments, try later" });

      const doc = { school, nickname: nickname || "Anonymous", message, ipHash, createdAt: new Date() };
      await comments.insertOne(doc);
      return res.status(201).json({ school: doc.school, nickname: doc.nickname, message: doc.message, createdAt: doc.createdAt });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("comments failed:", err.message);
    return res.status(500).json({ error: "Database unavailable" });
  }
};
