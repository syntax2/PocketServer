import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { addLog } from '@/lib/logger';
import mime from 'mime-types'; // Using mime-types to determine content type

// Define the root directory for static files (relative to the project root)
const STATIC_ROOT = path.join(process.cwd(), 'public', 'static'); // Serving from public/static

// Ensure the static directory exists
async function ensureStaticDirExists() {
  try {
    await fs.mkdir(STATIC_ROOT, { recursive: true });
    // Create a placeholder index.html if it doesn't exist
    const indexPath = path.join(STATIC_ROOT, 'index.html');
    if (!existsSync(indexPath)) {
      await fs.writeFile(indexPath, `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PocketServer Static</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to PocketServer!</h1>
    <p>This is a static HTML file served by the server.</p>
    <p>You can place your static files (HTML, CSS, JS, images) in the <code>public/static</code> directory.</p>
    <script src="script.js"></script>
</body>
</html>
      `);
    }
    // Create a placeholder style.css if it doesn't exist
    const cssPath = path.join(STATIC_ROOT, 'style.css');
     if (!existsSync(cssPath)) {
        await fs.writeFile(cssPath, `
body {
    font-family: sans-serif;
    line-height: 1.6;
    padding: 20px;
    background-color: #f4f4f4;
    color: #333;
}
h1 {
    color: #008080; /* Teal */
}
        `);
     }
    // Create a placeholder script.js if it doesn't exist
    const jsPath = path.join(STATIC_ROOT, 'script.js');
     if (!existsSync(jsPath)) {
        await fs.writeFile(jsPath, `
console.log('PocketServer static script loaded!');
        `);
     }
  } catch (error) {
    console.error("Failed to ensure static directory exists:", error);
    // If we can't create the dir, the server likely can't serve files.
    // Depending on requirements, you might want to throw or handle this.
  }
}

// Call this once when the module loads
ensureStaticDirExists();


export async function GET(
  request: NextRequest,
  { params }: { params: { filePath?: string[] } }
) {
  const requestedPath = params.filePath?.join('/') || 'index.html'; // Default to index.html if no path specified
  const method = request.method;
  const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`; // Log the accessed API path

  // Prevent directory traversal attacks
  if (requestedPath.includes('..')) {
    addLog({ method, path: urlPath, status: 400, message: 'Bad Request: Invalid path' });
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const absoluteFilePath = path.join(STATIC_ROOT, requestedPath);

  try {
    // Check if it's a directory first
    const stats = await fs.stat(absoluteFilePath);
    let finalPath = absoluteFilePath;
    let isDirectory = stats.isDirectory();

    if (isDirectory) {
      // If it's a directory, look for an index.html inside it
      finalPath = path.join(absoluteFilePath, 'index.html');
       try {
         await fs.access(finalPath); // Check if index.html exists in the dir
       } catch {
         // If no index.html, deny directory listing
          addLog({ method, path: urlPath, status: 403, message: 'Forbidden: Directory listing not allowed' });
          return NextResponse.json({ error: 'Directory listing not allowed' }, { status: 403 });
       }
    }

    // Read the file content
    const fileContent = await fs.readFile(finalPath);

    // Determine the content type based on the file extension
    const contentType = mime.lookup(finalPath) || 'application/octet-stream'; // Default if type unknown

    addLog({ method, path: urlPath, status: 200, message: `Served: ${requestedPath}` });
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
      },
    });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      addLog({ method, path: urlPath, status: 404, message: `Not Found: ${requestedPath}` });
      // Try serving index.html from the root if the specific file wasn't found
      const rootIndexPath = path.join(STATIC_ROOT, 'index.html');
      try {
        const rootIndexContent = await fs.readFile(rootIndexPath);
        addLog({ method, path: urlPath, status: 200, message: `Served fallback: index.html` });
        return new NextResponse(rootIndexContent, {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (indexError) {
         return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

    } else if (error.code === 'EISDIR') {
       // This case is now handled above by checking for index.html inside directories
       addLog({ method, path: urlPath, status: 403, message: 'Forbidden: Directory listing not allowed' });
       return NextResponse.json({ error: 'Directory listing not allowed' }, { status: 403 });
    }
    else {
      console.error(`Server Error processing ${method} ${urlPath}:`, error);
      addLog({ method, path: urlPath, status: 500, message: 'Internal Server Error' });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}

// Optional: Handle other methods if needed, returning 405 Method Not Allowed
export async function POST(request: NextRequest, { params }: { params: { filePath?: string[] } }) {
    const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
    addLog({ method: request.method, path: urlPath, status: 405, message: 'Method Not Allowed'});
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function PUT(request: NextRequest, { params }: { params: { filePath?: string[] } }) {
    const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
    addLog({ method: request.method, path: urlPath, status: 405, message: 'Method Not Allowed'});
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
export async function DELETE(request: NextRequest, { params }: { params: { filePath?: string[] } }) {
    const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
    addLog({ method: request.method, path: urlPath, status: 405, message: 'Method Not Allowed'});
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
// etc. for other methods
