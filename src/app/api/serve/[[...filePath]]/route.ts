
import { type NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { addLog } from '@/lib/logger';
import mime from 'mime-types'; // Using mime-types to determine content type

// Define the root directory for static files (relative to the project root)
const STATIC_ROOT = path.join(process.cwd(), 'public', 'static'); // Serving from public/static

// Ensure the static directory exists (No changes needed here, keeping existing logic)
async function ensureStaticDirExists() {
  try {
    await fs.mkdir(STATIC_ROOT, { recursive: true });
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
    <p><a href="/api/serve/another.html">Try another page</a></p>
    <script src="script.js"></script>
</body>
</html>
      `);
    }
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
code {
    background-color: #e0e0e0;
    padding: 2px 5px;
    border-radius: 3px;
}
a {
    color: #005050; /* Darker Teal */
}
        `);
     }
    const jsPath = path.join(STATIC_ROOT, 'script.js');
     if (!existsSync(jsPath)) {
        await fs.writeFile(jsPath, `
console.log('PocketServer static script loaded!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Static page DOM fully loaded and parsed');
});
        `);
     }
     const anotherPath = path.join(STATIC_ROOT, 'another.html');
      if (!existsSync(anotherPath)) {
          await fs.writeFile(anotherPath, `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Another Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Another Static Page</h1>
    <p>This demonstrates serving a different HTML file.</p>
    <p><a href="/api/serve/index.html">Back to Home</a></p>
    <script src="script.js"></script>
</body>
</html>
          `);
      }
  } catch (error) {
    console.error("Failed to ensure static directory exists:", error);
  }
}

// Call this once when the module loads
ensureStaticDirExists();

// Helper to extract relevant headers for logging
function getLoggableHeaders(headers: Headers): Record<string, string> {
    const loggable: Record<string, string> = {};
    const commonHeaders = ['host', 'user-agent', 'content-type', 'accept', 'referer'];
    for (const key of commonHeaders) {
        if (headers.has(key)) {
            loggable[key] = headers.get(key)!;
        }
    }
    return loggable;
}

// Helper to safely parse request body
async function parseRequestBody(request: NextRequest): Promise<{ body?: any; error?: string }> {
    const contentType = request.headers.get('content-type')?.split(';')[0];
    try {
        if (contentType === 'application/json') {
            const body = await request.json();
            return { body };
        } else if (contentType === 'application/x-www-form-urlencoded' || contentType === 'text/plain') {
            const body = await request.text();
            // Limit logged body size
             const truncatedBody = body.length > 200 ? body.substring(0, 200) + '...' : body;
             return { body: truncatedBody };
        } else if (request.body) {
             // Attempt to read as text for other types, but handle potential binary data
             try {
               const body = await request.text();
               const truncatedBody = body.length > 200 ? body.substring(0, 200) + '...' : body;
               return { body: `(Non-JSON/Text Body, truncated): ${truncatedBody}` };
             } catch {
               return { body: '(Binary or Unreadable Body)' };
             }
        } else {
            return { body: '(No Body)' };
        }
    } catch (e: any) {
        console.error("Error parsing request body:", e);
        return { error: `Failed to parse body: ${e.message}` };
    }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { filePath?: string[] } }
) {
  const requestedPath = params.filePath?.join('/') || 'index.html'; // Default to index.html
  const method = request.method;
  const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
  const headers = getLoggableHeaders(request.headers);

  // Prevent directory traversal attacks
  if (requestedPath.includes('..')) {
    addLog({ method, path: urlPath, status: 400, message: 'Bad Request: Invalid path', headers });
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
          addLog({ method, path: urlPath, status: 403, message: 'Forbidden: Directory listing not allowed', headers });
          return NextResponse.json({ error: 'Directory listing not allowed' }, { status: 403 });
       }
    }

    // Read the file content
    const fileContent = await fs.readFile(finalPath);

    // Determine the content type based on the file extension
    const contentType = mime.lookup(finalPath) || 'application/octet-stream'; // Default if type unknown

    addLog({ method, path: urlPath, status: 200, message: `Served: ${requestedPath}`, headers });
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
      },
    });

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      addLog({ method, path: urlPath, status: 404, message: `Not Found: ${requestedPath}`, headers });
      // Try serving index.html from the root if the specific file wasn't found
      const rootIndexPath = path.join(STATIC_ROOT, 'index.html');
      try {
        const rootIndexContent = await fs.readFile(rootIndexPath);
        addLog({ method, path: urlPath, status: 200, message: `Served fallback: index.html`, headers });
        return new NextResponse(rootIndexContent, {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (indexError) {
         return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

    } else if (error.code === 'EISDIR') {
       addLog({ method, path: urlPath, status: 403, message: 'Forbidden: Directory listing not allowed', headers });
       return NextResponse.json({ error: 'Directory listing not allowed' }, { status: 403 });
    }
    else {
      console.error(`Server Error processing ${method} ${urlPath}:`, error);
      addLog({ method, path: urlPath, status: 500, message: 'Internal Server Error', headers });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}

// Handle POST requests
export async function POST(request: NextRequest, { params }: { params: { filePath?: string[] } }) {
    const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
    const method = request.method;
    const headers = getLoggableHeaders(request.headers);
    const { body, error } = await parseRequestBody(request);

    let message = `Received POST request.`;
    if (error) {
        message += ` Body parsing error: ${error}`;
        addLog({ method, path: urlPath, status: 400, message, headers, requestBody: body });
        return NextResponse.json({ error: 'Bad Request', detail: error }, { status: 400 });
    } else {
        message += ` Body logged (truncated if large).`;
        addLog({ method, path: urlPath, status: 200, message, headers, requestBody: body });
        // You might want to do something with the body here,
        // but for now, we just acknowledge receipt.
        return NextResponse.json({ message: 'POST request received', data: body }, { status: 200 });
    }
}

// Handle PUT requests
export async function PUT(request: NextRequest, { params }: { params: { filePath?: string[] } }) {
    const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
    const method = request.method;
    const headers = getLoggableHeaders(request.headers);
    const { body, error } = await parseRequestBody(request);

    let message = `Received PUT request.`;
     if (error) {
         message += ` Body parsing error: ${error}`;
         addLog({ method, path: urlPath, status: 400, message, headers, requestBody: body });
         return NextResponse.json({ error: 'Bad Request', detail: error }, { status: 400 });
     } else {
         message += ` Body logged (truncated if large).`;
         addLog({ method, path: urlPath, status: 200, message, headers, requestBody: body });
         // Acknowledge receipt
         return NextResponse.json({ message: 'PUT request received', data: body }, { status: 200 });
     }
}

// Default handler for unsupported methods
async function handleUnsupportedMethod(request: NextRequest, { params }: { params: { filePath?: string[] } }) {
    const urlPath = `/api/serve/${params.filePath?.join('/') ?? ''}`;
    const method = request.method;
    const headers = getLoggableHeaders(request.headers);
    addLog({ method, path: urlPath, status: 405, message: 'Method Not Allowed', headers });
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

// Assign the handler to other methods
export { handleUnsupportedMethod as DELETE, handleUnsupportedMethod as PATCH, handleUnsupportedMethod as HEAD, handleUnsupportedMethod as OPTIONS };
