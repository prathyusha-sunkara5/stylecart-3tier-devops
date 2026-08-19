# StyleCart Architecture

## Application path

User -> Application Load Balancer -> Frontend ECS service

API requests:

User -> ALB `/api/*` -> Backend ECS service -> RDS MySQL

## CI/CD path

Developer -> GitHub -> Jenkins EC2 -> Docker build -> ECR -> ECS rolling deployment

## Assessment coverage

- Linux: Jenkins EC2 administration and troubleshooting
- Git: branches, commits, pull requests
- Docker: Dockerfiles, images, Compose
- Jenkins: Jenkinsfile and automated stages
- AWS: ECR, ECS Fargate, ALB, RDS, IAM, CloudWatch
