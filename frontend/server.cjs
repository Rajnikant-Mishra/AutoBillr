const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const distPath = path.resolve(__dirname, "dist");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

const server = http.createServer((req, res) => {
  try {
    let requestPath = decodeURIComponent(
      req.url.split("?")[0]
    );

    if (requestPath === "/") {
      requestPath = "/index.html";
    }

    let filePath = path.resolve(
      distPath,
      "." + requestPath
    );

    // Prevent path traversal
    if (
      filePath !== distPath &&
      !filePath.startsWith(distPath + path.sep)
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    // React Router / SPA fallback
    if (
      !fs.existsSync(filePath) ||
      fs.statSync(filePath).isDirectory()
    ) {
      filePath = path.join(distPath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("File error:", err);

        res.writeHead(500, {
          "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("Internal Server Error");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();

      const contentType =
        mimeTypes[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": filePath.endsWith("index.html")
          ? "no-cache"
          : "public, max-age=31536000, immutable"
      });

      res.end(data);
    });
  } catch (error) {
    console.error("Server error:", error);

    res.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(
    `AutoBillr frontend running on http://${HOST}:${PORT}`
  );
});
