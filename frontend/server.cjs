const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const distPath = path.join(__dirname, "dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  let requestPath = decodeURIComponent(req.url.split("?")[0]);

  if (requestPath === "/") {
    requestPath = "/index.html";
  }

  let filePath = path.join(distPath, requestPath);

  // Prevent path traversal
  if (!filePath.startsWith(distPath)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // SPA fallback: React Router routes should load index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distPath, "index.html");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("File error:", err);
      res.writeHead(500);
      res.end("Internal Server Error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control":
        filePath.endsWith("index.html")
          ? "no-cache"
          : "public, max-age=31536000, immutable",
    });

    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`AutoBillr frontend running on http://${HOST}:${PORT}`);
});
