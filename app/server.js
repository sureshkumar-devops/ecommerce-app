const express = require("express");
const path = require("path");
const fs = require("fs"); // Import file system module
const app = express();

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }
    // Replace the placeholder with the environment variable
    const version = process.env.APP_VERSION || "1.0.0";
    const modifiedHtml = data.replace("{{VERSION}}", version);
    res.send(modifiedHtml);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
