# Collaborative Code Review Platform API

An API-driven service built with **Node.js**, **TypeScript**, **Express**, and **PostgreSQL** that enables software development teams to post code snippets, conduct peer reviews, provide inline line-by-line feedback, track review statuses, and monitor project activity metrics.

---

## 📌 Project Overview

The Collaborative Code Review Platform simplifies asynchronous peer reviews by giving development teams a structured backend service to:
- **Manage Users & Roles**: Secure registration, login, JWT token issuance, and role-based access control (`admin`, `reviewer`, `developer`).
- **Organize Repositories**: Create and manage project repositories associated with team members.
- **Upload Code Submissions**: Share code snippets and track lifecycle statuses (`pending`, `in_review`, `approved`, `changes_requested`).
- **Provide Line-by-Line Feedback**: Add general or line-specific review comments on code submissions.
- **Enforce Review Workflows**: Restrict submission approvals and change requests to authorized reviewers with full audit history tracking.
- **View Activity & Analytics**: Retrieve user activity feeds and project-level review metrics.

---

## 🛠️ Tech Stack & Architecture

- **Language & Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (connected via `pg` Connection Pool with Parameterized Queries)
- **Security & Authentication**: `bcryptjs` (Password Hashing) & `jsonwebtoken` (JWT Authentication & Authorization)
- **Development Tooling**: `tsx` (TypeScript Execution & Live Reloading)

---

## 📁 Repository Structure

```text
code-review-api/
├── src/
│   ├── config/
│   │   └── database.ts         # PostgreSQL Connection Pool configuration
│   ├── controllers/
│   │   ├── analyticsController.ts  # Notifications & project statistics
│   │   ├── authController.ts       # User registration & authentication
│   │   ├── commentController.ts    # Inline & general review comments
│   │   ├── projectController.ts    # Project management
│   │   ├── reviewController.ts     # Review approval workflows & history
│   │   └── submissionController.ts # Code snippet uploads & status updates
│   ├── db/
│   │   └── schema.sql          # PostgreSQL DDL table definitions
│   ├── middleware/
│   │   ├── authMiddleware.ts   # JWT authentication verification
│   │   ├── errorMiddleware.ts  # Global centralized exception handling
│   │   └── roleMiddleware.ts   # Role-based access control (RBAC)
│   ├── routes/
│   │   ├── analyticsRoutes.ts  # Analytics & activity endpoints
│   │   ├── authRoutes.ts       # Auth endpoints
│   │   ├── commentRoutes.ts    # Comment endpoints
│   │   ├── projectRoutes.ts    # Project endpoints
│   │   ├── reviewRoutes.ts     # Review workflow endpoints
│   │   └── submissionRoutes.ts # Submission endpoints
│   └── server.ts               # Express application initialization & server setup
├── .env                        # Environment variables (git-ignored)
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
└── README.md                   # Project documentation
```

---

## 🗄️ Database Schema (`src/db/schema.sql`)

The database consists of five interconnected relational tables managed in PostgreSQL:

1. **`users`**: Stores user credentials, hashed passwords (`bcryptjs`), and assigned roles (`admin`, `reviewer`, `developer`).
2. **`projects`**: Stores code repositories owned by users.
3. **`submissions`**: Stores uploaded code snippets associated with a project, author, and status (`pending`, `in_review`, `approved`, `changes_requested`).
4. **`comments`**: Stores line-by-line or general review feedback on code submissions.
5. **`reviews`**: Stores an immutable audit trail of review approvals and change requests.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'developer' CHECK (role IN ('admin', 'reviewer', 'developer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    code_content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'changes_requested')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    line_number INT,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    submission_id INT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL CHECK (action IN ('approved', 'changes_requested')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** database server
- **pgAdmin** or SQL terminal CLI

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
PORT=5001
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=code_review_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Installation
Install project dependencies:

```bash
npm install
```

### 4. Database Initialization
Run the SQL DDL statements in `src/db/schema.sql` inside **pgAdmin Query Tool** connected to `code_review_db`.

### 5. Running the Application

- **Development Mode** (with hot reload):
  ```bash
  npm run dev
  ```
- **Build TypeScript**:
  ```bash
  npm run build
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📑 API Endpoint Documentation

### Base Route
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | API Health Check |

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user with hashed password |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |

### 📁 Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Protected | Create a new project repository |
| `GET` | `/api/projects` | Protected | Fetch all project repositories |
| `GET` | `/api/projects/:id/stats` | Protected | Fetch project review statistics & activity |

### 📝 Code Submissions (`/api/submissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions` | Protected | Upload a code snippet for peer review |
| `GET` | `/api/submissions/project/:projectId` | Protected | Fetch code submissions for a project |
| `PATCH` | `/api/submissions/:id/status` | Protected | Update submission review status |

### 💬 Review Comments (`/api/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/comments` | Protected | Add a line-by-line or general review comment |
| `GET` | `/api/comments/submission/:submissionId` | Protected | Retrieve review comments for a submission |

### 🛡️ Review Workflow & Auditing (`/api/submissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions/:id/approve` | Reviewer / Admin | Approve submission and record review |
| `POST` | `/api/submissions/:id/request-changes` | Reviewer / Admin | Request changes on submission and record review |
| `GET` | `/api/submissions/:id/reviews` | Protected | Retrieve full review history for a submission |

### 🔔 Activity Feed (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:id/notifications` | Protected | Retrieve recent user activity notifications |

---

## 📊 Development Roadmap Summary

- **Sprint 1 — Setup & Foundations**: Project initialization, PostgreSQL pool, schema design.
- **Sprint 2 — Authentication & Security**: Password hashing (`bcryptjs`), JWT generation, and protected middleware.
- **Sprint 3 — Project Repositories**: Project creation and user ownership.
- **Sprint 4 — Code Submissions**: Snippet uploads and status workflow.
- **Sprint 5 — Comments**: Line-by-line and general feedback system.
- **Sprint 6 — Review Workflow & RBAC**: Reviewer approval routes, audit trail, and role checks.
- **Sprint 7 — Analytics & Notifications**: User notification feed and project review statistics.
- **Sprint 8 — Error Handling & Validation**: Centralized global exception handler and payload validation.
