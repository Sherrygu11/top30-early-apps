// 本地开发服务器：提供网页文件，并在本机运行 /api 下的接口（连接 .env.local 里的数据库）
// 用法：npm run dev   然后访问 http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const STATIC_FILES = new Set(["index.html", "stats.html", "styles.css", "stats.css", "script.js", "stats.js", "data.js", "i18n.js"]);
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8" };

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5);
    const file = path.join(ROOT, "api", name + ".js");
    if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(file)) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Not found" }));
    }
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (obj) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(obj));
      return res;
    };
    req.query = Object.fromEntries(url.searchParams);
    if (req.method === "POST") req.body = await readBody(req);
    try {
      delete require.cache[require.resolve(file)];
      await require(file)(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Server error" }));
    }
    return;
  }

  const name = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  if (!STATIC_FILES.has(name)) {
    res.statusCode = 404;
    return res.end("Not found");
  }
  res.setHeader("Content-Type", MIME[path.extname(name)] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  res.end(fs.readFileSync(path.join(ROOT, name)));
});

server.listen(PORT, () => console.log(`Dev server running at http://localhost:${PORT}`));
