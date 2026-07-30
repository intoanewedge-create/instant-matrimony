# Deployment Guide

This guide details the steps to compile, package, and deploy the InstantMatrimony Enterprise application.

## 1. Containerization (Docker)

The application uses a multi-stage Docker build process to optimize image size and secure runtime privileges.

### Build and Run Locally

```bash
docker compose -f docker-compose.production.yml up --build
```

### Healthcheck Monitoring
The Docker runner performs a local HTTP health check against the liveness probe every 30 seconds:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/v1/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
```

## 2. Kubernetes Configuration (K8s)

A standard deployment manifest should contain:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: instantmatrimony-app
  labels:
    app: instantmatrimony
spec:
  replicas: 3
  selector:
    matchLabels:
      app: instantmatrimony
  template:
    metadata:
      labels:
        app: instantmatrimony
    spec:
      containers:
      - name: app
        image: instantmatrimony:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /api/v1/live
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /api/v1/ready
            port: 3000
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          limits:
            cpu: "1"
            memory: 1024Mi
          requests:
            cpu: "500m"
            memory: 512Mi
```

## 3. Database Migrations & Seeding

Never run `prisma db push` in production. Always use migrations.

### Running Migrations during Deployments

Integrate this command in your release phase:
```bash
npx prisma migrate deploy
```

### Seeding Initial Data
For initial CMS contents, run:
```bash
npx prisma db seed
```
This executes the database seeder which initializes default CMS pages like `privacy-policy`, `terms`, etc.
