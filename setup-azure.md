# Azure Setup Guide - Samkalp Vedhik

You are deploying the platform to Azure. Here is how the structure works and how to manage your URLs.

## 1. Backend (FastAPI)
- **Host**: Azure App Service (Linux)
- **App Name**: `samkalp-backend`
- **URL**: `https://samkalp-backend-hacrbsdmccdbcpfa.centralindia-01.azurewebsites.net`
- **Configuration**:
  - `DATABASE_URL`: Your Azure PostgreSQL connection string.
  - `FRONTEND_URL`: Set this to your frontend URL (e.g., `https://proud-sea-0123.azurestaticapps.net`) once deployed.

## 2. Frontend (React)
- **Host**: Azure Static Web Apps
- **Build Tool**: `react-scripts` (CRA)
- **URL Management**:
  - Local development uses `frontend/.env.development` (`http://localhost:8000`).
  - Production uses environment variables in the GitHub Action (`REACT_APP_API_URL`).
- **Configuration**:
  - Ensure `AZURE_STATIC_WEB_APPS_API_TOKEN` is set in GitHub Secrets.

## 3. Deployment Workflows
- `.github/workflows/main_edpractice-backend.yml`: Automatically deploys the backend.
- `.github/workflows/main_edpractice-frontend.yml`: Automatically deploys the frontend.

## 4. Environment Variables Reference
| Variable | Usage | Expected Value (Production) |
| --- | --- | --- |
| `REACT_APP_API_URL` | Frontend -> Backend link | `https://samkalp-backend-hacrbsdmccdbcpfa.centralindia-01.azurewebsites.net` |
| `FRONTEND_URL` | Backend CORS setting | Your final frontend URL |
| `DATABASE_URL` | SQLAlchemy connection | `postgresql://user:pass@host:5432/db` |
