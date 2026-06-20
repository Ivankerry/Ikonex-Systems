# Ikonex Academy VPS Deployment Guide

This guide provides step-by-step instructions to deploy the Ikonex Academy project to your VPS (`162.35.160.74`). Since you already have another project at the root level, we will create a dedicated folder for this project to avoid any conflicts.

## Prerequisites

Ensure the following are installed on your VPS:
- **Git**
- **Docker** & **Docker Compose**
- **Nginx**

*(If you haven't installed them yet, you can run: `apt update && apt install git nginx docker.io docker-compose-v2 -y`)*

## Step 1: Connect to your VPS

Open your terminal and SSH into your VPS:

```bash
ssh root@162.35.160.74
```

## Step 2: Clone the Repository

We will place the project in the `/var/www/` directory under a new folder named `ikonex-academy`.

```bash
# Create and navigate to the web directory
mkdir -p /var/www/
cd /var/www/

# Clone the repository into a new folder named 'ikonex-academy'
# Replace the URL with your actual GitHub repository URL if it differs
git clone https://github.com/Ivankerry/Ikonex-Systems.git ikonex-academy

# Navigate into the newly cloned project
cd ikonex-academy
```

## Step 3: Setup the Application (Docker)

The backend, database, and now Nginx are all configured to run entirely via Docker Compose.

```bash
# Navigate to the backend directory
cd "Ikonex Academy Backend"

# Copy the production environment template
cp .env.production.example .env

# Edit the .env file
nano .env
```

In the `.env` file, update the following variables:
- `DB_PASSWORD`: Set a strong, secure password for the database.
- `CORS_ORIGIN`: Set this to `http://162.35.160.74:8080` (or your domain name) so the frontend can communicate with the backend.

Save and exit `nano` (`Ctrl+O`, `Enter`, `Ctrl+X`).

Next, we must configure the frontend to talk to the backend, because `config.json` is git-ignored:
```bash
# Go to the frontend directory
cd "../Ikonex Academy Frontend"

# Copy the example config
cp config.json.example config.json

# Edit the config file
nano config.json
```
Change `"api_url"` to `"http://162.35.160.74:8080/api"`. Save and exit.

Then go back to the backend directory:
```bash
cd "../Ikonex Academy Backend"
```

Next, edit `nginx.conf` to ensure the server name is correct:
```bash
nano nginx.conf
```
Find `server_name YOUR_VPS_IP_OR_DOMAIN;` and change it to:
```nginx
server_name 162.35.160.74; # Or your actual domain name
```
Save and exit.

Start the containers in the background:

```bash
docker compose up -d --build
```

You can verify the containers are running with:
```bash
docker ps
```

*Note: The Nginx container is exposed on port 8080 by default to prevent conflicts with your other project. If you want it on a different port, edit the `ports` section in `docker-compose.yml`.*

## Step 4: Verify Deployment

Your application should now be live!
- **Frontend:** Visit `http://162.35.160.74:8080` in your browser.
- **Backend Health Check:** Visit `http://162.35.160.74:8080/api/health` to confirm the backend is successfully proxying requests.

## Updating the Project in the Future

When you push new changes to GitHub and want to update the VPS:

```bash
# Pull the latest changes
cd /var/www/ikonex-academy
git pull origin main

# Rebuild all containers
cd "Ikonex Academy Backend"
docker compose up -d --build
```
