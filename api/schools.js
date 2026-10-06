const { getDb } = require("../lib/db");

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
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json(schools);
  } catch (err) {
    console.error("schools GET failed:", err.message);
    return res.status(500).json({ error: "Database unavailable" });
  }
};
