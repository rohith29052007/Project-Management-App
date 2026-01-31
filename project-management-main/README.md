<div align="center">
  <h1><img src="https://project-management-gs.vercel.app/favicon.ico" width="20" height="20" alt="project-management Favicon">
   project-management</h1>
  <p>
    An open-source project management platform built with ReactJS and Tailwind CSS.
  </p>
  <p>
    <a href="https://github.com/GreatStackDev/project-management/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/GreatStackDev/project-management?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/GreatStackDev/project-management/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/GreatStackDev/project-management/issues"><img src="https://img.shields.io/github/issues/GreatStackDev/project-management?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 📝 Features <a name="-features"></a>

- **Multiple Workspaces:** Allow multiple workspaces to be created, each with its own set of projects, tasks, and members.
- **Project Management:** Manage projects, tasks, and team members.
- **Analytics:** View project analytics, including progress, completion rate, and team size.
- **Task Management:** Assign tasks to team members, set due dates, and track task status.
- **User Management:** Invite team members, manage user roles, and view user activity.

## 🛠️ Tech Stack <a name="-tech-stack"></a>

### Frontend
- **Framework:** ReactJS
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React for icons
- **State Management:** Redux Toolkit
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma

## 📚 Documentation

- **[HOW_TO_RUN_SERVERS.md](./HOW_TO_RUN_SERVERS.md)** ⭐ **START HERE** - How to run backend and frontend
- **[RUN_PROJECT.md](./RUN_PROJECT.md)** - Complete step-by-step run guide
- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Backend integration details
- **[server/README.md](./server/README.md)** - Backend API documentation
- **[server/PRODUCTION_READY.md](./server/PRODUCTION_READY.md)** - Production features documentation

## 🚀 Getting Started <a name="-getting-started"></a>

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env` and update with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
   DIRECT_URL="postgresql://username:password@localhost:5432/project_management?schema=public"
   PORT=5000
   ```

4. Run Prisma migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Install the dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

You can start editing the page by modifying `src/App.jsx`. The page auto-updates as you edit the file.

### Running Both Servers

For development, you'll need both servers running:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

Open two terminal windows and run the backend and frontend separately.

---

## 🤝 Contributing <a name="-contributing"></a>

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on how to get started.

---

## 📜 License <a name="-license"></a>

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.
