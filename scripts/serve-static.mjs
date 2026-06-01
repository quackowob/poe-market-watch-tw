import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.join(process.cwd(), "out");
const port = Number(process.env.PORT || 3000);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"]
]);

function resolvePath(url = "/") {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const candidate = path.normalize(path.join(root, pathname));
  if (!candidate.startsWith(root)) return undefined;
  if (existsSync(candidate) && !candidate.endsWith(path.sep)) return candidate;
  return path.join(candidate, "index.html");
}

const server = createServer(async (request, response) => {
  const filePath = resolvePath(request.url);
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");

    response.writeHead(200, {
      "content-length": fileStat.size,
      "content-type": contentTypes.get(path.extname(filePath)) || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving static export from ${root} on http://localhost:${port}`);
});
