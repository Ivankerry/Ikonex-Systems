# Ikonex Academy - Student Management System
## Submission Guide & User Manual

This document provides a comprehensive guide to setting up, deploying, and using the Ikonex Academy Student Management System.

---

## 🔗 Project Links

* **Git Repository URL**: `https://github.com/Ivankerry/Ikonex-Systems.git`
* **Hosted Application URL (Primary - Unified VPS)**: [http://162.35.160.74](http://162.35.160.74)
* **Hosted Application URL (Alternative - Vercel)**: [https://ikonex-systems.vercel.app](https://ikonex-systems.vercel.app)
  *(Note: Vercel runs on HTTPS. To call the HTTP VPS API from Vercel without browser mixed-content blocks, enable "Insecure Content" in Vercel's site settings. The Unified VPS URL does not require this as it uses same-origin routing.)*

---

## 🛠️ Local Development Setup

### 1. Backend Setup
1. Move into the backend directory:
   ```bash
   cd "Ikonex Academy Backend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:mukoya2005@localhost:5432/ikonex_academy
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   DB_SSL=false
   ```
4. Run migrations to initialize the schema:
   ```bash
   psql -d ikonex_academy -f db/migrations/001_init.sql
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Move into the frontend directory:
   ```bash
   cd "Ikonex Academy Frontend"
   ```
2. Configure `config.json` with the local API URL:
   ```json
   {
     "api_url": "http://localhost:5000/api"
   }
   ```
3. Launch the development server:
   ```bash
   node server.js
   ```
4. Open your browser to `http://localhost:3000`.

---

## 🚢 VPS Deployment (Unified Same-Origin Configuration)

This configuration serves the frontend assets and proxies API calls under a single port (80) on the VPS, avoiding CORS issues and browser mixed-content blocks.

1. **SSH into the VPS**:
   ```bash
   ssh root@162.35.160.74
   ```
2. **Clone/Pull code**:
   ```bash
   cd /var/www/Ikonex-Systems && git pull
   ```
3. **Configure the VPS `.env` File**:
   Write the `.env` configuration file in `/var/www/Ikonex-Systems/Ikonex Academy Backend`:
   ```env
   DB_USER=postgres
   DB_PASSWORD=mukoya2005
   DB_NAME=ikonex_academy
   CORS_ORIGIN=http://localhost:3000,http://162.35.160.74
   ```
4. **Launch Backend Containers (Docker Compose)**:
   ```bash
   cd "/var/www/Ikonex-Systems/Ikonex Academy Backend" && sudo docker compose up -d --build
   ```
5. **Configure Nginx**:
   Copy Nginx template, symlink it to enabled-sites, and reload Nginx:
   ```bash
   sudo cp "/var/www/Ikonex-Systems/Ikonex Academy Backend/nginx.conf" /etc/nginx/sites-available/ikonex-academy-api
   sudo ln -sf /etc/nginx/sites-available/ikonex-academy-api /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```
6. **Set Relative Endpoint Config**:
   Write relative API config for the unified server:
   ```bash
   echo '{"api_url": "/api"}' > "/var/www/Ikonex-Systems/Ikonex Academy Frontend/config.json"
   ```

---

## 📊 System Usage Guide

The application consists of four main functional sections:

### 1. Dashboard Analytics
* **Overview Cards**: Displays live totals for enrolled students, class streams, subjects, and the overall school average score.
* **Top Performers list**: Lists the top 5 performing students across all classes, sorted by average mark.
* **Action Shortcuts**: Quick navigations to register a student, add a class stream, or input term grades.

### 2. Class Streams Management
* **List Views**: Review active class streams, academic years, and student enrollments.
* **Add Stream**: Input a name (e.g. `Form 1A`) and academic year.
* **Subject Mapping**: Map specific subjects to streams to determine which grades can be input.

### 3. Students Management
* **Enroll Student**: Input first/last names, unique admission number, date of birth, gender, and assign them to a class stream.
* **Detailed Record**: Click a student's name to view their complete profile and grades.
* **Report Card (PDF)**: Generate and download a highly styled, print-ready student report card PDF containing academic grades, GPA, class position rank, and signature lines.

### 4. Subjects & Scores Management
* **Subject Directory**: Add core subjects and codes (e.g. `Biology`, `BIO101`).
* **Score Input Form**: Input CA score (0–40) and Exam score (0–60) for a student's assigned subjects for the active term.
* **Class rankings (PDF)**: Access the rankings dashboard, filter by stream/term/year, and download a landscape-oriented Class Performance Summary PDF.
