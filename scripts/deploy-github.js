const fs = require('fs');
const path = require('path');

// Create a GitHub specific deployment

// 1. Create a CNAME file if you have a custom domain
// fs.writeFileSync(path.join(__dirname, '../dist/CNAME'), 'yourdomain.com');

// 2. Create a .nojekyll file to tell GitHub Pages not to use Jekyll
fs.writeFileSync(path.join(__dirname, '../dist/.nojekyll'), '');

// 3. Create a simple 404.html file that redirects to index.html
const notFoundHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found | Galbi Creator</title>
  <script>
    // Redirect to homepage
    window.location.href = '/';
  </script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #6e4aff, #47a0ff);
      color: white;
    }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; margin-bottom: 2rem; }
    a {
      text-decoration: none;
      color: white;
      background: rgba(255,255,255,0.2);
      padding: 10px 20px;
      border-radius: 5px;
      transition: background 0.3s;
    }
    a:hover { background: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <h1>Page Not Found</h1>
  <p>The page you were looking for doesn't exist.</p>
  <a href="/">Go to Homepage</a>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../dist/404.html'), notFoundHTML);

console.log('GitHub Pages deployment files created successfully!');