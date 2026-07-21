# ⚙️ CareerOS API
## Secure, Scalable REST API for the CareerOS Platform
Production-grade backend powering authentication, profile management, job search integrations, and user analytics — built on Express.js and MongoDB.

Live API Health Check | [Client Repo](https://github.com/nilanjanajui/careeros-client)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### 💡 Why This API?
This isn't a single-resource CRUD demo — it's the robust backend for a modern career platform, handling robust authentication, external API integrations (Adzuna), and dynamic user profiles.

At a glance:

- 🔐 **Auth** JWT, Google OAuth (Passport), refresh tokens
- 💼 **Jobs** Integration with Adzuna for dynamic job listings
- 👤 **Profiles** Full CRUD for user profiles and settings
- 🛡️ **Security** CORS, encrypted passwords (bcrypt)

### 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 5 |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT, Passport.js (Google OAuth20) |
| Security | bcrypt, CORS |
| Config | Dotenv |
| Dev Tools | TypeScript, tsx |

### ✨ Core Features

#### 🔐 Authentication & Authorization
- Email/password authentication with bcrypt hashing
- Google OAuth via Passport.js
- JWT-secured endpoints with refresh token logic

#### 💼 Job Search Integration
- Adzuna API integration for AI-inferred regional job searches
- Server-side data formatting and pagination

#### 👤 Profile Management
- Full CRUD for user profiles
- Secure data handling and validation

### 🗂️ Project Structure

```text
src/
├── controllers/        # Business logic (e.g., authController.ts)
├── middlewares/        # Authentication & authorization
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── utils/              # Helpers
└── server.ts           # Application entry point
```

### 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/nilanjanajui/careeros-server.git
cd careeros-server

# Install dependencies
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/careeros
PORT=5000
CLIENT_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

JWT_SECRET=your_secure_jwt_secret
```

```bash
# Start the server in development mode
npm run dev
```

Server runs at http://localhost:5000

### 🏆 Project Highlights
- ⚡ Express.js 5 modular, controller-based REST architecture
- 🔒 Robust JWT authentication and Google OAuth integration
- 🧩 Strongly typed with TypeScript for reliable development
- 💼 Real external API integration (Adzuna)

### 🔗 Related Repositories

| Repository | Link |
|---|---|
| ⚙️ Server (this repo) | You're here |
| 🖥️ Client | [careeros-client](https://github.com/nilanjanajui/careeros-client) |

### 📄 License
This project was developed for educational and portfolio purposes under the MIT License.
