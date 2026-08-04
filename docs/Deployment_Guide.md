# InstantMatrimony V2 Enterprise - Production Deployment Guide

## Production Deployment Workflow
1. Set `NODE_ENV=production` in environment variables.
2. Build the Next.js bundle:
   ```bash
   npm run build
   ```
3. Run containerized production build using Docker:
   ```bash
   docker-compose -f docker-compose.production.yml up --build -d
   ```
4. Configure Nginx / Reverse Proxy with SSL (Certbot) and security headers.
