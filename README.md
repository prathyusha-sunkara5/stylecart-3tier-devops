# StyleCart — 3-Tier Fashion E-Commerce DevOps Project

StyleCart is a simple three-tier fashion e-commerce application designed for AWS/DevOps project readiness.
This project demonstrates an end-to-end DevOps workflow using Git, Docker, Jenkins, and AWS.

## Stack
- Frontend: React + Vite + Nginx
- Backend: Node.js + Express
- Database: MySQL 8
- Containers: Docker + Docker Compose
- CI/CD: Jenkins
- AWS target: ECR + ECS Fargate + ALB + RDS MySQL

## Local run

```bash
docker compose up --build
```

Open http://localhost:8080

API health:
http://localhost:8080/api/health

## Repository layout

```text
frontend/       React application and Nginx
backend/        Express REST API
database/       MySQL schema and seed data
infra/          ECS task-definition templates and deployment notes
scripts/        helper scripts
Jenkinsfile     Jenkins CI/CD pipeline
docker-compose.yml
```

## CI/CD flow

GitHub -> Jenkins -> tests -> Docker build -> Amazon ECR -> ECS deployment

The Jenkinsfile expects these Jenkins credentials:
- `aws-credentials`: AWS access key/secret key credential
- `aws-region`: secret text containing the AWS region

For deployment, configure the environment variables at the top of Jenkinsfile:
`AWS_REGION`, `AWS_ACCOUNT_ID`, `ECS_CLUSTER`, `FRONTEND_SERVICE`, `BACKEND_SERVICE`,
`FRONTEND_REPOSITORY`, `BACKEND_REPOSITORY`.

The ECS task-definition templates are in `infra/ecs/`.

> Do not commit AWS passwords, access keys, database passwords, or `.env` files.
