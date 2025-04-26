
# PocketServer - A Minimalist Web Server Playground

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Keywords**: web server, http server, static files, request handling, logging, nodejs, nextjs, learn web development, simple server, nginx alternative learning, educational server

PocketServer is a lightweight, educational web server built with Next.js designed to help you understand the fundamental concepts of how web servers like Nginx or Apache work. It provides a clear interface to observe request handling, static file serving, and logging in real-time.

## How It Works

PocketServer leverages Next.js API Routes to simulate core web server functionalities:

1.  **Request Handling:**
    *   The core logic resides in `src/app/api/serve/[[...filePath]]/route.ts`.
    *   It intercepts incoming HTTP requests (GET, POST, PUT, etc.) directed to `/api/serve/...`.
    *   It parses the request path, method, headers, and body (for POST/PUT).
    *   Directory traversal attacks (`../`) are prevented.

2.  **Static File Serving (GET Requests):**
    *   If the request method is GET, it tries to find a corresponding file in the `public/static/` directory based on the requested path.
    *   If the path points to a directory, it looks for an `index.html` file within that directory.
    *   If the specific file or `index.html` in a directory isn't found, it attempts to serve the root `public/static/index.html` as a fallback for a basic 404-like experience (configurable).
    *   It determines the correct `Content-Type` header (e.g., `text/html`, `text/css`, `application/javascript`) based on the file extension using the `mime-types` library.
    *   The file content is read and sent back in the HTTP response.

3.  **Request Logging:**
    *   Every incoming request to `/api/serve/...` is logged.
    *   The `src/lib/logger.ts` utility handles log creation and storage (in-memory for simplicity).
    *   Logs include timestamp, HTTP method, requested path, response status code, a descriptive message, relevant request headers, and the parsed request body (truncated for display).
    *   The main page (`src/app/page.tsx`) features a `LogDisplay` component (`src/components/log-display.tsx`) that fetches logs from the `/api/logs/route.ts` endpoint and displays them in a user-friendly, auto-refreshing interface.

4.  **Handling Other Methods (POST, PUT, etc.):**
    *   The server can receive POST and PUT requests at `/api/serve/...` paths.
    *   It attempts to parse the request body (supports JSON, form-urlencoded, plain text).
    *   The method, path, headers, and parsed body are logged.
    *   It sends back a simple JSON acknowledgment response. This demonstrates receiving data but doesn't *do* anything with it (like saving to a file or database).
    *   Other methods (DELETE, PATCH, etc.) are explicitly handled and return a `405 Method Not Allowed` status.

## How to Use PocketServer

### 1. Running Locally

*   **Prerequisites:** Node.js and npm (or yarn).
*   **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
*   **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
*   **Access the Monitor:** Open your browser and navigate to `http://localhost:9002`. You'll see the log display interface.
*   **Access Static Files:**
    *   `http://localhost:9002/api/serve/` or `http://localhost:9002/api/serve/index.html` -> Serves `public/static/index.html`.
    *   `http://localhost:9002/api/serve/style.css` -> Serves `public/static/style.css`.
    *   `http://localhost:9002/api/serve/another.html` -> Serves `public/static/another.html`.
    *   Try accessing a non-existent file like `http://localhost:9002/api/serve/nonexistent.txt` to see the 404 logging.
*   **Send POST/PUT Requests:** Use tools like `curl`, Postman, or browser developer tools (Fetch API) to send POST or PUT requests to paths under `/api/serve/`. Observe the logged headers and body in the monitor interface.
    ```bash
    # Example using curl to send JSON
    curl -X POST -H "Content-Type: application/json" -d '{"message": "Hello Server!"}' http://localhost:9002/api/serve/data

    # Example using curl to send form data
    curl -X PUT -H "Content-Type: application/x-www-form-urlencoded" -d "user=test&value=123" http://localhost:9002/api/serve/config
    ```

### 2. Hosting a Simple Static Site

PocketServer is primarily **educational** and not designed for production hosting due to its in-memory logging and basic feature set. However, you can use its static file serving capability to test a simple site locally:

1.  **Place your files:** Put your HTML, CSS, JavaScript, and image files inside the `public/static/` directory.
2.  **Structure:** Organize your files as you would for a regular website (e.g., `public/static/index.html`, `public/static/css/style.css`, `public/static/js/script.js`, `public/static/images/logo.png`).
3.  **Run PocketServer:** Start the server using `npm run dev`.
4.  **Access your site:**
    *   Your main page: `http://localhost:9002/api/serve/`
    *   Other assets: `http://localhost:9002/api/serve/css/style.css`, `http://localhost:9002/api/serve/js/script.js`, etc.

**Important Note:** For actual website hosting (especially on an AWS EC2 instance), you should use production-grade web servers like Nginx or Apache, or platform-as-a-service solutions (like Vercel, Netlify, AWS Amplify, Firebase Hosting) which are optimized for performance, security, and scalability.

## Best Use Cases

*   **Learning:** Understanding the request/response cycle, HTTP methods, headers, status codes, and static file serving.
*   **Debugging:** Observing raw request details (headers, body) for simple API endpoints or webhooks locally.
*   **Prototyping:** Quickly serving static mockups or simple front-end builds without configuring a full web server.
*   **Teaching:** Demonstrating basic web server concepts in an educational setting.

## Future Features & Contribution Ideas

PocketServer is a starting point. Here are some features contributors could add to enhance its capabilities and educational value:

*   **Directory Listing:** Option to enable simple HTML directory listings for folders that don't contain an `index.html`.
*   **Configuration File:** Load server settings (e.g., static root directory, log level, port) from a configuration file (`pocketserver.config.json`).
*   **More Robust Logging:**
    *   Log rotation (saving logs to files, creating new files periodically).
    *   Different log levels (DEBUG, INFO, WARN, ERROR).
    *   Option to log to a file instead of just the console/memory.
*   **Basic Authentication:** Implement simple Basic Auth (`Authorization` header) protection for specific paths.
*   **MIME Type Enhancements:** Allow overriding or adding custom MIME types via configuration.
*   **Simple Templating:** Basic server-side templating for HTML files (e.g., injecting dynamic data).
*   **Request Routing Enhancements:** More flexible routing rules beyond just static file mapping.
*   **HTTPS Support:** Add basic HTTPS capability using self-signed certificates (for local development).
*   **Rate Limiting:** Simple in-memory rate limiting based on IP address.
*   **UI Enhancements:**
    *   Log filtering/searching.
    *   Clearing logs via the UI.
    *   Displaying server status/uptime.
*   **WebSocket Support:** Basic WebSocket endpoint for real-time communication demonstration.

Feel free to fork the repository, implement a feature, and submit a pull request!
