# Contributing to crm-web

Thank you for your interest in contributing to **crm-web** — the CRM Field Force frontend!

> **Note:** This repository contains only the frontend (TypeScript/React/Vite). The backend is a private Java Spring Boot service and is not part of this repo.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/crm-web.git`
3. Install dependencies: `npm install`
4. Copy env file: `cp .env.example .env` and fill in required values
5. Start the dev server: `npm run dev`

## Development Workflow

- Always branch off `main`: `git checkout -b feat/your-feature-name`
- Follow the existing code style (TypeScript strict, ESLint enforced)
- Keep PRs focused — one feature or fix per PR
- Write meaningful commit messages (e.g., `feat: add lead detail modal`)

## Pull Request Guidelines

- Fill out the PR template completely
- Link any related issues (e.g., `Closes #12`)
- Ensure no lint errors: `npm run lint`
- Ensure the project builds: `npm run build`

## Reporting Issues

Use the [issue tracker](https://github.com/0xvNFT/crm-web/issues) and choose the appropriate template.

## Code Style

- TypeScript with strict mode
- ESLint configured via `eslint.config.js`
- Prefer functional components and React hooks
- Keep components small and single-responsibility
