# Web Socket Lab

An experimental real-time chat application for exploring WebSockets and Socket.IO with a Node.js + Express backend (MongoDB / Mongoose) and a React + Vite frontend. The repo is Docker-ready for local development and fast iteration.

Repository: https://github.com/shafqat-baloch786/web-socket-lab

---

## Quick summary

- Backend: Node.js, Express, Socket.IO, Mongoose (MongoDB)
- Frontend: React, Vite, Tailwind (socket.io-client + axios)
- Dev tools: nodemon (backend), Vite (frontend)
- Orchestration: docker-compose (api + frontend)
- Purpose: learning / experimenting with real-time messaging, presence, and REST + socket integration

---

## Architecture (project tree)

Below is the project architecture (root layout):

```text
└── 📁web-socket-lab
        └── 📁branches
        └── 📁hooks
            ├── applypatch-msg.sample
            ├── commit-msg.sample
            ├── fsmonitor-watchman.sample
            ├── post-update.sample
            ├── pre-applypatch.sample
            ├── pre-commit.sample
            ├── pre-merge-commit.sample
            ├── pre-push.sample
            ├── pre-rebase.sample
            ├── pre-receive.sample
            ├── prepare-commit-msg.sample
            ├── push-to-checkout.sample
            ├── sendemail-validate.sample
            ├── update.sample
        └── 📁info
            ├── exclude
        └── 📁logs
            └── 📁refs
                └── 📁heads
                    ├── main
                └── 📁remotes
                    └── 📁origin
                        ├── main
            ├── HEAD
        └── 📁objects
            └── ...
    └── 📁client
        └── 📁public
            ├── vite.svg
        └── 📁src
            └── 📁assets
                ├── react.svg
            └── 📁components
                ├── ChatWindow.jsx
                ├── Input.jsx
                ├── ProtectedRoute.jsx
            └── 📁context
                ├── AuthContext.jsx
                ├── SocketContext.jsx
            └── 📁features
                └── 📁auth
                └── 📁chat
            └── 📁hooks
            └── 📁layouts
            └── 📁pages
                ├── ForgotPassword.jsx
                ├── Login.jsx
                ├── Profile.jsx
                ├── Register.jsx
            └── 📁services
                ├── authService.js
                ├── messageService.js
                ├── userService.js
            └── 📁utils
            ├── App.css
            ├── App.jsx
            ├── index.css
            ├── main.jsx
        ├── .env
        ├── .gitignore
        ├── Dockerfile
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── README.md
        ├── vite.config.js
    └── 📁server
        └── 📁config
            ├── db.js
        └── 📁controllers
            ├── authController.js
            ├── mainController.js
            ├── messageController.js
            ├── userController.js
        └── 📁middleware
            ├── auth.js
            ├── errorMiddleware.js
        └── 📁models
            ├── Message.js
            ├── User.js
        └── 📁routes
            ├── authRoute.js
            ├── mainRoute.js
            ├── messageRoute.js
            ├── userRoute.js
        └── 📁services
            ├── messagService.js
        └── 📁socket
            ├── chatHandler.js
            ├── index.js
        └── 📁utils
            ├── asyncWrapper.js
            ├── ErrorHandlerClass.js
            ├── generateToken.js
        ├── .dockerignore
        ├── .env
        ├── app.js
        ├── Dockerfile
        ├── package-lock.json
        ├── package.json
        ├── server.js
    ├── .gitignore
    └── docker-compose.yml
```

---

## How to run

Two recommended ways: docker-compose (fast, consistent) or local dev (manual).

A) Using docker-compose (recommended for dev)
1. From repo root:
   ```bash
   docker-compose up --build
   ```
2. Frontend (Vite) will be available at http://localhost:5173
3. Backend API will run at http://localhost:4000

Notes:
- docker-compose mounts local source directories into containers, so code changes are reflected without rebuilding (development mode).
- Backend runs `npm run dev` (nodemon) inside container.

B) Local (manual)
1. Start MongoDB (local or remote)
2. Backend:
   ```bash
   cd server
   npm install
   # create server/.env (see next section)
   npm run dev
   ```
3. Frontend:
   ```bash
   cd client
   npm install
   # create client/.env if needed (e.g. VITE_API_URL)
   npm run dev
   ```
4. Open http://localhost:5173

---

## Environment variables

Create a `server/.env` file with at least these values (names inferred; check server/config/db.js and utils/generateToken.js for exact names):

- PORT (e.g. 4000)
- NODE_ENV (e.g. development)
- JWT_SECRET (secret for signing tokens)
- JWT_EXPIRES_IN (e.g. 7d)
- MONGO_URI (MongoDB connection string)

Client may use a `.env` for Vite (e.g. VITE_API_URL) — check `client/.env` and `client/src/services` for exact env names.

---

## What to look at in the code

- server/server.js — connects to DB, creates HTTP server, attaches Socket.IO, wires socket handlers
- server/socket/chatHandler.js — chat-specific socket logic (presence, message emits, rooms)
- server/routes/*.js & server/controllers/*.js — REST endpoints (auth, users, messages)
- client/src/context/SocketContext.jsx — socket provider + lifecycle
- client/src/components/ChatWindow.jsx — primary chat UI
- client/src/services/* — axios wrappers for API requests

---

## Socket & API (high-level)

- REST endpoints: /api/auth, /api/users, /api (message endpoints), /api/main
- Socket events and payloads are implemented in `server/socket`/`client/src/context` — typical flows include connecting, registering socket id, sending messages, receiving messages, presence updates (online/offline). Browse `server/socket/chatHandler.js` and `client/src/context/SocketContext.jsx` to document exact event names if you want a formal API spec.

---

## Contributing

1. Fork → branch → commit → PR
2. Use meaningful commit messages and keep PRs scoped
3. Run linters (client has `npm run lint`) before opening PRs

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

Maintainer: Shafqat Baloch — https://github.com/shafqat-baloch786
