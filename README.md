Online Voting System with Enhanced Security and Transparency

📌 Project Overview

A secure, transparent, and auditable e-voting platform designed for institutional elections. This project leverages a decoupled 3-tier architecture and a 3rd Normal Form (3NF) database design to ensure maximum data integrity and voter anonymity.

🛠 Tech Stack

Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MySQL (Relational)

Authentication: JWT (JSON Web Tokens) & Bcrypt hashing

📂 Project Structure

    ├── client/                # React Frontend
    ├── server/                # Node.js Backend & API
    │   ├── config/            # DB Connection Pool
    │   ├── controllers/       # Business Logic (The Brain)
    │   ├── models/            # Normalized SQL Queries (3NF)
    │   ├── routes/            # API Endpoints (URLs)
    │   ├── middleware/        # JWT & Admin Security Guards
    │   ├── utils/             # Helpers (Time Bucketing, Token Gen)
    │   └── .env.example       # Secret keys template
    ├── docs/                  # Architecture & Design Diagrams
    └── database/
    └── init.sql           # Master 3NF Schema Script


🔐 Key Security Features

Structural Anonymity: Our database is designed with no direct link between the Users and Votes tables.

Time Bucketing: To prevent "Timing Correlation Attacks," votes are stored in rounded time buckets (e.g., nearest 10-minute block) rather than high-precision timestamps.

Stateless Auth: Secure authentication using JWT, allowing the backend to remain scalable and "stateless."

Data Integrity: Strict 3NF normalization prevents data anomalies and ensures referential integrity across elections, positions, and candidates.

🚀 Getting Started

1. Repository Setup

git clone [https://github.com/your-username/online-voting-system.git](https://github.com/your-username/online-voting-system.git)
cd online-voting-system


2. Database Initialization

Open your MySQL client.

Run the script found in database/init.sql.

3. Backend Setup

cd server
npm install
cp .env.example .env  # Update this file with your DB credentials
node index.js


4. Frontend Setup

cd client
npm install
npm start


🤝 Contribution Guidelines (Team Rules)

Branching: Never push directly to main. Use feature/feature-name branches.

Environment: If you add a new variable to .env, you must update .env.example.

Commits: Use descriptive commit messages (e.g., feat: add JWT validation to vote route).
