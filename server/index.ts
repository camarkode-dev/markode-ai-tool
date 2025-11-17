// server/index.ts
import express, { type Express, type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import session, { type SessionOptions } from "express-session";
import passport from "./passport.js"; // استيراد passport مع استراتيجيات Google
import { registerRoutes } from "./routes.js";
import { RedisStore } from "connect-redis";
import { redis } from "./redis.js"; // Upstash Redis REST client

// ====================
// __dirname fix for ESM
// ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================
// App & Port
// ====================
const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

// ====================
// Redis Store
// ====================
// ⚠️ connect-redis لا يعرف Upstash REST type، لذلك نستخدم `as any`
const store = new RedisStore({
  client: redis as any,
  prefix: "sess:",
});

// ====================
// Middleware
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sessionOptions: SessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 يوم
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// ====================
// Serve SPA (Client)
// ====================
// بعد البناء، ملفات العميل موجودة في dist/server/public
const clientDistPath = path.resolve(__dirname, "public");
app.use(express.static(clientDistPath));

// ====================
// Routes
// ====================
await registerRoutes(app);

// ====================
// SPA Catch-All Route
// ====================
app.use((req: Request, res: Response) => {
  const indexFile = path.join(clientDistPath, "index.html");
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send("index.html not found. Did you build the client?");
  }
});

// ====================
// Start Server
// ====================
try {
  await redis.get("test"); // اختبار الاتصال بالـ Redis
  console.log("✅ Redis is ready and responsive");

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} catch (err) {
  console.error("❌ Cannot start server, Redis not reachable:", err);
  process.exit(1);
}

// ====================
// Handle graceful shutdown
// ====================
process.on("SIGINT", () => {
  console.log("🧹 Exiting server... (No Redis connection to close for REST client)");
  process.exit(0);
});
