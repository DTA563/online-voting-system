# **🗺️ Project Implementation & Maintenance Guide**

This guide defines where specific code lives and how the team should maintain the repository.

## **🏗️ 1\. Folder Implementation Map**

### **Root Directory (The Container)**

* .gitignore: Keeps the repo clean (node\_modules, .env).  
* README.md: The project manual for new team members.

### **/server (The Logic Tier)**

| Folder | Content | Responsibility |
| :---- | :---- | :---- |
| index.js | Entry Point | Initializes the Express server and connects middleware. |
| config/ | db.js | Contains the code that connects Node.js to your MySQL database. |
| routes/ | authRoutes.js, voteRoutes.js | Defines the API endpoints (URLs). It calls the Controllers. |
| controllers/ | authController.js, voteController.js  | **The Brain.** Handles logic like hashing passwords or checking if a user already voted. |
| models/ | User.js, Vote.js | **The Data.** Contains the raw SQL queries (e.g., SELECT \* FROM users). |
| middleware/ | authMiddleware.js | Security guards. Checks if a user has a valid JWT before letting them vote. |
| .env | Secrets | Stores the DB password and JWT secret (Never uploaded\!). |

### **/client (The Presentation Tier)**

* Standard React structure.  
* src/components/: Reusable UI parts (Buttons, Navbars).  
* src/pages/: Full screens (Login, Voting Booth, Results).  
* src/api/: Helper functions to fetch data from your Node.js server.

### **/database (The Data Tier)**

* init.sql: The master script to set up the MySQL tables.

## **🛠️ 2\. Maintenance Protocol**

### **A. How to Add a New Feature (e.g., "Candidate Profile")**

1. **Database:** Update init.sql with new columns if needed.  
2. **Model:** Create a function in models/Candidate.js to fetch profiles.  
3. **Controller:** Create a function in controllers/candidateController.js to process the data.  
4. **Route:** Create a route in routes/candidateRoutes.js (e.g., GET /api/candidates/:id).  
5. **Frontend:** Build a page in client/src/pages/ to display the profile.

### **B. Git Branching Strategy**

To keep the main branch stable, team members should never push directly to it.

* **main**: Production-ready code only.  
* **develop**: Where the team integrates their finished features.  
* **feature/name**: Individual branches for working on specific tasks.

### **C. Dependency Management**

* If you install a new package (e.g., npm install axios), you **must** commit the package.json and package-lock.json files.  
* Other team members must run npm install after pulling your changes to stay in sync.

## **🔐 3\. Security Maintenance**

* **Environment Variables:** If you add a new variable to .env, you **must** also add it to .env.example with a placeholder value.  
* **Audit Logs:** Periodically check the voter\_status table in MySQL to ensure the participation audit matches the total vote count.