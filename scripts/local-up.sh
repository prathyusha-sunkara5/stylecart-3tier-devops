#!/usr/bin/env bash
set -e
docker compose up --build -d
docker compose ps
echo "StyleCart: http://localhost:8080"
