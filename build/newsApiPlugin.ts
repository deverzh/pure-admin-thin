import type { PluginOption } from "vite";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { join, extname } from "node:path";

export interface NewsApiPluginOptions {
  newsDir: string;
}

export function newsApiPlugin(options: NewsApiPluginOptions): PluginOption {
  const { newsDir } = options;

  const ensureDir = () => {
    if (!existsSync(newsDir)) {
      mkdirSync(newsDir, { recursive: true });
    }
  };

  const listFiles = () => {
    ensureDir();
    const files = readdirSync(newsDir)
      .filter(f => extname(f).toLowerCase() === ".html")
      .map(f => {
        const fullPath = join(newsDir, f);
        const stat = statSync(fullPath);
        const content = readFileSync(fullPath, "utf-8");
        const titleMatch =
          content.match(/<title[^>]*>([^<]*)<\/title>/i) ||
          content.match(/<h1[^>]*>([^<]*)<\/h1>/i);
        return {
          name: f,
          title: titleMatch ? titleMatch[1].trim() : f.replace(/\.html$/i, ""),
          updatedAt: stat.mtimeMs,
          size: stat.size
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return files;
  };

  const readFile = (name: string) => {
    ensureDir();
    const safeName = name.replace(/[\\/]/g, "");
    const fullPath = join(newsDir, safeName);
    if (!existsSync(fullPath)) return null;
    return readFileSync(fullPath, "utf-8");
  };

  const saveFile = (name: string, content: string) => {
    ensureDir();
    const safeName = name.replace(/[\\/]/g, "");
    const fullPath = join(newsDir, safeName);
    writeFileSync(fullPath, content, "utf-8");
    return { name: safeName };
  };

  const deleteFile = (name: string) => {
    ensureDir();
    const safeName = name.replace(/[\\/]/g, "");
    const fullPath = join(newsDir, safeName);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      return true;
    }
    return false;
  };

  const readBody = (req: any): Promise<any> =>
    new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk: Buffer) => (data += chunk.toString()));
      req.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });

  const handle = async (req: any, res: any, next: any) => {
    const url = req.url || "";
    if (!url.startsWith("/api/news")) return next();

    try {
      if (url.startsWith("/api/news/list") && req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, data: listFiles() }));
        return;
      }
      if (url.startsWith("/api/news/read") && req.method === "POST") {
        const body = await readBody(req);
        const content = readFile(body.name);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, data: content }));
        return;
      }
      if (url.startsWith("/api/news/save") && req.method === "POST") {
        const body = await readBody(req);
        const result = saveFile(body.name, body.content || "");
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, data: result }));
        return;
      }
      if (url.startsWith("/api/news/delete") && req.method === "POST") {
        const body = await readBody(req);
        const ok = deleteFile(body.name);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: ok }));
        return;
      }
      next();
    } catch (e: any) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: e.message }));
    }
  };

  return {
    name: "news-api-plugin",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    }
  };
}
