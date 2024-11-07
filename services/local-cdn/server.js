const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const distDir = path.join(__dirname, "../../packages/pixel/dist");

// Serve static files from the dist directory with no-cache headers
app.use("/static", express.static(distDir, {
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
}));

const files = [];

const getFiles = (dirPath) => {
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    if (fs.statSync(fullPath).isDirectory()) {
      // Recursively read files in subdirectories
      getFiles(fullPath);
    } else {
      // Add the file URL to the list
      const relativePath = path.relative(distDir, fullPath);
      files.push(`/static/${relativePath}`);
    }
  });
};

getFiles(distDir);

// Generate an index page with relative paths and no-cache headers
try {
  app.get("/", (req, res) => {
    // Set cache control headers for the index page
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Index of Files</title>
        </head>
        <body>
          <h1>Index of Files</h1>
          <ul>
            ${files
              .map((file) => `<li><a href="${file}">${file}</a></li>`)
              .join("")}
          </ul>
        </body>
      </html>
    `;

    res.send(htmlContent);
  });
} catch (error) {
  console.log(error);
}

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);

  // Print all files served
  console.log("Files served:");
  console.log("------------");

  files.forEach((file) => {
    console.log(file);
  });
});
