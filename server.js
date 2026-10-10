const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

// In-memory sample data. Data resets whenever the server restarts.
let nextId = 5;
let items = [
  { id: 1, name: "Wireless Mouse", category: "Accessories", quantity: 24, price: 19.99 },
  { id: 2, name: "USB-C Hub", category: "Accessories", quantity: 8, price: 34.50 },
  { id: 3, name: "Laptop Stand", category: "Office", quantity: 3, price: 27.00 },
  { id: 4, name: "Mechanical Keyboard", category: "Accessories", quantity: 12, price: 59.99 }
];

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function validateItem(input) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const quantity = Number(input.quantity);
  const price = Number(input.price);
  if (!name) return "Name is required.";
  if (!category) return "Category is required.";
  if (!Number.isInteger(quantity) || quantity < 0) return "Quantity must be a non-negative whole number.";
  if (!Number.isFinite(price) || price < 0) return "Price must be a non-negative number.";
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  // API routes
  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/health" && req.method === "GET") {
      return sendJson(res, 200, { success: true, message: "InventoryHub API is running." });
    }

    if (pathname === "/api/items" && req.method === "GET") {
      const q = (url.searchParams.get("q") || "").toLowerCase().trim();
      const filtered = q
        ? items.filter(item => `${item.name} ${item.category}`.toLowerCase().includes(q))
        : items;
      return sendJson(res, 200, {
        success: true,
        data: filtered,
        meta: { count: filtered.length }
      });
    }

    if (pathname === "/api/items" && req.method === "POST") {
      try {
        const input = await readJson(req);
        const error = validateItem(input);
        if (error) return sendJson(res, 400, { success: false, error });
        const item = {
          id: nextId++,
          name: input.name.trim(),
          category: input.category.trim(),
          quantity: Number(input.quantity),
          price: Number(input.price)
        };
        items.push(item);
        return sendJson(res, 201, { success: true, data: item });
      } catch (error) {
        return sendJson(res, 400, { success: false, error: error.message });
      }
    }

    const itemMatch = pathname.match(/^\/api\/items\/(\d+)$/);
    if (itemMatch && req.method === "DELETE") {
      const id = Number(itemMatch[1]);
      const originalLength = items.length;
      items = items.filter(item => item.id !== id);
      if (items.length === originalLength) {
        return sendJson(res, 404, { success: false, error: "Item not found." });
      }
      return sendJson(res, 200, { success: true, data: { id } });
    }

    return sendJson(res, 404, { success: false, error: "API route not found." });
  }

  // Static files
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(PUBLIC_DIR, "." + requestedPath);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, "index.html")) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "public, max-age=300"
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`InventoryHub is running at http://localhost:${PORT}`);
});
