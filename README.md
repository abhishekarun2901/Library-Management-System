# Library Management System (LBMS)

A full-stack Library Management System designed to manage catalog operations, member activity, circulation workflows, and observability in a modern service-oriented setup.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Storybook
- **Backend:** Spring Boot 3 (Java 17), Spring Security, JPA, Redis cache
- **Database:** PostgreSQL 15
- **Infra & Tooling:** Docker Compose, pgAdmin, Grafana, Loki

## Repository Structure

- `frontend/` — React application and UI components
- `backend/` — Spring Boot API service
- `db/` — DB initialization and seed SQL scripts
- `data/` — datasets used for seeding/import flows
- `docs/` — OpenAPI specification and Postman assets
- `docker-compose.yml` — local multi-service orchestration

## Quick Start (Docker)

### 1) Prerequisites

- Docker + Docker Compose

### 2) Configure environment

Create a root `.env` file with at least:

- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`

### 3) Run services

```bash
docker compose up --build
```

### 4) Access points

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- pgAdmin: http://localhost:5050
- Grafana: http://localhost:3000
- Loki: http://localhost:3100

## Local Development (without Docker)

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

- OpenAPI JSON: `docs/openapi.json`
- OpenAPI YAML: `docs/openapi.yaml`
- Backend copy: `backend/docs/openapi.json`

## Quality and Validation

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd backend
./mvnw test
```

## Notes

- Generated artifacts and local-only outputs are excluded via `.gitignore`.
- Keep secrets out of source control and store them only in `.env` or secure secret managers.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
