# Troubleshooting

## Docker daemon
Run:
docker version
docker compose version

## Frontend cannot reach API
Check:
docker compose ps
docker compose logs backend
docker compose logs frontend

The Nginx configuration proxies `/api/` to `backend:4000`.

## MySQL not ready
Run:
docker compose logs db

The backend waits for the Compose MySQL health check before starting.

## Jenkins Docker permission
On Linux Jenkins hosts, make sure the Jenkins service can access the Docker daemon, then restart Jenkins.

## ECS health check
Confirm:
- frontend container listens on 80
- backend container listens on 4000
- ALB target groups use the matching ports
- security groups allow ALB -> ECS traffic
- backend can reach RDS
