# Ikonex Academy - Student Management & Academic Records System

An enterprise-grade, lightweight, and fully containerized Student Management System built using a modern **MVC Architecture** with **Node.js, Express, and PostgreSQL**, coupled with a highly responsive, zero-dependency **Vanilla SPA Frontend**.

Designed and optimized for deployment on resource-constrained environments (e.g., 1 vCPU / 2 GB RAM VPS) with high security, Nginx rate-limiting, and premium PDF report generation.

---

## 🚀 Technologies & Architecture

![Node.js](https://img.shields.io/badge/Node.js-v20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Enabled-009639?logo=nginx&logoColor=white)

```mermaid
graph TD
    Client[Browser: HTML/CSS/JS SPA] <-->|HTTP/JSON| Nginx[Host Nginx Reverse Proxy]
    Nginx <-->|Proxy Port 5000| Backend[Docker Container: Express.js Backend]
    Backend <-->|node-postgres Pool| Database[Docker Container: PostgreSQL 16]
```

### 1. Frontend Architecture (Vanilla ES6 SPA)
* **Single Page Application**: Uses a custom client-side router (`router.js`) and dynamic inner-partial loading. Navigation is instantaneous, eliminating page flickers.
* **Responsive Layout System**: Custom Grid/Flexbox design system built with CSS variables, featuring hover elevations, click scales, active state transitions, and a clean horizontal metric cards panel.
* **Component Modals & Toasts**: Reusable, programmatic modal boxes and dynamic success/error alert toast notifications.
* **Input Validation & Form Handlers**: Fully integrated with browser-native HTML5 validation (`reportValidity()`) and strict custom script constraints (alphabetic-only checks on names, digit limits, and float constraints on scores).

### 2. Backend API Architecture (Express.js)
* **Decoupled Service Layer**: Clear separation of concerns. Controllers handle HTTP request/response lifecycles, delegating business logic to services, which call queries to PostgreSQL.
* **Centralized Middleware Engine**:
  * `errorHandler.js`: Catches exceptions globally, yielding clean, standardized JSON error models.
  * `validate.js`: Intercepts inputs at the router level, keeping controllers pollution-free.
  * `notFound.js`: Captures dead routes cleanly.
* **Premium Report Engine**: Imperative PDF creation using `pdfkit` featuring colored titles, bordered student info cards, aligned alternate-colored tables, performance summaries, and footer signatures.

### 3. Database Schema & Performance (PostgreSQL 16)
* **Relational Schema**: Structured tables with cascades, constraints, and foreign key relations mapping `streams`, `students`, `subjects`, `stream_subjects`, and `scores`.
* **Indexed Lookups**: Speed optimizations using explicit indexing on foreign keys (`idx_students_stream`, `idx_scores_student`) and compound indexes for analytics search (`idx_scores_term_year`).
* **Uniqueness Constraints**: Prevent redundant database rows via composite unique keys:
  * `UNIQUE (student_id, subject_id, term, year)` on the scores table.

---

## 💎 Key Features & Enhancements

* **Horizontal Stats Grid**: Centered layout grouping counts and metrics cleanly in a 4-column flow.
* **Fail-Safe Loading States**: Save buttons in modals dynamically store original labels (e.g. "Save", "Confirm"), display "Loading..." on click, and reliably restore the original text and enable interaction if an error occurs.
* **SPA Page Reload Support**: Custom local web server (`server.js`) and production rewrite configuration (`vercel.json`) ensure page reloads on sub-routes (e.g., `/students`) resolve to `index.html` instead of throwing a 404.

---

## 📦 Directory Structure

```text
├── Ikonex Academy Backend/
│   ├── config/            # DB Pools & App configurations
│   ├── controllers/       # HTTP controllers (MVC)
│   ├── db/
│   │   ├── migrations/    # Schema initialization migration scripts
│   │   └── queries/       # Parameterized SQL query layers
│   ├── middleware/        # Express error & validate middlewares
│   ├── routes/            # Decoupled REST routes
│   ├── services/          # Business logic & PDF Report generation
│   ├── utils/             # Standard API wrappers & grading constants
│   ├── Dockerfile         # Multi-stage optimized Node build
│   ├── docker-compose.yml # Orchestrated backend + database stack
│   ├── nginx.conf         # Rate-limiting proxy config template
│   └── server.js          # Express listener initialization
│
└── Ikonex Academy Frontend/
    ├── assets/
    │   ├── css/           # Layout, base, component styles
    │   └── js/
    │       ├── components/# Programmatic Modals & Toasts
    │       ├── pages/     # Student, score, stream, results loaders
    │       └── router.js  # SPA Routing engine
    ├── index.html         # Frontend application shell
    └── server.js          # Node static server with SPA fallback
```

---

## 🌐 Hosting & Deployment Methods

This project supports three primary hosting and deployment methods depending on the environment:

### 1. Local Development Hosting
* **Backend**: Express API running locally on port `5000` (`node server.js` or `npm run dev` with nodemon).
* **Frontend**: Served using a lightweight, zero-dependency custom static server ([server.js](file:///c:/Users/dev/Desktop/Ikonex%20Academy/Ikonex%20Academy%20Frontend/server.js)) listening on port `3000`.
* **SPA Fallback Routing**: The local dev server intercepts routing paths lacking file extensions (e.g. `/students`) and redirects them to `index.html` to prevent 404 errors on page reload.

### 2. Single-Port Unified VPS Hosting (Recommended Production Setup)
To bypass browser **Mixed Content Blocks** (which prevent secure `https` frontends from making requests to insecure `http` IP-based backends) without requiring a domain name:
* Both the frontend and backend are hosted on the **same VPS server** (Port `80`).
* **Backend + Database**: Run inside a containerized network via Docker Compose (PostgreSQL and Node API). The Node API container is bound strictly to `127.0.0.1:5000` (private).
* **Nginx Reverse Proxy & Static Server**:
  * Incoming traffic to the root path (`/`) serves the static frontend HTML/CSS/JS files directly from the `/var/www/Ikonex-Systems/Ikonex Academy Frontend` directory.
  * Incoming traffic to `/api` proxies requests in the background to the backend Node.js container.
* **Benefits**: Since the page and the API share the exact same host and port (`http://YOUR_VPS_IP`), the browser treats them as **same-origin**. This eliminates CORS configuration issues and Mixed Content restrictions out-of-the-box.
---

## ⚙️ Setup & Installation

### Local Development Setup

#### 1. Backend Setup
1. Move into the backend directory:
   ```bash
   cd "Ikonex Academy Backend"
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` configuration file:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/ikonex_academy
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   DB_SSL=false
   ```
4. Run migrations on your local database:
   ```bash
   psql -d ikonex_academy -f db/migrations/001_init.sql
   ```
3. Launch the server in development mode (using nodemon):
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Move into the frontend directory:
   ```bash
   cd "Ikonex Academy Frontend"
   ```
2. Copy `config.json.example` to `config.json` and verify the API endpoint matches your backend:
   ```json
   {
     "API_BASE_URL": "http://localhost:5000/api"
   }
   ```
3. Start the zero-dependency local static development server:
   ```bash
   node server.js
   ```
4. Access the dashboard in your browser at: `http://localhost:3000`

---

## 🚢 Production VPS Deployment (Docker)

This stack is pre-configured to build securely on your VPS.

### 1. VPS Host Setup (Firewall & Prerequisites)
Allow web traffic through the UFW firewall:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

Install Docker and Git if not already installed:
```bash
sudo apt update && sudo apt install git docker.io docker-compose-v2 -y
```

### 2. Pull Code & Prepare Environment
Create a directory and clone the repository:
```bash
mkdir -p /var/www/
cd /var/www/
git clone https://github.com/Ivankerry/Ikonex-Systems.git ikonex-academy
```

Configure backend `.env` inside `Ikonex Academy Backend`:
```bash
cd "ikonex-academy/Ikonex Academy Backend"
cp .env.production.example .env
nano .env
```
Update variables:
```env
DB_USER=postgres
DB_PASSWORD=YOUR_STRONG_GENERATED_PASSWORD_HERE
DB_NAME=ikonex_academy
CORS_ORIGIN=http://YOUR_VPS_IP:8080
```
Update `nginx.conf` server name:
```bash
nano nginx.conf
# Change `server_name YOUR_VPS_IP_OR_DOMAIN;` to your VPS IP or Domain
```

Configure frontend `config.json` inside `Ikonex Academy Frontend`:
```bash
cd "../Ikonex Academy Frontend"
cp config.json.example config.json
nano config.json
```
Update variables:
```json
{
  "api_url": "http://YOUR_VPS_IP:8080/api"
}
```

### 3. Launch Docker Containers
From the `Ikonex Academy Backend` folder, build and run all services:
```bash
cd "../Ikonex Academy Backend"
docker compose up -d --build
```
* **PostgreSQL Service (`db`)**: Isolated inside the Docker network.
* **Express Backend Service (`backend`)**: Internal Node API, accessed only via Nginx.
* **Nginx Service (`nginx`)**: Serves the static frontend and reverse proxies `/api` to the backend. Exposed securely on port `8080`.

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Health Check (connectivity, DB status) | None |
| **GET** | `/api/dashboard` | Dashboard Metrics (total students, averages) | None |
| **POST** | `/api/students` | Enroll Student | `{ first_name, last_name, admission_number, stream_id, ... }` |
| **GET** | `/api/results/student/:id` | Get Student Grade Records | `?term=Term+1&year=2026` |
| **POST** | `/api/scores` | Record Student Subject Scores | `{ student_id, subject_id, ca_score, exam_score, term, year }` |
| **GET** | `/api/reports/student/:id/pdf` | Download Student Report Card (PDFKit) | `?term=Term+1&year=2026` |
| **GET** | `/api/reports/stream/:id/pdf` | Download Class Summary Sheet (PDFKit) | `?term=Term+1&year=2026` |

---

## 🔒 Security Implementations
* **Rate Limiting**: Host-level Nginx rate limits set to `10r/s` per IP address.
* **HTTP Security Headers**: Express app uses `helmet` to configure CSP, and Nginx enforces headers (e.g. `X-Frame-Options: DENY`, `Referrer-Policy`) to block clickjacking and scripting threats.
* **Hidden Database**: The DB container has zero mapped ports to the host machine, making it accessible only within the internal Docker network.
* **SQL Injection Prevention**: Database layer uses exclusively parameterized SQL queries, blocking injection attacks.
* **Strict Cross-Origin Policies**: Node backend restricts CORS to specific allowed clients (e.g. Vercel deployment & localhost), blocking unauthorized API calls.
