# ECS deployment templates

Create two ECS services:
- stylecart-frontend-service
- stylecart-backend-service

Use ECR images:
- stylecart-frontend
- stylecart-backend

Recommended production arrangement:
- ALB -> frontend on port 80
- ALB `/api/*` -> backend on port 4000
- RDS MySQL is private
- Store DB password in AWS Secrets Manager
- Use separate security groups for ALB, frontend, backend and RDS

The Jenkinsfile updates the ECS services after pushing new images.

For a first deployment, create the ECS services/task definitions in AWS and then let Jenkins perform rolling deployments.
