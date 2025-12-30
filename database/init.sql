-- Initial Schema for Online Voting System (Normalized to 3NF)

CREATE DATABASE IF NOT EXISTS voting_system;
USE voting_system;

-- 1. Users Table
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY, -- Student ID
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('voter', 'admin') DEFAULT 'voter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Elections Table
CREATE TABLE elections (
    election_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Positions Table
CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE
);

-- 4. Candidates Table
CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    position_id INT NOT NULL,
    manifesto TEXT,
    photo_url VARCHAR(255),
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE
);

-- 5. Voter Status Table
CREATE TABLE voter_status (
    user_id VARCHAR(50) NOT NULL,
    election_id INT NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMP NOT NULL DEFAULT '1970-01-01 00:00:01',
    PRIMARY KEY (user_id, election_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (election_id) REFERENCES elections(election_id)
);

-- 6. Votes Table
CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    -- vote_hour rounded for k-anonymity (prevents timing correlation)
    vote_hour DATETIME NOT NULL, 
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id)
);

-- Initial Data (Sample Admin)
INSERT INTO users (user_id, full_name, password_hash, role) 
VALUES ('ADMIN_001', 'System Administrator', 'PLACEHOLDER_HASH', 'admin');