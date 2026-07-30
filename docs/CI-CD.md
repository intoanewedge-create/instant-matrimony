# CI/CD Infrastructure Guide

This document describes the Continuous Integration and Continuous Deployment workflows for InstantMatrimony.

## 1. Pipeline Trigger Rules

The pipeline executes automatically on:
- All push events to the `main`, `master`, and `develop` branches.
- All pull requests targeting `main`, `master`, or `develop`.

## 2. CI Validation Steps

Every pipeline run triggers the following stages:

1. **Setup Node.js:** Installs Node 18 runtime environment and caches `node_modules` structure.
2. **Install Dependencies:** Installs packages using `npm ci`.
3. **Prisma Code Generation:** Generates the typed client library using `npx prisma generate`.
4. **Lint Verification:** Verifies coding standards with `npm run lint`.
5. **TypeScript Verification:** Confirms lack of compile-time typing errors using `npx tsc --noEmit`.
6. **Production Build:** Builds static resources using `npm run build`.

## 3. Docker Image Verification

Once the validation stage passes:
- The runner sets up `docker-buildx` to support build caching.
- The runner triggers a dry-run image creation of `Dockerfile` to verify docker compilations.
- On master/main branches, the image is tagged and pushed to the container registry (e.g. AWS ECR or Docker Hub).
