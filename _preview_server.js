const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "/Users/clays/Documents/cloude_v1/sovi";
const TYPES = { ".html":"text/html", ".js":"text/javascript", ".svg":"image/svg+xml", ".css":"text/css", ".xml":"application/xml", ".txt":"text/plain" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "Content-Type": (TYPES[path.extname(file)] || "application/octet-stream") + "; charset=utf-8" });
    res.end(data);
  });
}).listen(3134, () => console.log("sovi preview on http://localhost:3134"));
