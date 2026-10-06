// 把 data.js 里的 30 所学校数据写入（或更新）到 MongoDB 的 schools 集合
// 用法：npm run seed
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { MongoClient } = require("mongodb");

async function main() {
  const code = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
  const { SCHOOL_DATA } = vm.runInNewContext(code + "\n({ SCHOOL_DATA });");

  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db();
  const schools = db.collection("schools");

  await schools.createIndex({ nameEn: 1 }, { unique: true });
  await schools.createIndex({ rank: 1 });
  await db.collection("comments").createIndex({ school: 1, createdAt: -1 });
  await db.collection("comments").createIndex({ ipHash: 1, createdAt: -1 });

  const ops = SCHOOL_DATA.map((s) => ({
    replaceOne: { filter: { nameEn: s.nameEn }, replacement: s, upsert: true },
  }));
  const result = await schools.bulkWrite(ops);
  console.log(`Seeded schools. upserted=${result.upsertedCount} modified=${result.modifiedCount} total=${await schools.countDocuments()}`);
  await client.close();
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
