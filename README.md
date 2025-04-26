
# PocketServer - A Minimalist Web Server Playground

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitLab CI](https://gitlab.com/your-group/your-project/badges/main/pipeline.svg)](https://gitlab.com/your-group/your-project/-/pipelines) <!-- Optional: Replace with your GitLab project path -->

**Keywords**: web server, http server, static files, request handling, logging, nodejs, nextjs, learn web development, simple server, nginx alternative learning, educational server, docker, prometheus, grafana, monitoring, gitlab ci, ci/cd, web server basics, http methods, status codes

PocketServer is a lightweight, educational web server built with Next.js designed to help you understand the fundamental concepts of how web servers like Nginx or Apache work. It provides a clear interface to observe request handling, static file serving, and logging in real-time. This project now includes Docker support, basic monitoring setup with Prometheus & Grafana, and a GitLab CI/CD pipeline configuration.

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

5.  **Monitoring (Basic Setup):**
    *   A `docker-compose.yml` file is provided to run PocketServer alongside Prometheus and Grafana.
    *   `prometheus.yml` is configured to scrape Prometheus itself. **Note:** It includes a placeholder target for PocketServer (`pocketserver:9002`). Actual Prometheus metrics scraping requires instrumenting the PocketServer Node.js application (e.g., using `prom-client`) and exposing a `/metrics` endpoint (a placeholder `src/app/api/metrics/route.ts` is included).
    *   Grafana is configured to use Prometheus as a default data source. You can build dashboards in Grafana (accessible at `http://localhost:3000`, default: admin/admin) to visualize metrics.

6.  **CI/CD (GitLab):**
    *   A `.gitlab-ci.yml` file defines a basic pipeline:
        *   **Build:** Builds the PocketServer Docker image and pushes it to the GitLab Container Registry on commits to the `main` branch.
        *   **Deploy (Placeholder):** Includes comments and example commands for deploying the image to a server (e.g., your EC2 instance). You'll need to configure SSH access and adapt the commands for your specific environment.

## How to Use PocketServer

### 1. Running Locally (Development Mode)

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
    ```
*   **Access the Monitor:** Open your browser and navigate to `http://localhost:9002`. You'll see the log display interface.
*   **Access Static Files:**
    *   `http://localhost:9002/api/serve/` or `http://localhost:9002/api/serve/index.html` -> Serves `public/static/index.html`.
    *   `http://localhost:9002/api/serve/style.css` -> Serves `public/static/style.css`.
    *   Try other files in `public/static/`.
*   **Send POST/PUT Requests:** Use tools like `curl` or Postman. Observe logs in the monitor.
    ```bash
    # Example JSON POST
    curl -X POST -H "Content-Type: application/json" -d '{"key": "value"}' http://localhost:9002/api/serve/data
    ```

### 2. Running with Docker & Monitoring (Recommended for Testing Deployment)

*   **Prerequisites:** Docker and Docker Compose.
*   **Run the Stack:**
    ```bash
    docker-compose up -d --build
    ```
    *   `--build` ensures the PocketServer image is built based on the `Dockerfile`.
    *   `-d` runs the containers in detached mode (in the background).
*   **Access Services:**
    *   **PocketServer Monitor:** `http://localhost:9002`
    *   **Prometheus UI:** `http://localhost:9090`
    *   **Grafana UI:** `http://localhost:3000` (Login: admin/admin)
*   **Stop the Stack:**
    ```bash
    docker-compose down
    ```

### 3. Hosting a Simple Static Site (Locally via PocketServer)

PocketServer is primarily **educational**. For actual hosting, use production servers (Nginx, Apache) or hosting platforms. However, for local testing:

1.  **Place files:** Put your HTML, CSS, JS, images inside `public/static/`.
2.  **Structure:** Organize files as needed (e.g., `public/static/index.html`, `public/static/css/style.css`).
3.  **Run PocketServer:** Use either `npm run dev` or `docker-compose up`.
4.  **Access your site:**
    *   Main page: `http://localhost:9002/api/serve/`
    *   Other assets: `http://localhost:9002/api/serve/css/style.css`, etc.

### 4. Deploying to AWS EC2 (using Docker & GitLab CI)

1.  **Set up GitLab:**
    *   Push the code to a GitLab repository.
    *   Configure GitLab CI/CD variables in your project settings (Repository -> Settings -> CI/CD -> Variables):
        *   `SSH_PRIVATE_KEY`: Your EC2 instance's private SSH key content.
        *   `EC2_USER`: The user to SSH into the EC2 instance (e.g., `ec2-user`, `ubuntu`).
        *   `EC2_HOST`: The public IP address or DNS name of your EC2 instance.
        *   `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`, `CI_REGISTRY`: These are usually predefined by GitLab, but verify they are available.
2.  **Configure EC2 Instance:**
    *   Install Docker and Docker Compose.
    *   Ensure the user specified in `EC2_USER` has permissions to run Docker commands (usually by adding them to the `docker` group: `sudo usermod -aG docker $USER`).
    *   Allow incoming traffic on ports 9002 (PocketServer), 9090 (Prometheus), 3000 (Grafana) in your EC2 Security Group.
3.  **Update `.gitlab-ci.yml`:**
    *   Modify the `deploy_app` stage's `script` section with the correct SSH command and paths for your EC2 instance. Use the CI/CD variables. You'll likely need commands to:
        *   SSH into the instance.
        *   Navigate to the directory where you'll keep `docker-compose.yml` and `prometheus.yml`.
        *   Log in to the GitLab registry (`docker login $CI_REGISTRY -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD`).
        *   Pull the specific image built by the CI job (`docker pull $IMAGE_TAG`).
        *   Potentially update the `image:` tag within your `docker-compose.yml` on the server to use `$IMAGE_TAG`. (Tools like `sed` can help here, or structure your compose file to use environment variables).
        *   Run `docker-compose down` (to stop old containers).
        *   Run `docker-compose up -d` (to start new containers with the updated image).
4.  **Push to `main`:** Committing and pushing changes to the `main` branch will trigger the GitLab CI/CD pipeline, build the image, and execute the deployment script.

## Monitoring Dashboard Ideas (Grafana)

Once PocketServer is instrumented to expose Prometheus metrics (see Future Features), here are some key metrics and visualization ideas for a Grafana dashboard:

*   **Request Rate:**
    *   **Metric:** `http_requests_total` (Counter) - Instrument with labels for `method`, `path`, `status_code`.
    *   **Visualization:** Graph Panel showing `rate(http_requests_total[5m])` broken down by status code (2xx, 4xx, 5xx) or method. Helps identify traffic patterns and error spikes.
*   **Request Latency:**
    *   **Metric:** `http_request_duration_seconds` (Histogram or Summary) - Instrument with labels for `method`, `path`.
    *   **Visualization:** Graph Panel showing percentiles (e.g., 50th, 90th, 95th, 99th) of request duration using `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path))` for histograms. Helps identify slow endpoints. Heatmap visualization can also be effective.
*   **Error Rate:**
    *   **Metric:** Use `http_requests_total` filtered by status codes >= 400.
    *   **Visualization:** Stat Panel showing the percentage of 4xx/5xx requests over the total requests (`sum(rate(http_requests_total{status_code=~"^[45].."}[5m])) / sum(rate(http_requests_total[5m])) * 100`). Graph Panel showing the rate of 4xx and 5xx errors over time.
*   **Static File Serving:**
    *   **Metric:** Use `http_requests_total` filtered by paths starting with `/api/serve/`. Add labels for `file_type` (html, css, js, etc.).
    *   **Visualization:** Graph Panel showing request rates per file type. Table showing the most requested static files.
*   **System Metrics (if using node-exporter):**
    *   **Metrics:** `node_cpu_seconds_total`, `node_memory_MemAvailable_bytes`, `node_network_receive_bytes_total`, `node_filesystem_avail_bytes`.
    *   **Visualization:** Gauges/Stat Panels for current CPU/Memory usage. Graphs for network traffic and disk space over time.

**Aesthetic Usability:**

*   **Layout:** Organize panels logically (e.g., overview stats at the top, detailed graphs below). Use rows to group related panels.
*   **Titles & Descriptions:** Clearly label each panel explaining what it shows.
*   **Color Coding:** Use Grafana's color schemes effectively. Consistently use specific colors for success (green), client errors (yellow/orange), server errors (red). Use thresholds for color changes in Stat panels/Gauges.
*   **Readability:** Use appropriate units (e.g., ms for latency, requests/sec for rate). Use legends clearly. Avoid overly cluttered graphs.
*   **Interactivity:** Use template variables (e.g., dropdown to select specific paths or methods) to allow users to drill down into the data.

## Best Use Cases

*   **Learning:** Understanding the request/response cycle, HTTP methods, headers, status codes, static file serving, basic logging, and monitoring concepts.
*   **Debugging:** Observing raw request details locally.
*   **Prototyping:** Quickly serving static mockups without full server config.
*   **Teaching:** Demonstrating basic web server, Docker, and monitoring concepts.

## Future Features & Contribution Ideas

PocketServer is a starting point. Contributors can add:

*   **Full Prometheus Instrumentation:**
    *   Integrate `prom-client` into `src/app/api/serve/[[...filePath]]/route.ts` (or middleware).
    *   Create Counters (`http_requests_total`), Histograms (`http_request_duration_seconds`), and Gauges (e.g., `active_requests`).
    *   Expose these metrics correctly via the `/api/metrics` endpoint.
*   **Refined Logging:**
    *   Log rotation (saving logs to files).
    *   Different log levels (DEBUG, INFO, WARN, ERROR).
    *   Option to log to a file or a dedicated logging service.
*   **Configuration File:** Load settings (port, static dir, log level) from `pocketserver.config.json`.
*   **Directory Listing:** Optional HTML directory listings for folders without `index.html`.
*   **Basic Authentication:** Simple Basic Auth (`Authorization` header) for specific paths.
*   **MIME Type Enhancements:** Allow custom MIME types via config.
*   **HTTPS Support:** Basic HTTPS using self-signed certificates (for local dev).
*   **Rate Limiting:** Simple in-memory rate limiting.
*   **UI Enhancements:**
    *   Log filtering/searching/clearing in the UI.
    *   Displaying server status/uptime.
*   **WebSocket Support:** Basic WebSocket endpoint demonstration.
*   **Improved Test Coverage:** Add unit and integration tests (e.g., using Jest, Playwright). Update CI pipeline to run tests.
*   **Grafana Dashboard Provisioning:** Add JSON dashboard definitions to `grafana/provisioning/dashboards` so the dashboard is created automatically.
*   **Alertmanager Integration:** Add Alertmanager to the `docker-compose.yml` and configure Prometheus alerts (`prometheus.rules.yml`).

Feel free to fork the repository, implement a feature, and submit a pull request! Remember to update relevant documentation.
```