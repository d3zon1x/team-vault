# TeamVault

TeamVault is a full-stack team knowledge base and documentation platform built with FastAPI, PostgreSQL, React, Docker, Redis, Celery, and S3-compatible file storage.

The project is designed as a production-style portfolio application for a Python API developer role. It includes authentication, workspaces, role-based permissions, documentation pages, autosave, version history, file attachments, background jobs, rate limiting, and audit logs.

---

## Features

### Authentication

* User registration and login
* JWT access tokens
* Refresh tokens
* Email verification
* Resend verification email
* Forgot/reset password flow
* Change password
* Logout from current session
* Logout from all sessions
* Google OAuth login
* Redis-based rate limiting for auth endpoints

### Workspaces

* Create, update, and delete workspaces
* Workspace slug generation
* Workspace members
* Role-based access control:

  * `owner`
  * `admin`
  * `editor`
  * `viewer`
* Add members by email
* Update member roles
* Remove members
* Owner/admin/editor/viewer permission separation

### Documentation Pages

* Markdown-based documentation pages
* Nested page hierarchy with parent pages
* Page tree UI
* Draft/published/archived page statuses
* Autosave support
* Manual version creation
* Immutable page version history
* Restore previous versions
* Publish, archive, restore, and delete pages
* Workspace-level page search
* Paginated list responses

### Attachments

* Upload files to S3-compatible storage
* Local MinIO support for development
* Attachment metadata stored in PostgreSQL
* Presigned download URLs
* Attachment deletion
* Page-level attachment management

### Background Jobs

* Celery worker
* Redis broker
* Email tasks
* Scheduled cleanup jobs with Celery Beat
* Expired refresh token cleanup
* Expired verification/reset token cleanup

### Audit Logs

* Workspace activity tracking
* Page activity logs
* Member activity logs
* Attachment activity logs
* Admin-only audit log access
* Filterable and paginated audit log API

### Frontend

* React + TypeScript + Vite
* Protected routes
* Authenticated SaaS-style dashboard layout
* Workspace overview
* Workspace members/settings pages
* Documentation page editor
* Markdown preview
* Autosave status UI
* Version history panel
* Attachments panel
* Audit log timeline
* Loading states, empty states, and confirmation dialogs

---

## Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy 2.0
* Alembic
* PostgreSQL
* Pydantic
* JWT authentication
* Google OAuth verification
* Redis
* Celery
* Celery Beat
* Boto3
* MinIO / S3-compatible storage

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Query
* React Markdown
* Remark GFM

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL container
* Redis container
* MinIO container
* Celery worker container
* Celery Beat container

---

## Architecture Overview

TeamVault separates application data, binary files, and asynchronous jobs.

```text
React Frontend
      |
      v
FastAPI Backend
      |
      |-- PostgreSQL
      |     - users
      |     - workspaces
      |     - workspace_members
      |     - pages
      |     - page_versions
      |     - attachments metadata
      |     - audit_logs
      |
      |-- Redis
      |     - rate limiting
      |     - Celery broker
      |
      |-- Celery Worker
      |     - email tasks
      |     - cleanup jobs
      |
      |-- MinIO / S3
            - uploaded files
            - images
            - PDFs
            - attachments
```

Markdown page content is stored in PostgreSQL because it is searchable, editable, versioned, and returned directly through the API.

Uploaded files are stored in MinIO/S3, while PostgreSQL stores only metadata such as filename, content type, size, uploader, and object key.

---

## Project Structure

```text
teamvault/
  backend/
    app/
      api/
        routes/
      core/
      db/
      models/
      repositories/
      schemas/
      services/
      workers/
    alembic/
    tests/
    Dockerfile
    pyproject.toml

  frontend/
    src/
      components/
      context/
      hooks/
      lib/
      pages/
      types/
    Dockerfile
    package.json

  docker-compose.yml
  README.md
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/teamvault.git
cd teamvault
```

### 2. Create backend environment file

Create `backend/.env`:

```env
APP_ENV=local

DATABASE_URL=postgresql+psycopg://teamvault:teamvault@postgres:5432/teamvault

JWT_SECRET_KEY=change-this-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

S3_ENDPOINT_URL=http://minio:9000
S3_PUBLIC_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=teamvault
S3_REGION_NAME=us-east-1

REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1
```

### 3. Create frontend environment file

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Start the project

```bash
docker compose up -d --build
```

### 5. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

---

## Local URLs

| Service      | URL                                         |
| ------------ | ------------------------------------------- |
| Frontend     | `http://localhost:5173`                     |
| Backend API  | `http://localhost:8000`                     |
| Swagger Docs | `http://localhost:8000/docs`                |
| Health Check | `http://localhost:8000/health`              |
| MinIO API    | `http://localhost:9000`                     |
| PostgreSQL   | `localhost:5433` or configured compose port |
| Redis        | `localhost:6379`                            |

---

## Useful Docker Commands

Start all services:

```bash
docker compose up -d
```

Rebuild services:

```bash
docker compose up -d --build
```

View backend logs:

```bash
docker compose logs -f backend
```

View frontend logs:

```bash
docker compose logs -f frontend
```

View Celery worker logs:

```bash
docker compose logs -f celery_worker
```

View Celery Beat logs:

```bash
docker compose logs -f celery_beat
```

Stop services:

```bash
docker compose down
```

---

## Database Migrations

Create a new migration:

```bash
docker compose exec backend alembic revision --autogenerate -m "migration name"
```

Apply migrations:

```bash
docker compose exec backend alembic upgrade head
```

Downgrade one migration:

```bash
docker compose exec backend alembic downgrade -1
```

---

## Main API Areas

### Auth

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/logout-all
GET    /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
POST   /api/auth/google
```

### Workspaces

```text
POST   /api/workspaces
GET    /api/workspaces
GET    /api/workspaces/{workspace_id}
PATCH  /api/workspaces/{workspace_id}
DELETE /api/workspaces/{workspace_id}
```

### Workspace Members

```text
GET    /api/workspaces/{workspace_id}/members
POST   /api/workspaces/{workspace_id}/members
PATCH  /api/workspaces/{workspace_id}/members/{member_id}
DELETE /api/workspaces/{workspace_id}/members/{member_id}
```

### Pages

```text
POST   /api/workspaces/{workspace_id}/pages
GET    /api/workspaces/{workspace_id}/pages
GET    /api/workspaces/{workspace_id}/pages/search
GET    /api/pages/{page_id}
PATCH  /api/pages/{page_id}
PATCH  /api/pages/{page_id}/autosave
POST   /api/pages/{page_id}/publish
POST   /api/pages/{page_id}/archive
POST   /api/pages/{page_id}/restore
DELETE /api/pages/{page_id}
```

### Page Versions

```text
GET    /api/pages/{page_id}/versions
POST   /api/pages/{page_id}/versions
GET    /api/pages/{page_id}/versions/{version_id}
POST   /api/pages/{page_id}/versions/{version_id}/restore
```

### Attachments

```text
POST   /api/pages/{page_id}/attachments
GET    /api/pages/{page_id}/attachments
GET    /api/attachments/{attachment_id}
GET    /api/attachments/{attachment_id}/download-url
DELETE /api/attachments/{attachment_id}
```

### Audit Logs

```text
GET    /api/workspaces/{workspace_id}/audit-logs
```

---

## Permissions

| Role   | Read Pages | Edit Pages | Manage Members | View Audit Logs | Delete Workspace |
| ------ | ---------: | ---------: | -------------: | --------------: | ---------------: |
| Viewer |        Yes |         No |             No |              No |               No |
| Editor |        Yes |        Yes |             No |              No |               No |
| Admin  |        Yes |        Yes |            Yes |             Yes |               No |
| Owner  |        Yes |        Yes |            Yes |             Yes |              Yes |

---

## Page Versioning Model

TeamVault uses immutable full snapshots for page versioning.

The `pages` table stores the current state of a document.

The `page_versions` table stores historical snapshots.

When a user creates a manual version, publishes a page, archives a page, or restores a previous version, TeamVault creates a new immutable version entry.

Restoring a version does not overwrite history. Instead, the restored content becomes the current page state and a new version is created.

```text
pages
  current title
  current markdown content
  current status

page_versions
  v1
  v2
  v3
  v4 restored from v1
```

This keeps history reliable and audit-friendly.

---

## Autosave Model

Autosave and versioning are intentionally separated.

Autosave updates the current page state:

```text
PATCH /api/pages/{page_id}/autosave
```

Manual versioning creates immutable history:

```text
POST /api/pages/{page_id}/versions
```

This prevents the version history from being polluted by every small keystroke while still keeping the document safely saved.

---

## File Storage Model

TeamVault does not store uploaded files in PostgreSQL.

PostgreSQL stores metadata:

```text
attachment id
workspace id
page id
original filename
stored filename
S3 key
content type
file size
uploaded by
created at
```

MinIO/S3 stores the actual binary files:

```text
workspaces/{workspace_id}/pages/{page_id}/attachments/{file_id}.png
```

The backend generates presigned download URLs when the frontend needs to display or download files.

---

## Background Jobs

TeamVault uses Celery for asynchronous and scheduled work.

Current jobs:

* Send verification email
* Send password reset email
* Clean up expired refresh tokens
* Clean up expired verification tokens
* Clean up expired password reset tokens

Redis is used as the Celery broker and also for rate limiting.

---

## Audit Logging

Audit logs track important workspace events:

* workspace created
* workspace updated
* workspace deleted
* member added
* member role updated
* member removed
* page created
* page updated
* page published
* page archived
* page restored
* page deleted
* page version created
* page version restored
* attachment uploaded
* attachment deleted

Audit logs are available to admin and owner users.

---

## Demo Flow

A typical demo flow:

1. Register a new account
2. Verify email
3. Log in
4. Create a workspace
5. Add workspace members
6. Create a documentation page
7. Edit markdown content
8. Watch autosave status
9. Save a manual version
10. Publish the page
11. Upload an attachment
12. Restore a previous version
13. View audit logs
14. Manage workspace settings

---

## Why This Project

TeamVault demonstrates backend API development skills:

* Authentication and session management
* RBAC and permission checks
* Database modeling
* SQLAlchemy relationships
* Alembic migrations
* PostgreSQL usage
* Redis rate limiting
* Celery background jobs
* S3-compatible file storage
* Audit logging
* Versioned document editing
* Transaction-aware repository design
* Docker-based local infrastructure
* Full-stack integration with React

---

## Future Improvements

Potential next improvements:

* Workspace invitations by email
* Full-text search with PostgreSQL `tsvector`
* Better markdown attachment references
* Tests for auth, permissions, and pages
* CI pipeline with linting and tests
* Production deployment configuration
* PDF export for pages/workspaces
* WebSocket collaboration indicators
* Soft delete recovery for pages and workspaces

---

## Status

This project is under active development and intended as a portfolio-grade application.

Core backend and frontend features are implemented locally with Docker Compose.
