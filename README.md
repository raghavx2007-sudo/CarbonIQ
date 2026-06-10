# CarbonIQ

[![CI Pipeline](https://github.com/raghavx2007-sudo/CarbonIQ/actions/workflows/ci.yml/badge.svg)](https://github.com/raghavx2007-sudo/CarbonIQ/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/raghavx2007-sudo/CarbonIQ/badge.svg?branch=main)](https://coveralls.io/github/raghavx2007-sudo/CarbonIQ?branch=main)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=raghavx2007-sudo/CarbonIQ)](https://dependabot.com)

CarbonIQ is an AI-powered Carbon Footprint Awareness & Optimization Platform.

## Architecture

This is a monorepo consisting of:
- `frontend/`: Next.js 14 frontend using React Server Components and Tailwind CSS.
- `backend/`: Express + Node.js + Prisma backend providing robust REST APIs.

## Getting Started

1. Set up the environment variables:
   ```bash
   cp .env.example frontend/.env.local
   cp .env.example backend/.env
   ```

2. Start the Backend:
   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run dev
   ```

3. Start the Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Testing

To run the integration tests on the backend:
```bash
cd backend
npm test
```
