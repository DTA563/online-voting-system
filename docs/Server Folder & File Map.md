# **📂 Server-Side File Directory Map**

This document lists every file required in the /server directory to complete the Online Voting System. Use this as a checklist during implementation.

## **📍 Server Root**

These files live directly inside the server/ folder.

* **index.js**: The main entry point. Initializes Express, connects middleware, and starts the server.  
* **.env**: (Ignored by Git) Stores sensitive credentials like DB\_PASSWORD and JWT\_SECRET.  
* **.env.example**: The template for team members to create their own .env.  
* **package.json**: Manages backend dependencies (express, mysql2, etc.).

## **📁 1\. /config (Configuration)**

* **db.js**: The database connection logic. It creates the pool that allows the rest of the app to talk to MySQL.

## **📁 2\. /models (Database Queries)**

Each file here handles the raw SQL for a specific table.

* **User.js**: Queries for finding users by ID and inserting new voters.  
* **Election.js**: Queries to create, list, and update election cycles.  
* **Position.js**: Queries to manage positions (President, Secretary) within an election.  
* **Candidate.js**: Queries to fetch candidate profiles and manifestos.  
* **Vote.js**: The most sensitive file. Handles the "Time Bucketed" insertion of ballots and status updates.

## **📁 3\. /controllers (Business Logic)**

This is "The Brain." These files take data from the request, use the Models, and send a response.

* **authController.js**: Logic for Registration and Login (handles password hashing and JWT generation).  
* **electionController.js**: Logic for an Admin to create and manage the timing of elections.  
* **candidateController.js**: Logic for fetching candidates based on a specific position or election.  
* **voteController.js**: **Critical Logic.** It checks if the election is active and if the user has already voted before allowing a ballot to be cast.  
* **resultController.js**: Logic to tally the anonymous votes and prepare them for the dashboard.

## **📁 4\. /routes (API Endpoints)**

These files define the URLs that the React frontend will call.

* **authRoutes.js**: Endpoints like /api/auth/login and /api/auth/register.  
* **electionRoutes.js**: Endpoints like /api/elections (GET) and /api/elections/create (POST).  
* **candidateRoutes.js**: Endpoints like /api/candidates/:position\_id.  
* **voteRoutes.js**: The secure endpoint: /api/votes/cast.
* **adminRoutes.js**: Endpoints for election management, protected by adminMiddleware 

## **📁 5\. /middleware (Security Checks)**

* **authMiddleware.js**: The "Security Guard." It intercept requests to routes like /api/votes/cast to verify the JWT.  
* **adminMiddleware.js**: Checks the role field in the JWT to ensure only Admins can access /api/elections/create.
* **voteMiddleware.js**: Ensures only Voters can participate in elections.

## **📁 6\. /utils (Utility Helpers)**

* **tokenGenerator.js**: Helper function to sign JWTs.  
* **timeBucketing.js**: A helper function to "round" the current time to the nearest hour (for our anonymity requirement).