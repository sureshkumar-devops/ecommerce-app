const express = require("express");
const path = require("path");
const fs = require("fs");
const client = require('prom-client'); // ✅ 1. Import Prometheus client

const app = express();

// ✅ 2. Initialize default metrics collection (CPU, Memory, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// ✅ 3. Create the /metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Add a counter for all requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware to count every request
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});


app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }
    // Replace placeholders with environment variables
    const version = process.env.APP_VERSION || "1.0.0";
    const env = process.env.DEPLOY_ENV || "development";
    const branch = process.env.GIT_BRANCH || "main";
    const tag = process.env.TAG || "v1.0.0";

    let modifiedHtml = data
      .replace("${DEPLOY_ENV}", env)
      .replace("${GIT_BRANCH}", branch)
      .replace("${TAG}", tag);

    res.send(modifiedHtml);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("Metrics available at /metrics");
});

