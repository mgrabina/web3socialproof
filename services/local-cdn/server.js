// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Define the directory to serve static files from
const distDir = path.join(__dirname, '../../packages/pixel/dist');

// Serve static files from the 'packages/pixel/dist' directory
app.use('/static', express.static(distDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('script.min.js')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));


// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Print all files served
  console.log('Files served:');
  console.log('------------');

  // Recursively read all files in the dist directory
  const getFiles = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively read files in subdirectories
        getFiles(fullPath);
      } else {
        // Log the file URL
        const relativePath = path.relative(distDir, fullPath);
        console.log(`http://localhost:${PORT}/static/${relativePath}`);
      }
    });
  };

  getFiles(distDir);
});
