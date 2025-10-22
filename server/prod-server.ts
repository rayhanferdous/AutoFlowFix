// Production server with no Vite dependencies
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initializeDatabase } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced logger for production
function log(message: string, source = "express", level: "info" | "error" | "warn" = "info") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✅";
  console[level === "error" ? "error" : "log"](`${formattedTime} ${prefix} [${source}] ${message}`);
}

// Validate environment variables
function validateEnvironment() {
  const required = [
    "NODE_ENV",
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "SESSION_SECRET"
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Validate environment
    validateEnvironment();
    log("Environment variables validated", "startup");

    // Initialize database first
    const dbConnected = await initializeDatabase();
    if (!dbConnected) {
      throw new Error("Failed to initialize database connection");
    }
    log("Database connection established", "startup");

    // Register routes
    const server = await registerRoutes(app);
    log("Routes registered successfully", "startup");

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`, "error", "error");
      res.status(status).json({ message });
    });

    // Serve static files in production
    const distPath = path.resolve(__dirname, "public");
    if (!fs.existsSync(distPath)) {
      throw new Error(`Static files directory not found: ${distPath}`);
    }
    app.use(express.static(distPath));
    log(`Serving static files from ${distPath}`, "startup");

    // Catch-all route for SPA
    app.use("*", (_req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        log("index.html not found", "startup", "error");
        return res.status(500).send("Application not properly built");
      }
      res.sendFile(indexPath);
    });

    // Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server listening on port ${port}`, "startup");
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      log(`Uncaught Exception: ${error.message}`, "process", "error");
      console.error(error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "process", "error");
      console.error(reason);
      process.exit(1);
    });

  } catch (error) {
    log(`Startup Error: ${error instanceof Error ? error.message : 'Unknown error'}`, "startup", "error");
    console.error(error);
    process.exit(1);
  }
})();