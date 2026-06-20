# Ikonex Academy - Student Management System
## Submission Guide & User Manual

This document provides a comprehensive guide to setting up, deploying, and using the Ikonex Academy Student Management System.

---

## 🔗 Project Links

* **Git Repository URL**: `https://github.com/Ivankerry/Ikonex-Systems.git`
* **Hosted Application URL (Primary - Unified VPS)**: [http://162.35.160.74:8080](http://162.35.160.74:8080)

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
   DATABASE_URL=postgresql://postgres:dbpass@localhost:5432/ikonex_academy
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

## 🚢 VPS Deployment (Dockerized Same-Origin Configuration)

This configuration serves the frontend assets and proxies API calls entirely through Docker Compose, avoiding CORS issues and making deployment seamless.

1. **SSH into the VPS**:
   ```bash
   ssh root@your_vps_ip
   ```
2. **Clone/Pull code**:
   ```bash
   mkdir -p /var/www/
   cd /var/www/
   git clone https://github.com/Ivankerry/Ikonex-Systems.git ikonex-academy
   ```
3. **Configure the VPS `.env` File**:
   Write the `.env` configuration file in `/var/www/ikonex-academy/Ikonex Academy Backend`:
   ```bash
   cd "/var/www/ikonex-academy/Ikonex Academy Backend"
   cp .env.production.example .env
   nano .env
   ```
   ```env
   DB_USER=postgres
   DB_PASSWORD=YOUR_SECURE_PASSWORD
   DB_NAME=ikonex_academy
   CORS_ORIGIN=http://162.35.160.74:8080
   ```
4. **Set Frontend Config**:
   Configure the frontend to point to the correct API:
   ```bash
   cd "/var/www/ikonex-academy/Ikonex Academy Frontend"
   cp config.json.example config.json
   nano config.json
   ```
   ```json
   {
     "api_url": "http://162.35.160.74:8080/api"
   }
   ```
5. **Configure Nginx Server Name**:
   ```bash
   cd "/var/www/ikonex-academy/Ikonex Academy Backend"
   nano nginx.conf
   # Update server_name to 162.35.160.74
   ```
6. **Launch Containers (Docker Compose)**:
   ```bash
   docker compose up -d --build
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
