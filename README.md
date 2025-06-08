# Excalidraw TurboRepo Monorepo

This repository is a Turborepo-based monorepo for an Excalidraw clone with persistent drawing capabilities via PostgreSQL, HTTP, and WebSocket backends.

## 📁 Directory Structure

```
@app/
├── draw-application-frontend   # Next.js + React client for drawing
├── http-backend                # Express.js HTTP API for authentication, rooms, chat & strokes
├── ws-backend                  # WebSocket server for real-time chat & drawing
└── web                         # Shared web utilities / documentation

@packages/
├── backend-common             # Shared backend configuration & utilities
├── common                     # Shared types & schemas across packages
├── db                         # Prisma schema & client for PostgreSQL
│   └── .env.example           # Sample environment variables file
├── eslint-config             # Custom ESLint configuration for monorepo
├── typescript-config          # Shared TypeScript compiler settings
└── ui                         # Shared design system / UI components
```

## 🛠 Prerequisites

- Node.js (v16+)
- pnpm (package manager)

    - Install pnpm: [https://pnpm.io/installation](https://pnpm.io/installation)

- PostgreSQL database

## ⚙️ Setup

1. **Clone the repo**

    ```bash
    git clone <repository-url>
    cd <repository-root>
    ```

2. **Create environment file for DB**

    ```bash
    cp packages/db/.env.example packages/db/.env
    ```

3. **Add your connection string** in `packages/db/.env`:

    ```ini
    DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
    ```

4. **Global install dependencies from the root folder**

    ```bash
    pnpm install
    ```

5. **Run Prisma migrations**

    ```bash
    cd packages/db
    pnpm prisma migrate dev
    ```

6. **Rebuild Prisma client**

    ```bash
    cd packages/db
    pnpm install
    ```

7. **Start all services**

    ```bash
    # From repo root
    pnpm install
    pnpm run dev
    ```

## 🚀 Running Locally

Once setup is complete, you can start the entire monorepo in development:

```bash
pnpm run dev
```

This will concurrently start:

- **draw-application-frontend** on [http://localhost:3000](http://localhost:3000)
- **http-backend** on [http://localhost:3003](http://localhost:3003)
- **ws-backend** on ws\://localhost:8080

## 📝 Package Scripts

Each app package also contains its own scripts in `package.json`:

| Package                     | Script           | Description                    |
| --------------------------- | ---------------- | ------------------------------ |
| `draw-application-frontend` | `dev`            | Start Next.js frontend         |
| `Web`                       | `dev`            | Build chat production frontend |
| `http-backend`              | `dev`            | Start HTTP API server          |
| `ws-backend`                | `dev`            | Start WebSocket server         |
| `packages/db`               | `prisma:migrate` | Run Prisma migrations          |

## 🔗 Useful Links

- **pnpm installation**: [https://pnpm.io/installation](https://pnpm.io/installation)
- **Prisma docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Turborepo docs**: [https://turbo.build/repo](https://turbo.build/repo)

---

> By Rokumate 🎨🚀
