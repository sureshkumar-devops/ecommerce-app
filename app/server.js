const express = require("express");
const path = require("path");
const fs = require("fs");
const client = require("prom-client");

const app = express();

// ✅ Default system metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// ===============================
// ✅ CUSTOM METRICS
// ===============================

// Request Counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Latency Histogram (NEW 🔥)
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});

// ===============================
// ✅ MIDDLEWARE
// ===============================
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    // Count requests
    httpRequestCounter
      .labels(req.method, req.path, res.statusCode)
      .inc();

    // Record latency
    httpRequestDuration
      .labels(req.method, req.path, res.statusCode)
      .observe(duration);
  });

  next();
});

// ===============================
// ✅ METRICS ENDPOINT
// ===============================
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// ===============================
// ✅ STATIC + ROUTES
// ===============================
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

     // Pull the secrets injected by the Vault Plugin
    const dbUser = process.env.DB_USER || "User missing in Env";
    const dbPass = process.env.DB_PASS || "Pass missing in Env";

    const env = process.env.DEPLOY_ENV || "development";
    const branch = process.env.GIT_BRANCH || "master";
    const tag = process.env.TAG || "v1.0.0";

    const modifiedHtml = data
      .replace(/\${DEPLOY_ENV}/g, env)
      .replace(/\${GIT_BRANCH}/g, branch)
      .replace(/\${TAG}/g, tag)
      .replace(/\${DB_USER}/g, dbUser)
      .replace(/\${DB_PASS}/g, dbPass);

    res.send(modifiedHtml);
  });
});

// ===============================
// ✅ START SERVER
// ===============================
app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("Metrics available at /metrics");
});
